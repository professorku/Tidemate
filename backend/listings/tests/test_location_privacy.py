from datetime import timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase

from bookings.models import Booking
from listings.models import BoatListing


class BoatLocationPrivacyTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username='location-host',
            password='strong-pass-123',
        )
        self.renter = User.objects.create_user(
            username='location-renter',
            password='strong-pass-123',
        )
        self.other_user = User.objects.create_user(
            username='location-other',
            password='strong-pass-123',
        )
        self.boat = BoatListing.objects.create(
            host=self.host,
            title='Private Location Boat',
            description='A boat with protected pickup coordinates.',
            boat_type='motorboat',
            location_name='Mo i Rana',
            pickup_address='Secret Dock 12, Mo i Rana',
            pickup_instructions='Use the private gate code near the red boathouse.',
            guests=5,
            price_per_day=Decimal('1200.00'),
            latitude=Decimal('66.312800'),
            longitude=Decimal('14.142800'),
        )

    def _detail_payload(self, user=None):
        if user:
            self.client.force_authenticate(user=user)
        else:
            self.client.force_authenticate(user=None)

        response = self.client.get(reverse('boat-detail', args=[self.boat.id]))
        self.assertEqual(response.status_code, 200)
        return response.json()

    def test_anonymous_user_only_sees_approximate_coordinates(self):
        payload = self._detail_payload()

        self.assertFalse(payload['exact_location_available'])
        self.assertEqual(payload['location_precision'], 'approximate')
        self.assertEqual(payload['location_radius_km'], 5)

        self.assertNotEqual(payload['latitude'], 66.3128)
        self.assertNotEqual(payload['longitude'], 14.1428)

        self.assertEqual(payload['latitude'], payload['approximate_latitude'])
        self.assertEqual(payload['longitude'], payload['approximate_longitude'])

        self.assertIsNone(payload['pickup_address'])
        self.assertIsNone(payload['pickup_instructions'])

    def test_public_list_response_does_not_leak_exact_pickup_fields(self):
        response = self.client.get(reverse('boat-list-create'))

        self.assertEqual(response.status_code, 200)

        result = next(
            item for item in response.json()['results']
            if item['id'] == self.boat.id
        )

        self.assertFalse(result['exact_location_available'])
        self.assertEqual(result['location_precision'], 'approximate')
        self.assertEqual(result['location_radius_km'], 5)

        self.assertNotEqual(result['latitude'], 66.3128)
        self.assertNotEqual(result['longitude'], 14.1428)

        self.assertIsNone(result['pickup_address'])
        self.assertIsNone(result['pickup_instructions'])

    def test_logged_in_user_without_confirmed_booking_only_sees_approximate_coordinates(self):
        payload = self._detail_payload(self.other_user)

        self.assertFalse(payload['exact_location_available'])
        self.assertEqual(payload['location_precision'], 'approximate')
        self.assertEqual(payload['location_radius_km'], 5)
        self.assertIsNone(payload['pickup_address'])
        self.assertIsNone(payload['pickup_instructions'])

    def test_host_sees_exact_coordinates(self):
        payload = self._detail_payload(self.host)

        self.assertTrue(payload['exact_location_available'])
        self.assertEqual(payload['location_precision'], 'exact')
        self.assertEqual(payload['location_radius_km'], 0)
        self.assertEqual(payload['latitude'], 66.3128)
        self.assertEqual(payload['longitude'], 14.1428)
        self.assertEqual(payload['pickup_address'], 'Secret Dock 12, Mo i Rana')
        self.assertEqual(
            payload['pickup_instructions'],
            'Use the private gate code near the red boathouse.',
        )

    def test_owner_mine_response_includes_exact_pickup_fields(self):
        self.client.force_authenticate(user=self.host)

        response = self.client.get(reverse('my-boats'))

        self.assertEqual(response.status_code, 200)

        result = next(
            item for item in response.json()['results']
            if item['id'] == self.boat.id
        )

        self.assertTrue(result['exact_location_available'])
        self.assertEqual(result['location_precision'], 'exact')
        self.assertEqual(result['latitude'], 66.3128)
        self.assertEqual(result['longitude'], 14.1428)
        self.assertEqual(result['pickup_address'], 'Secret Dock 12, Mo i Rana')
        self.assertEqual(
            result['pickup_instructions'],
            'Use the private gate code near the red boathouse.',
        )

    def test_renter_with_pending_booking_still_only_sees_approximate_coordinates(self):
        Booking.objects.create(
            boat=self.boat,
            renter=self.renter,
            start_date=timezone.localdate() + timedelta(days=7),
            end_date=timezone.localdate() + timedelta(days=9),
            total_price=Decimal('3600.00'),
            status='pending',
        )

        payload = self._detail_payload(self.renter)

        self.assertFalse(payload['exact_location_available'])
        self.assertEqual(payload['location_precision'], 'approximate')
        self.assertNotEqual(payload['latitude'], 66.3128)
        self.assertNotEqual(payload['longitude'], 14.1428)
        self.assertIsNone(payload['pickup_address'])
        self.assertIsNone(payload['pickup_instructions'])

    def test_renter_with_confirmed_booking_sees_exact_coordinates(self):
        Booking.objects.create(
            boat=self.boat,
            renter=self.renter,
            start_date=timezone.localdate() + timedelta(days=7),
            end_date=timezone.localdate() + timedelta(days=9),
            total_price=Decimal('3600.00'),
            status='confirmed',
        )

        payload = self._detail_payload(self.renter)

        self.assertTrue(payload['exact_location_available'])
        self.assertEqual(payload['location_precision'], 'exact')
        self.assertEqual(payload['latitude'], 66.3128)
        self.assertEqual(payload['longitude'], 14.1428)
        self.assertEqual(payload['pickup_address'], 'Secret Dock 12, Mo i Rana')
        self.assertEqual(
            payload['pickup_instructions'],
            'Use the private gate code near the red boathouse.',
        )

    def test_renter_with_cancelled_booking_does_not_see_exact_coordinates(self):
        Booking.objects.create(
            boat=self.boat,
            renter=self.renter,
            start_date=timezone.localdate() + timedelta(days=7),
            end_date=timezone.localdate() + timedelta(days=9),
            total_price=Decimal('3600.00'),
            status='cancelled',
        )

        payload = self._detail_payload(self.renter)

        self.assertFalse(payload['exact_location_available'])
        self.assertEqual(payload['location_precision'], 'approximate')
        self.assertIsNone(payload['pickup_address'])
        self.assertIsNone(payload['pickup_instructions'])

    def test_booking_detail_uses_same_location_privacy_rule(self):
        booking = Booking.objects.create(
            boat=self.boat,
            renter=self.renter,
            start_date=timezone.localdate() + timedelta(days=7),
            end_date=timezone.localdate() + timedelta(days=9),
            total_price=Decimal('3600.00'),
            status='pending',
        )

        self.client.force_authenticate(user=self.renter)
        response = self.client.get(reverse('booking-detail', args=[booking.id]))

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertFalse(payload['exact_location_available'])
        self.assertEqual(payload['location_precision'], 'approximate')
        self.assertIsNone(payload['pickup_address'])
        self.assertIsNone(payload['pickup_instructions'])

        booking.status = 'confirmed'
        booking.save(update_fields=['status'])

        response = self.client.get(reverse('booking-detail', args=[booking.id]))

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload['exact_location_available'])
        self.assertEqual(payload['location_precision'], 'exact')
        self.assertEqual(payload['latitude'], 66.3128)
        self.assertEqual(payload['longitude'], 14.1428)
        self.assertEqual(payload['pickup_address'], 'Secret Dock 12, Mo i Rana')
        self.assertEqual(
            payload['pickup_instructions'],
            'Use the private gate code near the red boathouse.',
        )