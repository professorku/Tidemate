from datetime import timedelta
from decimal import Decimal
from datetime import date

from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from bookings.models import Booking
from listings.models import BoatListing
from bookings.services import confirm_booking


class BookingTimelineFilterTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='host', password='strong-pass-123')
        self.renter = User.objects.create_user(username='renter', password='strong-pass-123')
        self.boat = BoatListing.objects.create(
            host=self.host,
            title='Nordic Cruiser',
            description='Ready for the fjord.',
            boat_type='motorboat',
            location_name='Mo i Rana',
            guests=6,
            price_per_day=Decimal('1500.00'),
        )
        self.client.force_authenticate(user=self.renter)

    def _create_booking(self, *, start_delta_days, end_delta_days, status):
        today = timezone.localdate()
        return Booking.objects.create(
            boat=self.boat,
            renter=self.renter,
            start_date=today + timedelta(days=start_delta_days),
            end_date=today + timedelta(days=end_delta_days),
            total_price=Decimal('3000.00'),
            status=status,
        )

    def test_my_bookings_timeline_filters_are_applied_in_the_database_layer(self):
        upcoming = self._create_booking(start_delta_days=2, end_delta_days=3, status='confirmed')
        active = self._create_booking(start_delta_days=-1, end_delta_days=1, status='confirmed')
        completed = self._create_booking(start_delta_days=-5, end_delta_days=-2, status='confirmed')
        pending = self._create_booking(start_delta_days=4, end_delta_days=5, status='pending')
        cancelled = self._create_booking(start_delta_days=6, end_delta_days=7, status='cancelled')

        cases = {
            'upcoming': upcoming.id,
            'active': active.id,
            'completed': completed.id,
            'pending': pending.id,
            'cancelled': cancelled.id,
        }

        for timeline, booking_id in cases.items():
            with self.subTest(timeline=timeline):
                response = self.client.get(reverse('my-bookings'), {'timeline': timeline})
                self.assertEqual(response.status_code, 200)
                returned_ids = [item['id'] for item in response.json()['results']]
                self.assertEqual(returned_ids, [booking_id])

from rest_framework import serializers

from bookings.creation import create_pending_booking


class BookingCreationRaceConditionTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='host-race', password='strong-pass-123')
        self.renter_one = User.objects.create_user(username='renter-one', password='strong-pass-123')
        self.renter_two = User.objects.create_user(username='renter-two', password='strong-pass-123')
        self.boat = BoatListing.objects.create(
            host=self.host,
            title='Race Safe Boat',
            description='Ready for concurrent booking tests.',
            boat_type='motorboat',
            location_name='Bodø',
            guests=4,
            price_per_day=Decimal('900.00'),
        )

    def test_second_overlapping_booking_is_rejected_when_creation_is_rechecked_under_lock(self):
        today = timezone.localdate()
        first = create_pending_booking(
            boat=self.boat,
            renter=self.renter_one,
            start_date=today + timedelta(days=3),
            end_date=today + timedelta(days=5),
        )
        self.assertEqual(first.status, 'pending')

        with self.assertRaises(serializers.ValidationError):
            create_pending_booking(
                boat=self.boat,
                renter=self.renter_two,
                start_date=today + timedelta(days=4),
                end_date=today + timedelta(days=6),
            )

        self.assertEqual(Booking.objects.count(), 1)


class BookingConfirmationRaceConditionTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='host-confirm', password='strong-pass-123')
        self.renter_one = User.objects.create_user(username='confirm-renter-one', password='strong-pass-123')
        self.renter_two = User.objects.create_user(username='confirm-renter-two', password='strong-pass-123')
        self.boat = BoatListing.objects.create(
            host=self.host,
            title='Confirmation Safe Boat',
            description='Ready for confirmation locking tests.',
            boat_type='motorboat',
            location_name='Tromsø',
            guests=5,
            price_per_day=Decimal('1100.00'),
        )

    def _create_pending(self, renter, start_delta_days, end_delta_days):
        today = timezone.localdate()
        return Booking.objects.create(
            boat=self.boat,
            renter=renter,
            start_date=today + timedelta(days=start_delta_days),
            end_date=today + timedelta(days=end_delta_days),
            total_price=Decimal('3300.00'),
            status='pending',
        )

    def test_confirmation_rechecks_for_existing_confirmed_overlap_under_lock(self):
        today = timezone.localdate()

        confirmed_booking = Booking.objects.create(
            renter=self.renter_one,
            boat=self.boat,
            start_date=today + timedelta(days=3),
            end_date=today + timedelta(days=5),
            total_price=Decimal('3300.00'),
            status='confirmed',
        )

        pending_booking = Booking.objects.create(
            renter=self.renter_two,
            boat=self.boat,
            start_date=today + timedelta(days=4),
            end_date=today + timedelta(days=6),
            total_price=Decimal('3300.00'),
            status='pending',
        )

        with self.assertRaisesMessage(
            ValueError,
            'These dates are no longer available because another overlapping booking was already confirmed.',
        ):
            confirm_booking(booking=pending_booking)

        confirmed_booking.refresh_from_db()
        pending_booking.refresh_from_db()

        self.assertEqual(confirmed_booking.status, 'confirmed')
        self.assertEqual(pending_booking.status, 'pending')

    def test_confirmation_cancels_other_overlapping_pending_bookings(self):
        target = self._create_pending(self.renter_one, 8, 10)
        overlapping = self._create_pending(self.renter_two, 9, 11)

        confirmed = confirm_booking(booking=target)
        overlapping.refresh_from_db()

        self.assertEqual(confirmed.status, 'confirmed')
        self.assertEqual(overlapping.status, 'cancelled')
        self.assertEqual(overlapping.cancelled_by, 'host')
        self.assertEqual(
            overlapping.cancellation_reason,
            'Another overlapping booking was confirmed for these dates.',
        )


class BookingConfirmationApiRaceConditionTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username='host-confirm-api',
            password='strong-pass-123',
        )
        self.renter_one = User.objects.create_user(
            username='confirm-api-renter-one',
            password='strong-pass-123',
        )
        self.renter_two = User.objects.create_user(
            username='confirm-api-renter-two',
            password='strong-pass-123',
        )
        self.boat = BoatListing.objects.create(
            host=self.host,
            title='API Confirmation Safe Boat',
            description='Ready for API confirmation locking tests.',
            boat_type='motorboat',
            location_name='Tromsø',
            guests=5,
            price_per_day=Decimal('1100.00'),
        )

    def test_confirm_endpoint_rejects_pending_booking_if_overlap_was_confirmed_first(self):
        today = timezone.localdate()

        confirmed_booking = Booking.objects.create(
            renter=self.renter_one,
            boat=self.boat,
            start_date=today + timedelta(days=3),
            end_date=today + timedelta(days=5),
            total_price=Decimal('3300.00'),
            status='confirmed',
        )

        pending_booking = Booking.objects.create(
            renter=self.renter_two,
            boat=self.boat,
            start_date=today + timedelta(days=4),
            end_date=today + timedelta(days=6),
            total_price=Decimal('3300.00'),
            status='pending',
        )

        self.client.force_authenticate(user=self.host)

        response = self.client.post(
            reverse('booking-confirm', args=[pending_booking.id]),
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()['detail'],
            'These dates are no longer available because another overlapping booking was already confirmed.',
        )

        confirmed_booking.refresh_from_db()
        pending_booking.refresh_from_db()

        self.assertEqual(confirmed_booking.status, 'confirmed')
        self.assertEqual(pending_booking.status, 'pending')


class BookingMutationErrorHandlingTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='host-mutation', password='strong-pass-123')
        self.renter = User.objects.create_user(username='renter-mutation', password='strong-pass-123')
        self.boat = BoatListing.objects.create(
            host=self.host,
            title='Mutation Boat',
            description='Mutation test boat.',
            boat_type='motorboat',
            location_name='Narvik',
            guests=4,
            price_per_day=Decimal('1400.00'),
        )
        today = timezone.localdate()
        self.booking = Booking.objects.create(
            boat=self.boat,
            renter=self.renter,
            start_date=today + timedelta(days=5),
            end_date=today + timedelta(days=6),
            total_price=Decimal('2800.00'),
            status='pending',
        )

    def test_cancel_returns_400_for_serializer_validation_errors(self):
        self.client.force_authenticate(user=self.renter)

        response = self.client.post(
            reverse('booking-cancel', args=[self.booking.id]),
            {'reason': ['not-a-valid-string']},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('reason', response.json())
