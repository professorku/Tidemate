from decimal import Decimal

from django.conf import settings
from django.contrib.auth.models import User
from django.middleware.csrf import get_token
from django.test import RequestFactory
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from listings.models import BoatListing
from favorites.models import Favorite


class FavoriteApiTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='favorite-host', password='strong-pass-123')
        self.user = User.objects.create_user(username='favorite-user', password='strong-pass-123')
        self.other_user = User.objects.create_user(username='favorite-other', password='strong-pass-123')
        self.boat = BoatListing.objects.create(
            host=self.host,
            title='Favorite Fjord Cruiser',
            description='A great boat for testing favorites.',
            boat_type='motorboat',
            location_name='Mo i Rana',
            guests=5,
            price_per_day=Decimal('1499.00'),
        )

    def test_authenticated_user_can_create_and_list_favorite(self):
        self.client.force_authenticate(user=self.user)

        create_response = self.client.post(
            '/api/favorites/',
            {'boat_id': self.boat.id},
            format='json',
        )
        self.assertEqual(create_response.status_code, 201)
        favorite_id = create_response.json()['id']

        list_response = self.client.get('/api/favorites/')
        self.assertEqual(list_response.status_code, 200)
        payload = list_response.json()
        self.assertEqual(payload['count'], 1)
        self.assertEqual(payload['results'][0]['id'], favorite_id)
        self.assertEqual(payload['results'][0]['boat']['id'], self.boat.id)
        self.assertTrue(payload['results'][0]['boat']['is_favorited'])

    def test_duplicate_favorite_is_rejected(self):
        Favorite.objects.create(user=self.user, boat=self.boat)
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            '/api/favorites/',
            {'boat_id': self.boat.id},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('boat_id', response.json())

    def test_user_can_delete_own_favorite(self):
        favorite = Favorite.objects.create(user=self.user, boat=self.boat)
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(f'/api/favorites/{favorite.id}/')

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Favorite.objects.filter(id=favorite.id).exists())

    def test_user_cannot_delete_another_users_favorite(self):
        favorite = Favorite.objects.create(user=self.other_user, boat=self.boat)
        self.client.force_authenticate(user=self.user)

        response = self.client.delete(f'/api/favorites/{favorite.id}/')

        self.assertEqual(response.status_code, 404)
        self.assertTrue(Favorite.objects.filter(id=favorite.id).exists())


class FavoriteCsrfProtectionTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='favorite-csrf-host', password='strong-pass-123')
        self.user = User.objects.create_user(username='favorite-csrf-user', password='strong-pass-123')
        self.boat = BoatListing.objects.create(
            host=self.host,
            title='CSRF Favorite Boat',
            description='A great boat for CSRF tests.',
            boat_type='motorboat',
            location_name='Mo i Rana',
            guests=5,
            price_per_day=Decimal('1499.00'),
        )

    def _cookie_authenticated_client(self, *, with_csrf=False):
        client = APIClient(enforce_csrf_checks=True)
        client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = str(RefreshToken.for_user(self.user).access_token)

        if with_csrf:
            request = RequestFactory().get('/')
            csrf_token = get_token(request)
            csrf_cookie = request.META['CSRF_COOKIE']

            client.cookies[settings.CSRF_COOKIE_NAME] = csrf_cookie
            client.credentials(HTTP_X_CSRFTOKEN=csrf_token)

        return client

    def test_create_favorite_requires_csrf_when_authenticated_by_cookie(self):
        client = self._cookie_authenticated_client()

        response = client.post('/api/favorites/', {'boat_id': self.boat.id}, format='json')

        self.assertEqual(response.status_code, 403)

    def test_delete_favorite_requires_csrf_when_authenticated_by_cookie(self):
        favorite = Favorite.objects.create(user=self.user, boat=self.boat)
        client = self._cookie_authenticated_client()

        response = client.delete(f'/api/favorites/{favorite.id}/')

        self.assertEqual(response.status_code, 403)

    def test_create_favorite_succeeds_with_matching_csrf_token(self):
        client = self._cookie_authenticated_client(with_csrf=True)

        response = client.post('/api/favorites/', {'boat_id': self.boat.id}, format='json')

        self.assertEqual(response.status_code, 201)
