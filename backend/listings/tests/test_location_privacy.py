from datetime import date, datetime, timedelta
from decimal import Decimal
from unittest import mock

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

    def _aware_datetime(self, year, month, day, hour=12, minute=0):
        return timezone.make_aware(
            datetime(year, month, day, hour, minute),
            timezone.get_current_timezone(),
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
        self.assertEqual(payload['location_radius_km'], 20)

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
        self.assertEqual(result['location_radius_km'], 20)

        self.assertNotEqual(result['latitude'], 66.3128)
        self.assertNotEqual(result['longitude'], 14.1428)

        self.assertIsNone(result['pickup_address'])
        self.assertIsNone(result['pickup_instructions'])

    def test_logged_in_user_without_confirmed_booking_only_sees_approximate_coordinates(self):
        payload = self._detail_payload(self.other_user)

        self.assertFalse(payload['exact_location_available'])
        self.assertEqual(payload['location_precision'], 'approximate')
        self.assertEqual(payload['location_radius_km'], 20)
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

    def test_confirmed_renter_before_24_hour_window_only_sees_approximate_coordinates(self):
        Booking.objects.create(
            boat=self.boat,
            renter=self.renter,
            start_date=date(2026, 1, 11),
            end_date=date(2026, 1, 13),
            total_price=Decimal('3600.00'),
            status='confirmed',
        )

        # Pickup is 2026-01-11 at 15:00. Exact location should not be visible
        # before 2026-01-10 at 15:00.
        before_disclosure_window = self._aware_datetime(2026, 1, 10, 12, 0)

        with mock.patch(
            'listings.services.location_privacy.timezone.now',
            return_value=before_disclosure_window,
        ):
            payload = self._detail_payload(self.renter)

        self.assertFalse(payload['exact_location_available'])
        self.assertEqual(payload['location_precision'], 'approximate')
        self.assertNotEqual(payload['latitude'], 66.3128)
        self.assertNotEqual(payload['longitude'], 14.1428)
        self.assertIsNone(payload['pickup_address'])
        self.assertIsNone(payload['pickup_instructions'])

    def test_confirmed_renter_within_24_hour_window_sees_exact_coordinates(self):
        Booking.objects.create(
            boat=self.boat,
            renter=self.renter,
            start_date=date(2026, 1, 11),
            end_date=date(2026, 1, 13),
            total_price=Decimal('3600.00'),
            status='confirmed',
        )

        # Pickup is 2026-01-11 at 15:00. Exact location becomes visible from
        # 2026-01-10 at 15:00 and remains visible until return time.
        inside_disclosure_window = self._aware_datetime(2026, 1, 10, 16, 0)

        with mock.patch(
            'listings.services.location_privacy.timezone.now',
            return_value=inside_disclosure_window,
        ):
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

    def test_confirmed_renter_after_return_time_only_sees_approximate_coordinates(self):
        Booking.objects.create(
            boat=self.boat,
            renter=self.renter,
            start_date=date(2026, 1, 7),
            end_date=date(2026, 1, 9),
            total_price=Decimal('3600.00'),
            status='confirmed',
        )

        # Return is 2026-01-09 at 12:00, so exact pickup info should be hidden again.
        after_return_time = self._aware_datetime(2026, 1, 10, 12, 0)

        with mock.patch(
            'listings.services.location_privacy.timezone.now',
            return_value=after_return_time,
        ):
            payload = self._detail_payload(self.renter)

        self.assertFalse(payload['exact_location_available'])
        self.assertEqual(payload['location_precision'], 'approximate')
        self.assertNotEqual(payload['latitude'], 66.3128)
        self.assertNotEqual(payload['longitude'], 14.1428)
        self.assertIsNone(payload['pickup_address'])
        self.assertIsNone(payload['pickup_instructions'])

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

    def test_booking_detail_uses_the_specific_booking_location_privacy_rule(self):
        booking = Booking.objects.create(
            boat=self.boat,
            renter=self.renter,
            start_date=date(2026, 1, 11),
            end_date=date(2026, 1, 13),
            total_price=Decimal('3600.00'),
            status='pending',
        )

        inside_disclosure_window = self._aware_datetime(2026, 1, 10, 16, 0)

        self.client.force_authenticate(user=self.renter)
        with mock.patch(
            'listings.services.location_privacy.timezone.now',
            return_value=inside_disclosure_window,
        ):
            response = self.client.get(reverse('booking-detail', args=[booking.id]))

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertFalse(payload['exact_location_available'])
        self.assertEqual(payload['location_precision'], 'approximate')
        self.assertIsNone(payload['pickup_address'])
        self.assertIsNone(payload['pickup_instructions'])

        booking.status = 'confirmed'
        booking.save(update_fields=['status'])

        with mock.patch(
            'listings.services.location_privacy.timezone.now',
            return_value=inside_disclosure_window,
        ):
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