from datetime import timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework import serializers
from rest_framework.test import APITestCase

from bookings.creation import create_pending_booking
from bookings.models import Booking
from bookings.services import confirm_booking
from listings.models import BoatListing


class BookingOverlapBoundaryTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username="race-extra-host",
            password="strong-pass-123",
        )
        self.other_host = User.objects.create_user(
            username="race-extra-other-host",
            password="strong-pass-123",
        )
        self.renter_one = User.objects.create_user(
            username="race-extra-renter-one",
            password="strong-pass-123",
        )
        self.renter_two = User.objects.create_user(
            username="race-extra-renter-two",
            password="strong-pass-123",
        )

        self.boat = BoatListing.objects.create(
            host=self.host,
            title="Race Boundary Boat",
            description="Boat used for race-condition boundary tests.",
            boat_type="motorboat",
            location_name="Mo i Rana",
            guests=4,
            price_per_day=Decimal("1000.00"),
        )

        self.other_boat = BoatListing.objects.create(
            host=self.other_host,
            title="Other Race Boundary Boat",
            description="Other boat used for race-condition boundary tests.",
            boat_type="sailboat",
            location_name="Bodø",
            guests=5,
            price_per_day=Decimal("1200.00"),
        )

    def _date(self, offset):
        return timezone.localdate() + timedelta(days=offset)

    def _create_existing_booking(
        self,
        *,
        boat=None,
        renter=None,
        start_offset=10,
        end_offset=12,
        status="pending",
        expires_at=None,
    ):
        return Booking.objects.create(
            boat=boat or self.boat,
            renter=renter or self.renter_one,
            start_date=self._date(start_offset),
            end_date=self._date(end_offset),
            total_price=Decimal("2000.00"),
            status=status,
            expires_at=expires_at,
        )

    def test_back_to_back_booking_ranges_are_allowed(self):
        first = create_pending_booking(
            boat=self.boat,
            renter=self.renter_one,
            start_date=self._date(10),
            end_date=self._date(12),
        )

        second = create_pending_booking(
            boat=self.boat,
            renter=self.renter_two,
            start_date=self._date(12),
            end_date=self._date(14),
        )

        self.assertEqual(first.status, "pending")
        self.assertEqual(second.status, "pending")
        self.assertEqual(Booking.objects.count(), 2)

    def test_partial_overlap_at_start_is_rejected(self):
        create_pending_booking(
            boat=self.boat,
            renter=self.renter_one,
            start_date=self._date(10),
            end_date=self._date(12),
        )

        with self.assertRaises(serializers.ValidationError):
            create_pending_booking(
                boat=self.boat,
                renter=self.renter_two,
                start_date=self._date(9),
                end_date=self._date(11),
            )

        self.assertEqual(Booking.objects.count(), 1)

    def test_partial_overlap_at_end_is_rejected(self):
        create_pending_booking(
            boat=self.boat,
            renter=self.renter_one,
            start_date=self._date(10),
            end_date=self._date(12),
        )

        with self.assertRaises(serializers.ValidationError):
            create_pending_booking(
                boat=self.boat,
                renter=self.renter_two,
                start_date=self._date(11),
                end_date=self._date(13),
            )

        self.assertEqual(Booking.objects.count(), 1)

    def test_same_dates_on_different_boats_are_allowed(self):
        first = create_pending_booking(
            boat=self.boat,
            renter=self.renter_one,
            start_date=self._date(10),
            end_date=self._date(12),
        )

        second = create_pending_booking(
            boat=self.other_boat,
            renter=self.renter_two,
            start_date=self._date(10),
            end_date=self._date(12),
        )

        self.assertEqual(first.status, "pending")
        self.assertEqual(second.status, "pending")
        self.assertEqual(Booking.objects.count(), 2)

    def test_cancelled_overlapping_booking_does_not_block_new_booking_request(self):
        self._create_existing_booking(
            start_offset=10,
            end_offset=12,
            status="cancelled",
        )

        new_booking = create_pending_booking(
            boat=self.boat,
            renter=self.renter_two,
            start_date=self._date(10),
            end_date=self._date(12),
        )

        self.assertEqual(new_booking.status, "pending")
        self.assertEqual(Booking.objects.count(), 2)

    def test_expired_pending_overlapping_booking_does_not_block_new_booking_request(self):
        self._create_existing_booking(
            start_offset=10,
            end_offset=12,
            status="pending",
            expires_at=timezone.now() - timedelta(minutes=1),
        )

        new_booking = create_pending_booking(
            boat=self.boat,
            renter=self.renter_two,
            start_date=self._date(10),
            end_date=self._date(12),
        )

        self.assertEqual(new_booking.status, "pending")
        self.assertEqual(Booking.objects.count(), 2)


class BookingConfirmationOverlapBoundaryTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username="confirm-boundary-host",
            password="strong-pass-123",
        )
        self.renter_one = User.objects.create_user(
            username="confirm-boundary-renter-one",
            password="strong-pass-123",
        )
        self.renter_two = User.objects.create_user(
            username="confirm-boundary-renter-two",
            password="strong-pass-123",
        )
        self.renter_three = User.objects.create_user(
            username="confirm-boundary-renter-three",
            password="strong-pass-123",
        )

        self.boat = BoatListing.objects.create(
            host=self.host,
            title="Confirm Boundary Boat",
            description="Boat used for confirmation boundary tests.",
            boat_type="motorboat",
            location_name="Tromsø",
            guests=4,
            price_per_day=Decimal("1000.00"),
        )

    def _date(self, offset):
        return timezone.localdate() + timedelta(days=offset)

    def _pending_booking(self, *, renter, start_offset, end_offset):
        return Booking.objects.create(
            boat=self.boat,
            renter=renter,
            start_date=self._date(start_offset),
            end_date=self._date(end_offset),
            total_price=Decimal("2000.00"),
            status="pending",
        )

    def test_confirming_booking_does_not_cancel_back_to_back_pending_booking(self):
        target = self._pending_booking(
            renter=self.renter_one,
            start_offset=10,
            end_offset=12,
        )
        back_to_back = self._pending_booking(
            renter=self.renter_two,
            start_offset=12,
            end_offset=14,
        )

        confirmed = confirm_booking(booking=target)

        back_to_back.refresh_from_db()

        self.assertEqual(confirmed.status, "confirmed")
        self.assertEqual(back_to_back.status, "pending")

    def test_confirming_booking_cancels_only_overlapping_pending_bookings(self):
        target = self._pending_booking(
            renter=self.renter_one,
            start_offset=10,
            end_offset=12,
        )
        overlapping = self._pending_booking(
            renter=self.renter_two,
            start_offset=11,
            end_offset=13,
        )
        non_overlapping = self._pending_booking(
            renter=self.renter_three,
            start_offset=12,
            end_offset=14,
        )

        confirmed = confirm_booking(booking=target)

        overlapping.refresh_from_db()
        non_overlapping.refresh_from_db()

        self.assertEqual(confirmed.status, "confirmed")

        self.assertEqual(overlapping.status, "cancelled")
        self.assertEqual(overlapping.cancelled_by, "host")
        self.assertEqual(
            overlapping.cancellation_reason,
            "Another overlapping booking was confirmed for these dates.",
        )

        self.assertEqual(non_overlapping.status, "pending")
        self.assertEqual(non_overlapping.cancelled_by, "")
        self.assertEqual(non_overlapping.cancellation_reason, "")