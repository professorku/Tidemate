from datetime import timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from bookings.models import Booking
from listings.models import BoatListing


class BookingObjectLevelPermissionRegressionTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username="booking-obj-host",
            password="strong-pass-123",
        )
        self.other_host = User.objects.create_user(
            username="booking-obj-other-host",
            password="strong-pass-123",
        )
        self.renter = User.objects.create_user(
            username="booking-obj-renter",
            password="strong-pass-123",
        )
        self.other_renter = User.objects.create_user(
            username="booking-obj-other-renter",
            password="strong-pass-123",
        )
        self.intruder = User.objects.create_user(
            username="booking-obj-intruder",
            password="strong-pass-123",
        )

        self.boat = BoatListing.objects.create(
            host=self.host,
            title="Object Permission Boat",
            description="Boat used for object-level permission tests.",
            boat_type="motorboat",
            location_name="Mo i Rana",
            guests=4,
            price_per_day=Decimal("1000.00"),
        )

        self.other_boat = BoatListing.objects.create(
            host=self.other_host,
            title="Other Host Object Permission Boat",
            description="Other host boat used for object-level permission tests.",
            boat_type="sailboat",
            location_name="Bodø",
            guests=5,
            price_per_day=Decimal("1400.00"),
        )

    def _future_range(self, start_offset=7, end_offset=10):
        today = timezone.localdate()
        return today + timedelta(days=start_offset), today + timedelta(days=end_offset)

    def _create_booking(
        self,
        *,
        boat=None,
        renter=None,
        status="pending",
        start_offset=7,
        end_offset=10,
    ):
        start_date, end_date = self._future_range(start_offset, end_offset)

        return Booking.objects.create(
            boat=boat or self.boat,
            renter=renter or self.renter,
            start_date=start_date,
            end_date=end_date,
            total_price=Decimal("3000.00"),
            status=status,
        )

    def test_my_bookings_only_returns_authenticated_renters_own_bookings(self):
        own_booking = self._create_booking(
            renter=self.renter,
            start_offset=7,
            end_offset=10,
        )
        other_booking = self._create_booking(
            renter=self.other_renter,
            start_offset=12,
            end_offset=15,
        )

        self.client.force_authenticate(user=self.renter)

        response = self.client.get(reverse("my-bookings"))

        self.assertEqual(response.status_code, 200)

        returned_ids = [item["id"] for item in response.json()["results"]]

        self.assertIn(own_booking.id, returned_ids)
        self.assertNotIn(other_booking.id, returned_ids)

    def test_host_bookings_only_returns_bookings_for_authenticated_hosts_own_boats(self):
        own_host_booking = self._create_booking(
            boat=self.boat,
            renter=self.renter,
            start_offset=7,
            end_offset=10,
        )
        other_host_booking = self._create_booking(
            boat=self.other_boat,
            renter=self.other_renter,
            start_offset=12,
            end_offset=15,
        )

        self.client.force_authenticate(user=self.host)

        response = self.client.get(reverse("host-bookings"))

        self.assertEqual(response.status_code, 200)

        returned_ids = [item["id"] for item in response.json()["results"]]

        self.assertIn(own_host_booking.id, returned_ids)
        self.assertNotIn(other_host_booking.id, returned_ids)

    def test_intruder_cannot_delete_another_users_cancelled_booking(self):
        booking = self._create_booking(status="cancelled")

        self.client.force_authenticate(user=self.intruder)

        response = self.client.delete(reverse("booking-delete", args=[booking.id]))

        self.assertEqual(response.status_code, 404)

        booking.refresh_from_db()

        self.assertIsNone(booking.archived_by_renter_at)
        self.assertIsNone(booking.archived_by_host_at)

    def test_renter_delete_archives_only_for_renter_and_host_can_still_view_booking(self):
        booking = self._create_booking(status="cancelled")

        self.client.force_authenticate(user=self.renter)

        delete_response = self.client.delete(reverse("booking-delete", args=[booking.id]))

        self.assertEqual(delete_response.status_code, 204)

        booking.refresh_from_db()

        self.assertIsNotNone(booking.archived_by_renter_at)
        self.assertIsNone(booking.archived_by_host_at)

        renter_detail_response = self.client.get(reverse("booking-detail", args=[booking.id]))
        self.assertEqual(renter_detail_response.status_code, 404)

        self.client.force_authenticate(user=self.host)

        host_detail_response = self.client.get(reverse("booking-detail", args=[booking.id]))
        self.assertEqual(host_detail_response.status_code, 200)

    def test_host_delete_archives_only_for_host_and_renter_can_still_view_booking(self):
        booking = self._create_booking(status="cancelled")

        self.client.force_authenticate(user=self.host)

        delete_response = self.client.delete(reverse("booking-delete", args=[booking.id]))

        self.assertEqual(delete_response.status_code, 204)

        booking.refresh_from_db()

        self.assertIsNone(booking.archived_by_renter_at)
        self.assertIsNotNone(booking.archived_by_host_at)

        host_detail_response = self.client.get(reverse("booking-detail", args=[booking.id]))
        self.assertEqual(host_detail_response.status_code, 404)

        self.client.force_authenticate(user=self.renter)

        renter_detail_response = self.client.get(reverse("booking-detail", args=[booking.id]))
        self.assertEqual(renter_detail_response.status_code, 200)

def test_host_bookings_list_expires_overdue_pending_booking_and_hides_confirm(self):
    booking = self._create_booking(status="pending")
    booking.expires_at = timezone.now() - timedelta(minutes=1)
    booking.save(update_fields=["expires_at"])

    self.client.force_authenticate(user=self.host)

    response = self.client.get(reverse("host-bookings"))

    self.assertEqual(response.status_code, 200)

    result = response.json()["results"][0]

    self.assertEqual(result["id"], booking.id)
    self.assertEqual(result["status"], "cancelled")
    self.assertEqual(result["lifecycle_stage"], "cancelled")
    self.assertFalse(result["can_confirm"])

    booking.refresh_from_db()

    self.assertEqual(booking.status, "cancelled")
    self.assertEqual(
        booking.cancellation_reason,
        "Booking request expired because it was not confirmed in time.",
    )

    def test_host_can_delete_expired_pending_booking(self):
        booking = self._create_booking(status="pending")
        booking.expires_at = timezone.now() - timedelta(minutes=1)
        booking.save(update_fields=["expires_at"])

        self.client.force_authenticate(user=self.host)

        response = self.client.delete(reverse("booking-delete", args=[booking.id]))

        self.assertEqual(response.status_code, 204)

        booking.refresh_from_db()

        self.assertIsNotNone(booking.archived_by_host_at)
        self.assertIsNone(booking.archived_by_renter_at)