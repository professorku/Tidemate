from datetime import timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from bookings.models import Booking
from listings.models import BoatListing


class MyReviewableBookingsPaginationTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='review-host', password='strong-pass-123')
        self.renter = User.objects.create_user(username='review-renter', password='strong-pass-123')
        self.boat = BoatListing.objects.create(
            host=self.host,
            title='Review Boat',
            description='Ready for review pagination.',
            boat_type='motorboat',
            location_name='Tromsø',
            guests=6,
            price_per_day=Decimal('1100.00'),
        )
        today = timezone.localdate()
        for idx in range(9):
            Booking.objects.create(
                boat=self.boat,
                renter=self.renter,
                start_date=today - timedelta(days=20 + idx * 3),
                end_date=today - timedelta(days=18 + idx * 3),
                total_price=Decimal('2200.00'),
                status='confirmed',
            )
        self.client.force_authenticate(user=self.renter)

    def test_reviewable_bookings_are_paginated(self):
        response = self.client.get(reverse('my-reviewable-bookings'))

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data['count'], 9)
        self.assertEqual(data['page_size'], 8)
        self.assertEqual(len(data['results']), 8)
