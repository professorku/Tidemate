from decimal import Decimal
from io import BytesIO
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth.models import User
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.middleware.csrf import get_token
from django.test import RequestFactory, TestCase, override_settings
from django.urls import reverse
from PIL import Image
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from listings.models import BoatListing
from listings.serializers import BoatListingSerializer
from listings.services.marine_conditions import get_boat_conditions


class BoatListingUploadValidationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='host-images',
            password='strong-pass-123',
        )

    def _base_payload(self):
        return {
            'title': 'Upload Test Boat',
            'description': 'Testing image validation.',
            'boat_type': 'motorboat',
            'location_name': 'Mo i Rana',
            'guests': 5,
            'price_per_day': '1200.00',
        }

    def _valid_image_upload(self, name='boat.png', image_format='PNG', content_type='image/png'):
        image = Image.new('RGB', (16, 16), color='white')
        output = BytesIO()
        image.save(output, format=image_format)
        output.seek(0)

        return SimpleUploadedFile(
            name,
            output.getvalue(),
            content_type=content_type,
        )

    def test_new_images_reject_non_image_content_type(self):
        serializer = BoatListingSerializer(
            data={
                **self._base_payload(),
                'new_images': [
                    SimpleUploadedFile(
                        'notes.txt',
                        b'not-an-image',
                        content_type='text/plain',
                    )
                ],
            },
            context={'request': type('Req', (), {'user': self.user})()},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn('new_images', serializer.errors)

    def test_new_images_reject_more_than_max_count(self):
        serializer = BoatListingSerializer(
            data={
                **self._base_payload(),
                'new_images': [
                    SimpleUploadedFile(
                        f'image-{idx}.png',
                        b'fake',
                        content_type='image/png',
                    )
                    for idx in range(11)
                ],
            },
            context={'request': type('Req', (), {'user': self.user})()},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn('new_images', serializer.errors)

    def test_new_images_reject_renamed_non_image_with_image_content_type(self):
        serializer = BoatListingSerializer(
            data={
                **self._base_payload(),
                'new_images': [
                    SimpleUploadedFile(
                        'fake.png',
                        b'not-really-a-png-file',
                        content_type='image/png',
                    )
                ],
            },
            context={'request': type('Req', (), {'user': self.user})()},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn('new_images', serializer.errors)

    def test_new_images_accept_valid_image_and_sanitize_filename(self):
        serializer = BoatListingSerializer(
            data={
                **self._base_payload(),
                'new_images': [
                    self._valid_image_upload(),
                ],
            },
            context={'request': type('Req', (), {'user': self.user})()},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        sanitized_upload = serializer.validated_data['new_images'][0]

        self.assertTrue(sanitized_upload.name.endswith('_sanitized.jpg'))
        self.assertEqual(sanitized_upload.content_type, 'image/jpeg')
        self.assertGreater(sanitized_upload.size, 0)

    def test_new_images_sanitize_transparent_png_as_png(self):
        image = Image.new('RGBA', (16, 16), color=(255, 255, 255, 0))
        output = BytesIO()
        image.save(output, format='PNG')
        output.seek(0)

        serializer = BoatListingSerializer(
            data={
                **self._base_payload(),
                'new_images': [
                    SimpleUploadedFile(
                        'transparent.png',
                        output.getvalue(),
                        content_type='image/png',
                    )
                ],
            },
            context={'request': type('Req', (), {'user': self.user})()},
        )

        self.assertTrue(serializer.is_valid(), serializer.errors)

        sanitized_upload = serializer.validated_data['new_images'][0]

        self.assertTrue(sanitized_upload.name.endswith('_sanitized.png'))
        self.assertEqual(sanitized_upload.content_type, 'image/png')
        self.assertGreater(sanitized_upload.size, 0)


class BoatListingCsrfProtectionTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username='listing-csrf-host',
            password='strong-pass-123',
        )

    def _payload(self):
        return {
            'title': 'CSRF Protected Boat',
            'description': 'This is a valid listing created through the API.',
            'boat_type': 'motorboat',
            'location_name': 'Mo i Rana',
            'pickup_address': 'Private Dock 4',
            'pickup_instructions': 'Meet by the blue gate.',
            'guests': 4,
            'price_per_day': '1200.00',
            'latitude': '66.312800',
            'longitude': '14.142800',
        }

    def _cookie_authenticated_client(self, *, with_csrf=False):
        client = APIClient(enforce_csrf_checks=True)
        client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = str(
            RefreshToken.for_user(self.host).access_token
        )

        if with_csrf:
            request = RequestFactory().get('/')
            csrf_token = get_token(request)
            csrf_cookie = request.META['CSRF_COOKIE']

            client.cookies[settings.CSRF_COOKIE_NAME] = csrf_cookie
            client.credentials(HTTP_X_CSRFTOKEN=csrf_token)

        return client

    def test_create_listing_requires_csrf_when_authenticated_by_cookie(self):
        client = self._cookie_authenticated_client()

        response = client.post(
            reverse('boat-list-create'),
            self._payload(),
            format='json',
        )

        self.assertEqual(response.status_code, 403)

    def test_create_listing_succeeds_with_matching_csrf_token(self):
        client = self._cookie_authenticated_client(with_csrf=True)

        response = client.post(
            reverse('boat-list-create'),
            self._payload(),
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['title'], 'CSRF Protected Boat')
        self.assertTrue(response.json()['exact_location_available'])
        self.assertEqual(response.json()['pickup_address'], 'Private Dock 4')


class BoatConditionsErrorHandlingTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username='conditions-host',
            password='strong-pass-123',
        )
        self.boat = BoatListing.objects.create(
            host=self.host,
            title='Forecast Boat',
            description='Weather test.',
            boat_type='motorboat',
            location_name='Bodø',
            guests=4,
            price_per_day=Decimal('1000.00'),
            latitude='67.2804',
            longitude='14.4049',
        )

    @patch('listings.views.get_boat_conditions', side_effect=ValueError('bad coordinates'))
    def test_boat_conditions_returns_400_for_invalid_coordinates(self, _mock_conditions):
        response = self.client.get(reverse('boat-conditions', args=[self.boat.id]))

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()['detail'],
            'This boat has invalid map coordinates.',
        )

    @patch(
        'listings.views.get_boat_conditions',
        side_effect=__import__(
            'listings.services.marine_conditions',
            fromlist=['MarineConditionsError'],
        ).MarineConditionsError('service down'),
    )
    def test_boat_conditions_returns_502_for_forecast_service_failures(self, _mock_conditions):
        response = self.client.get(reverse('boat-conditions', args=[self.boat.id]))

        self.assertEqual(response.status_code, 502)
        self.assertEqual(
            response.json()['detail'],
            'Could not fetch forecast data right now.',
        )


class ListingPaginationContractTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username='page-host',
            password='strong-pass-123',
        )
        self.boat = BoatListing.objects.create(
            host=self.host,
            title='Paginated Boat',
            description='Pagination contract test.',
            boat_type='motorboat',
            location_name='Bodø',
            guests=4,
            price_per_day=Decimal('1000.00'),
        )

    def test_public_listings_reject_limit_parameter(self):
        response = self.client.get(reverse('boat-list-create'), {'limit': 6})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()['detail'],
            'Use page and page_size for listing pagination. The limit parameter is not supported.',
        )

    def test_my_listings_reject_limit_parameter(self):
        self.client.force_authenticate(user=self.host)

        response = self.client.get(reverse('my-boats'), {'limit': 6})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()['detail'],
            'Use page and page_size for listing pagination. The limit parameter is not supported.',
        )


class BoatCoverImageSourceOfTruthTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='cover-host',
            password='strong-pass-123',
        )
        self.boat = BoatListing.objects.create(
            host=self.user,
            title='Cover Boat',
            description='Cover image test.',
            boat_type='motorboat',
            location_name='Mo i Rana',
            guests=5,
            price_per_day=Decimal('900.00'),
        )

    def test_boat_image_property_comes_from_cover_flag(self):
        from listings.models import BoatImage

        first = BoatImage.objects.create(
            boat=self.boat,
            image=SimpleUploadedFile(
                'gallery-1.jpg',
                b'first-image',
                content_type='image/jpeg',
            ),
            is_cover=False,
            sort_order=0,
        )
        second = BoatImage.objects.create(
            boat=self.boat,
            image=SimpleUploadedFile(
                'gallery-2.jpg',
                b'second-image',
                content_type='image/jpeg',
            ),
            is_cover=True,
            sort_order=1,
        )

        self.assertEqual(self.boat.image.name, second.image.name)
        self.assertNotEqual(self.boat.image.name, first.image.name)

    def test_serializer_image_matches_cover_image_url(self):
        from listings.models import BoatImage

        cover = BoatImage.objects.create(
            boat=self.boat,
            image=SimpleUploadedFile(
                'gallery-cover.jpg',
                b'cover-image',
                content_type='image/jpeg',
            ),
            is_cover=True,
            sort_order=0,
        )

        serializer = BoatListingSerializer(instance=self.boat, context={})

        self.assertEqual(serializer.data['image'], cover.image.url)
        self.assertEqual(serializer.data['images'][0]['image'], cover.image.url)


class ListingSearchValidationTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username='search-host',
            password='strong-pass-123',
        )

        BoatListing.objects.create(
            host=self.host,
            title='Search Test Boat',
            description='A boat used for search validation tests.',
            boat_type='motorboat',
            location_name='Bodø',
            guests=4,
            price_per_day=Decimal('1200.00'),
            latitude='67.280400',
            longitude='14.404900',
        )

    def test_invalid_min_price_returns_400(self):
        response = self.client.get(
            reverse('boat-list-create'),
            {'min_price': 'abc'},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('min_price', response.json())

    def test_invalid_max_price_returns_400(self):
        response = self.client.get(
            reverse('boat-list-create'),
            {'max_price': 'not-a-number'},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('max_price', response.json())

    def test_invalid_min_guests_returns_400(self):
        response = self.client.get(
            reverse('boat-list-create'),
            {'min_guests': '2.5'},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('min_guests', response.json())

    def test_negative_min_guests_returns_400(self):
        response = self.client.get(
            reverse('boat-list-create'),
            {'min_guests': '-1'},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('min_guests', response.json())

    def test_invalid_boat_type_returns_400(self):
        response = self.client.get(
            reverse('boat-list-create'),
            {'boat_type': 'spaceship'},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('boat_type', response.json())

    def test_max_price_lower_than_min_price_returns_400(self):
        response = self.client.get(
            reverse('boat-list-create'),
            {
                'min_price': '2000',
                'max_price': '1000',
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('max_price', response.json())

    def test_valid_numeric_filters_still_work(self):
        response = self.client.get(
            reverse('boat-list-create'),
            {
                'min_guests': '2',
                'min_price': '1000',
                'max_price': '1500',
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.json()['results']), 1)

    def test_invalid_radius_params_return_400(self):
        response = self.client.get(
            reverse('boat-list-create'),
            {
                'latitude': 'abc',
                'longitude': '14.4049',
                'radius_km': '25',
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('latitude', response.json())

    def test_partial_radius_params_return_400(self):
        response = self.client.get(
            reverse('boat-list-create'),
            {
                'latitude': '67.2804',
                'radius_km': '25',
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('longitude', response.json())

    def test_host_id_filter_returns_only_that_hosts_boats(self):
        other_host = User.objects.create_user(
            username='other-search-host',
            password='strong-pass-123',
        )

        BoatListing.objects.create(
            host=other_host,
            title='Other Host Boat',
            description='A boat that belongs to another host.',
            boat_type='sailboat',
            location_name='Trondheim',
            guests=6,
            price_per_day=Decimal('2000.00'),
        )

        response = self.client.get(
            reverse('boat-list-create'),
            {'host_id': str(self.host.id)},
        )

        self.assertEqual(response.status_code, 200)

        results = response.json()['results']
        self.assertGreaterEqual(len(results), 1)
        self.assertTrue(
            all(result['host_id'] == self.host.id for result in results)
        )

    def test_invalid_host_id_returns_400(self):
        response = self.client.get(
            reverse('boat-list-create'),
            {'host_id': 'abc'},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('host_id', response.json())

    def test_negative_host_id_returns_400(self):
        response = self.client.get(
            reverse('boat-list-create'),
            {'host_id': '-1'},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('host_id', response.json())

    @override_settings(
        LISTING_SEARCH_MAX_LIMIT=5,
        LISTING_SEARCH_FALLBACK_MIN_CANDIDATES=5,
        LISTING_SEARCH_FALLBACK_MAX_CANDIDATES=5,
    )
    def test_public_radius_search_includes_older_nearby_boats_beyond_old_fallback_cap(self):
        older_nearby_boat = BoatListing.objects.create(
            host=self.host,
            title='Older Nearby Boat',
            description='This boat should not be missed just because it is older.',
            boat_type='motorboat',
            location_name='Mo i Rana',
            guests=4,
            price_per_day=Decimal('1100.00'),
            latitude='66.312800',
            longitude='14.142800',
        )

        for index in range(12):
            BoatListing.objects.create(
                host=self.host,
                title=f'Newer Far Away Boat {index}',
                description='This newer boat is far away from the search center.',
                boat_type='motorboat',
                location_name='Tromsø',
                guests=4,
                price_per_day=Decimal('1100.00'),
                latitude='69.649200',
                longitude='18.955300',
            )

        response = self.client.get(
            reverse('boat-list-create'),
            {
                'latitude': str(older_nearby_boat.public_latitude),
                'longitude': str(older_nearby_boat.public_longitude),
                'radius_km': '3',
            },
        )

        self.assertEqual(response.status_code, 200)

        result_ids = [
            result['id']
            for result in response.json()['results']
        ]

        self.assertIn(older_nearby_boat.id, result_ids)


class MarineConditionsCacheTests(TestCase):
    def setUp(self):
        cache.clear()

    @override_settings(MARINE_CONDITIONS_CACHE_TTL_SECONDS=1800)
    @patch('listings.services.marine_conditions.fetch_boat_conditions')
    def test_boat_conditions_are_cached_by_rounded_coordinates(self, mock_fetch_conditions):
        mock_fetch_conditions.return_value = {
            'current': {
                'time': '2026-04-28T12:00',
                'wave_height_m': 0.4,
                'wind_speed_m_s': 4.2,
                'air_temperature_c': 8.0,
                'label': 'Good',
                'message': 'Good for a calm day trip.',
            },
            'best_window_today': {
                'time': '2026-04-28T12:00',
                'wave_height_m': 0.4,
                'wind_speed_m_s': 4.2,
                'air_temperature_c': 8.0,
                'label': 'Good',
                'message': 'Good for a calm day trip.',
            },
            'next_12_hours': [],
        }

        first_response = get_boat_conditions(67.2804001, 14.4049001)
        second_response = get_boat_conditions(67.2804002, 14.4049002)

        self.assertEqual(first_response, second_response)
        self.assertEqual(mock_fetch_conditions.call_count, 1)

    @override_settings(MARINE_CONDITIONS_CACHE_TTL_SECONDS=0)
    @patch('listings.services.marine_conditions.fetch_boat_conditions')
    def test_boat_conditions_cache_can_be_disabled(self, mock_fetch_conditions):
        mock_fetch_conditions.return_value = {
            'current': {
                'time': '2026-04-28T12:00',
                'wave_height_m': 0.4,
                'wind_speed_m_s': 4.2,
                'air_temperature_c': 8.0,
                'label': 'Good',
                'message': 'Good for a calm day trip.',
            },
            'best_window_today': {
                'time': '2026-04-28T12:00',
                'wave_height_m': 0.4,
                'wind_speed_m_s': 4.2,
                'air_temperature_c': 8.0,
                'label': 'Good',
                'message': 'Good for a calm day trip.',
            },
            'next_12_hours': [],
        }

        get_boat_conditions(67.2804, 14.4049)
        get_boat_conditions(67.2804, 14.4049)

        self.assertEqual(mock_fetch_conditions.call_count, 2)

    def test_boat_conditions_reject_invalid_coordinates_before_api_call(self):
        with self.assertRaises(ValueError):
            get_boat_conditions('not-a-latitude', 14.4049)

        with self.assertRaises(ValueError):
            get_boat_conditions(67.2804, 'not-a-longitude')

        with self.assertRaises(ValueError):
            get_boat_conditions(120, 14.4049)

        with self.assertRaises(ValueError):
            get_boat_conditions(67.2804, 220)


class BoatListingValueValidationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='value-host',
            password='strong-pass-123',
        )

    def _base_payload(self):
        return {
            'title': 'Valid Boat Title',
            'description': 'This is a valid boat description for serializer tests.',
            'boat_type': 'motorboat',
            'location_name': 'Mo i Rana',
            'guests': 5,
            'price_per_day': '1200.00',
            'latitude': '66.312800',
            'longitude': '14.142800',
        }

    def _serializer(self, payload):
        return BoatListingSerializer(
            data=payload,
            context={'request': type('Req', (), {'user': self.user})()},
        )

    def test_rejects_too_short_title(self):
        serializer = self._serializer({
            **self._base_payload(),
            'title': 'Bo',
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('title', serializer.errors)

    def test_trims_title_and_location_name(self):
        serializer = self._serializer({
            **self._base_payload(),
            'title': '   Clean Boat Title   ',
            'location_name': '   Bodø   ',
        })

        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertEqual(serializer.validated_data['title'], 'Clean Boat Title')
        self.assertEqual(serializer.validated_data['location_name'], 'Bodø')

    def test_rejects_zero_price(self):
        serializer = self._serializer({
            **self._base_payload(),
            'price_per_day': '0.00',
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('price_per_day', serializer.errors)

    def test_rejects_negative_price(self):
        serializer = self._serializer({
            **self._base_payload(),
            'price_per_day': '-100.00',
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('price_per_day', serializer.errors)

    def test_rejects_unreasonably_high_price(self):
        serializer = self._serializer({
            **self._base_payload(),
            'price_per_day': '100001.00',
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('price_per_day', serializer.errors)

    def test_rejects_zero_guests(self):
        serializer = self._serializer({
            **self._base_payload(),
            'guests': 0,
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('guests', serializer.errors)

    def test_rejects_unreasonably_high_guests(self):
        serializer = self._serializer({
            **self._base_payload(),
            'guests': 101,
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('guests', serializer.errors)

    def test_rejects_invalid_latitude(self):
        serializer = self._serializer({
            **self._base_payload(),
            'latitude': '91.000000',
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('latitude', serializer.errors)

    def test_rejects_invalid_longitude(self):
        serializer = self._serializer({
            **self._base_payload(),
            'longitude': '181.000000',
        })

        self.assertFalse(serializer.is_valid())
        self.assertIn('longitude', serializer.errors)

    def test_accepts_valid_listing_values(self):
        serializer = self._serializer(self._base_payload())

        self.assertTrue(serializer.is_valid(), serializer.errors)