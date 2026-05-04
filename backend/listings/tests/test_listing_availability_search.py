from datetime import timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from bookings.models import Booking
from listings.models import BoatListing


class ListingAvailabilitySearchTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username="availability-host",
            password="strong-pass-123",
        )
        self.renter = User.objects.create_user(
            username="availability-renter",
            password="strong-pass-123",
        )

        self.available_boat = BoatListing.objects.create(
            host=self.host,
            title="Available Boat",
            description="A boat that should be visible in availability search.",
            boat_type="motorboat",
            location_name="Bodø",
            guests=4,
            price_per_day=Decimal("1000.00"),
        )

        self.blocked_boat = BoatListing.objects.create(
            host=self.host,
            title="Blocked Boat",
            description="A boat that should be hidden during booked dates.",
            boat_type="motorboat",
            location_name="Bodø",
            guests=4,
            price_per_day=Decimal("1000.00"),
        )

        self.today = timezone.localdate()

    def _result_titles(self, response):
        return {boat["title"] for boat in response.json()["results"]}

    def test_listing_search_excludes_boats_with_overlapping_confirmed_booking(self):
        Booking.objects.create(
            boat=self.blocked_boat,
            renter=self.renter,
            start_date=self.today + timedelta(days=10),
            end_date=self.today + timedelta(days=15),
            total_price=Decimal("5000.00"),
            status="confirmed",
        )

        response = self.client.get(
            reverse("boat-list-create"),
            {
                "start_date": self.today + timedelta(days=12),
                "end_date": self.today + timedelta(days=14),
            },
        )

        self.assertEqual(response.status_code, 200)

        titles = self._result_titles(response)

        self.assertIn("Available Boat", titles)
        self.assertNotIn("Blocked Boat", titles)

    def test_listing_search_allows_back_to_back_booking_dates(self):
        Booking.objects.create(
            boat=self.blocked_boat,
            renter=self.renter,
            start_date=self.today + timedelta(days=10),
            end_date=self.today + timedelta(days=15),
            total_price=Decimal("5000.00"),
            status="confirmed",
        )

        response = self.client.get(
            reverse("boat-list-create"),
            {
                "start_date": self.today + timedelta(days=15),
                "end_date": self.today + timedelta(days=17),
            },
        )

        self.assertEqual(response.status_code, 200)

        titles = self._result_titles(response)

        self.assertIn("Available Boat", titles)
        self.assertIn("Blocked Boat", titles)

    def test_listing_search_excludes_boats_with_active_pending_booking(self):
        Booking.objects.create(
            boat=self.blocked_boat,
            renter=self.renter,
            start_date=self.today + timedelta(days=10),
            end_date=self.today + timedelta(days=15),
            total_price=Decimal("5000.00"),
            status="pending",
            expires_at=timezone.now() + timedelta(minutes=30),
        )

        response = self.client.get(
            reverse("boat-list-create"),
            {
                "start_date": self.today + timedelta(days=12),
                "end_date": self.today + timedelta(days=14),
            },
        )

        self.assertEqual(response.status_code, 200)

        titles = self._result_titles(response)

        self.assertIn("Available Boat", titles)
        self.assertNotIn("Blocked Boat", titles)

    def test_listing_search_ignores_cancelled_bookings(self):
        Booking.objects.create(
            boat=self.blocked_boat,
            renter=self.renter,
            start_date=self.today + timedelta(days=10),
            end_date=self.today + timedelta(days=15),
            total_price=Decimal("5000.00"),
            status="cancelled",
        )

        response = self.client.get(
            reverse("boat-list-create"),
            {
                "start_date": self.today + timedelta(days=12),
                "end_date": self.today + timedelta(days=14),
            },
        )

        self.assertEqual(response.status_code, 200)

        titles = self._result_titles(response)

        self.assertIn("Available Boat", titles)
        self.assertIn("Blocked Boat", titles)

    def test_listing_search_rejects_missing_end_date(self):
        response = self.client.get(
            reverse("boat-list-create"),
            {
                "start_date": self.today + timedelta(days=10),
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("end_date", response.json())

    def test_listing_search_rejects_end_date_before_start_date(self):
        response = self.client.get(
            reverse("boat-list-create"),
            {
                "start_date": self.today + timedelta(days=10),
                "end_date": self.today + timedelta(days=9),
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("end_date", response.json())