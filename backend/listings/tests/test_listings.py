from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from listings.serializers import BoatListingSerializer


class BoatListingUploadValidationTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='host-images', password='strong-pass-123')

    def _base_payload(self):
        return {
            'title': 'Upload Test Boat',
            'description': 'Testing image validation.',
            'boat_type': 'motorboat',
            'location_name': 'Mo i Rana',
            'guests': 5,
            'price_per_day': '1200.00',
        }

    def test_new_images_reject_non_image_content_type(self):
        serializer = BoatListingSerializer(
            data={
                **self._base_payload(),
                'new_images': [
                    SimpleUploadedFile('notes.txt', b'not-an-image', content_type='text/plain')
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
                    SimpleUploadedFile(f'image-{idx}.png', b'fake', content_type='image/png')
                    for idx in range(11)
                ],
            },
            context={'request': type('Req', (), {'user': self.user})()},
        )

        self.assertFalse(serializer.is_valid())
        self.assertIn('new_images', serializer.errors)


from decimal import Decimal
from unittest.mock import patch

from django.urls import reverse
from rest_framework.test import APITestCase

from listings.models import BoatListing


class BoatConditionsErrorHandlingTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='conditions-host', password='strong-pass-123')
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
        self.assertEqual(response.json()['detail'], 'This boat has invalid map coordinates.')

    @patch('listings.views.get_boat_conditions', side_effect=__import__('listings.services.marine_conditions', fromlist=['MarineConditionsError']).MarineConditionsError('service down'))
    def test_boat_conditions_returns_502_for_forecast_service_failures(self, _mock_conditions):
        response = self.client.get(reverse('boat-conditions', args=[self.boat.id]))

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.json()['detail'], 'Could not fetch forecast data right now.')


class ListingPaginationContractTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username="page-host", password="strong-pass-123")
        self.boat = BoatListing.objects.create(
            host=self.host,
            title="Paginated Boat",
            description="Pagination contract test.",
            boat_type="motorboat",
            location_name="Bodø",
            guests=4,
            price_per_day=Decimal("1000.00"),
        )

    def test_public_listings_reject_limit_parameter(self):
        response = self.client.get(reverse("boat-list-create"), {"limit": 6})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()["detail"],
            "Use page and page_size for listing pagination. The limit parameter is not supported.",
        )

    def test_my_listings_reject_limit_parameter(self):
        self.client.force_authenticate(user=self.host)

        response = self.client.get(reverse("my-boats"), {"limit": 6})

        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json()["detail"],
            "Use page and page_size for listing pagination. The limit parameter is not supported.",
        )


class BoatCoverImageSourceOfTruthTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="cover-host", password="strong-pass-123")
        self.boat = BoatListing.objects.create(
            host=self.user,
            title="Cover Boat",
            description="Cover image test.",
            boat_type="motorboat",
            location_name="Mo i Rana",
            guests=5,
            price_per_day=Decimal("900.00"),
        )

    def test_boat_image_property_comes_from_cover_flag(self):
        from listings.models import BoatImage

        first = BoatImage.objects.create(
            boat=self.boat,
            image=SimpleUploadedFile('gallery-1.jpg', b'first-image', content_type='image/jpeg'),
            is_cover=False,
            sort_order=0,
        )
        second = BoatImage.objects.create(
            boat=self.boat,
            image=SimpleUploadedFile('gallery-2.jpg', b'second-image', content_type='image/jpeg'),
            is_cover=True,
            sort_order=1,
        )

        self.assertEqual(self.boat.image.name, second.image.name)
        self.assertNotEqual(self.boat.image.name, first.image.name)

    def test_serializer_image_matches_cover_image_url(self):
        from listings.models import BoatImage

        cover = BoatImage.objects.create(
            boat=self.boat,
            image=SimpleUploadedFile('gallery-cover.jpg', b'cover-image', content_type='image/jpeg'),
            is_cover=True,
            sort_order=0,
        )

        serializer = BoatListingSerializer(instance=self.boat, context={})

        self.assertEqual(serializer.data['image'], cover.image.url)
        self.assertEqual(serializer.data['images'][0]['image'], cover.image.url)

class ListingSearchValidationTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username="search-host",
            password="strong-pass-123",
        )

        BoatListing.objects.create(
            host=self.host,
            title="Search Test Boat",
            description="A boat used for search validation tests.",
            boat_type="motorboat",
            location_name="Bodø",
            guests=4,
            price_per_day=Decimal("1200.00"),
            latitude="67.280400",
            longitude="14.404900",
        )

    def test_invalid_min_price_returns_400(self):
        response = self.client.get(
            reverse("boat-list-create"),
            {"min_price": "abc"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("min_price", response.json())

    def test_invalid_max_price_returns_400(self):
        response = self.client.get(
            reverse("boat-list-create"),
            {"max_price": "not-a-number"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("max_price", response.json())

    def test_invalid_min_guests_returns_400(self):
        response = self.client.get(
            reverse("boat-list-create"),
            {"min_guests": "2.5"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("min_guests", response.json())

    def test_negative_min_guests_returns_400(self):
        response = self.client.get(
            reverse("boat-list-create"),
            {"min_guests": "-1"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("min_guests", response.json())

    def test_invalid_boat_type_returns_400(self):
        response = self.client.get(
            reverse("boat-list-create"),
            {"boat_type": "spaceship"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("boat_type", response.json())

    def test_max_price_lower_than_min_price_returns_400(self):
        response = self.client.get(
            reverse("boat-list-create"),
            {
                "min_price": "2000",
                "max_price": "1000",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("max_price", response.json())

    def test_valid_numeric_filters_still_work(self):
        response = self.client.get(
            reverse("boat-list-create"),
            {
                "min_guests": "2",
                "min_price": "1000",
                "max_price": "1500",
            },
        )

        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.json()["results"]), 1)

    def test_invalid_radius_params_return_400(self):
        response = self.client.get(
            reverse("boat-list-create"),
            {
                "latitude": "abc",
                "longitude": "14.4049",
                "radius_km": "25",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("latitude", response.json())

    def test_partial_radius_params_return_400(self):
        response = self.client.get(
            reverse("boat-list-create"),
            {
                "latitude": "67.2804",
                "radius_km": "25",
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("longitude", response.json())
