from datetime import timedelta
from decimal import Decimal

from django.conf import settings
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from django.test import RequestFactory
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from bookings.models import Booking
from listings.models import BoatListing


class BookingAuthorizationSecurityTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username='booking-host',
            password='strong-pass-123',
        )
        self.other_host = User.objects.create_user(
            username='other-booking-host',
            password='strong-pass-123',
        )
        self.renter = User.objects.create_user(
            username='booking-renter',
            password='strong-pass-123',
        )
        self.intruder = User.objects.create_user(
            username='booking-intruder',
            password='strong-pass-123',
        )

        self.boat = BoatListing.objects.create(
            host=self.host,
            title='Booking Security Boat',
            description='A boat used for booking authorization tests.',
            boat_type='motorboat',
            location_name='Mo i Rana',
            guests=4,
            price_per_day=Decimal('1000.00'),
        )

    def _future_range(self, start_offset=7, end_offset=10):
        today = timezone.localdate()
        return today + timedelta(days=start_offset), today + timedelta(days=end_offset)

    def _booking_payload(self):
        start_date, end_date = self._future_range()
        return {
            'boat': self.boat.id,
            'start_date': start_date.isoformat(),
            'end_date': end_date.isoformat(),
        }

    def _create_booking(self, *, renter=None, status='pending'):
        start_date, end_date = self._future_range()
        return Booking.objects.create(
            boat=self.boat,
            renter=renter or self.renter,
            start_date=start_date,
            end_date=end_date,
            total_price=Decimal('3000.00'),
            status=status,
        )

    def test_unauthenticated_user_cannot_create_booking(self):
        response = self.client.post(
            reverse('booking-create'),
            self._booking_payload(),
            format='json',
        )

        self.assertIn(response.status_code, [401, 403])
        self.assertEqual(Booking.objects.count(), 0)

    def test_booking_create_ignores_client_supplied_renter_status_and_total_price(self):
        self.client.force_authenticate(user=self.renter)

        payload = self._booking_payload()
        payload.update({
            'renter': self.intruder.id,
            'renter_id': self.intruder.id,
            'status': 'confirmed',
            'total_price': '0.01',
        })

        response = self.client.post(
            reverse('booking-create'),
            payload,
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        booking = Booking.objects.get()
        self.assertEqual(booking.renter, self.renter)
        self.assertEqual(booking.status, 'pending')
        self.assertEqual(booking.total_price, Decimal('3000.00'))

    def test_user_cannot_book_own_boat(self):
        self.client.force_authenticate(user=self.host)

        response = self.client.post(
            reverse('booking-create'),
            self._booking_payload(),
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('boat', response.json())
        self.assertEqual(Booking.objects.count(), 0)

    def test_unrelated_user_cannot_view_booking_detail(self):
        booking = self._create_booking()
        self.client.force_authenticate(user=self.intruder)

        response = self.client.get(reverse('booking-detail', args=[booking.id]))

        self.assertEqual(response.status_code, 404)

    def test_renter_and_host_can_view_booking_detail(self):
        booking = self._create_booking()

        self.client.force_authenticate(user=self.renter)
        renter_response = self.client.get(reverse('booking-detail', args=[booking.id]))
        self.assertEqual(renter_response.status_code, 200)

        self.client.force_authenticate(user=self.host)
        host_response = self.client.get(reverse('booking-detail', args=[booking.id]))
        self.assertEqual(host_response.status_code, 200)

    def test_renter_cannot_confirm_own_booking(self):
        booking = self._create_booking()
        self.client.force_authenticate(user=self.renter)

        response = self.client.post(reverse('booking-confirm', args=[booking.id]))

        self.assertEqual(response.status_code, 404)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'pending')

    def test_other_host_cannot_confirm_booking_for_someone_elses_boat(self):
        booking = self._create_booking()
        self.client.force_authenticate(user=self.other_host)

        response = self.client.post(reverse('booking-confirm', args=[booking.id]))

        self.assertEqual(response.status_code, 404)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'pending')

    def test_unrelated_user_cannot_cancel_booking(self):
        booking = self._create_booking(status='confirmed')
        self.client.force_authenticate(user=self.intruder)

        response = self.client.post(
            reverse('booking-cancel', args=[booking.id]),
            {'reason': 'Trying to tamper with another booking.'},
            format='json',
        )

        self.assertEqual(response.status_code, 404)
        booking.refresh_from_db()
        self.assertEqual(booking.status, 'confirmed')
        self.assertEqual(booking.cancellation_reason, '')


class BookingCookieCsrfSecurityTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username='csrf-booking-host',
            password='strong-pass-123',
        )
        self.renter = User.objects.create_user(
            username='csrf-booking-renter',
            password='strong-pass-123',
        )
        self.boat = BoatListing.objects.create(
            host=self.host,
            title='CSRF Booking Boat',
            description='A boat used for booking CSRF checks.',
            boat_type='motorboat',
            location_name='Bodø',
            guests=4,
            price_per_day=Decimal('900.00'),
        )

    def _payload(self):
        today = timezone.localdate()
        return {
            'boat': self.boat.id,
            'start_date': (today + timedelta(days=12)).isoformat(),
            'end_date': (today + timedelta(days=14)).isoformat(),
        }

    def _cookie_authenticated_client(self, *, with_csrf=False):
        client = APIClient(enforce_csrf_checks=True)
        client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = str(
            RefreshToken.for_user(self.renter).access_token
        )

        if with_csrf:
            request = RequestFactory().get('/')
            csrf_token = get_token(request)
            csrf_cookie = request.META['CSRF_COOKIE']
            client.cookies[settings.CSRF_COOKIE_NAME] = csrf_cookie
            client.credentials(HTTP_X_CSRFTOKEN=csrf_token)

        return client

    def test_create_booking_requires_csrf_when_authenticated_by_cookie(self):
        client = self._cookie_authenticated_client()

        response = client.post(
            reverse('booking-create'),
            self._payload(),
            format='json',
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(Booking.objects.count(), 0)

    def test_create_booking_succeeds_with_matching_csrf_token(self):
        client = self._cookie_authenticated_client(with_csrf=True)

        response = client.post(
            reverse('booking-create'),
            self._payload(),
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Booking.objects.count(), 1)