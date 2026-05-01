from decimal import Decimal

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase

from listings.models import BoatListing


class ListingOwnershipSecurityTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username='listing-owner',
            password='strong-pass-123',
        )
        self.other_host = User.objects.create_user(
            username='other-listing-owner',
            password='strong-pass-123',
        )
        self.renter = User.objects.create_user(
            username='listing-renter',
            password='strong-pass-123',
        )

        self.own_boat = BoatListing.objects.create(
            host=self.host,
            title='Owner Boat',
            description='A boat owned by the authenticated host.',
            boat_type='motorboat',
            location_name='Mo i Rana',
            guests=4,
            price_per_day=Decimal('1200.00'),
            latitude=Decimal('66.312800'),
            longitude=Decimal('14.142800'),
        )
        self.other_boat = BoatListing.objects.create(
            host=self.other_host,
            title='Other Host Boat',
            description='A boat owned by a different host.',
            boat_type='sailboat',
            location_name='Bodø',
            guests=6,
            price_per_day=Decimal('1600.00'),
            latitude=Decimal('67.280400'),
            longitude=Decimal('14.404900'),
        )

    def _valid_create_payload(self):
        return {
            'title': 'New Secure Listing',
            'description': 'A valid listing payload used for ownership security tests.',
            'boat_type': 'motorboat',
            'location_name': 'Mo i Rana',
            'pickup_address': 'Private Dock 4',
            'pickup_instructions': 'Meet by the blue gate.',
            'guests': 5,
            'price_per_day': '1300.00',
            'latitude': '66.312800',
            'longitude': '14.142800',
        }

    def test_unauthenticated_user_cannot_create_listing(self):
        response = self.client.post(
            reverse('boat-list-create'),
            self._valid_create_payload(),
            format='json',
        )

        self.assertIn(response.status_code, [401, 403])
        self.assertFalse(
            BoatListing.objects.filter(title='New Secure Listing').exists()
        )

    def test_listing_create_uses_authenticated_user_not_supplied_host_id(self):
        self.client.force_authenticate(user=self.host)

        payload = self._valid_create_payload()
        payload['host'] = self.other_host.id
        payload['host_id'] = self.other_host.id

        response = self.client.post(
            reverse('boat-list-create'),
            payload,
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        created = BoatListing.objects.get(title='New Secure Listing')
        self.assertEqual(created.host, self.host)
        self.assertNotEqual(created.host, self.other_host)

    def test_host_only_sees_own_boats_in_mine_endpoint(self):
        self.client.force_authenticate(user=self.host)

        response = self.client.get(reverse('my-boats'))

        self.assertEqual(response.status_code, 200)
        returned_ids = [item['id'] for item in response.json()['results']]
        self.assertIn(self.own_boat.id, returned_ids)
        self.assertNotIn(self.other_boat.id, returned_ids)

    def test_host_cannot_update_another_hosts_listing(self):
        self.client.force_authenticate(user=self.host)

        response = self.client.patch(
            reverse('my-boat-update', args=[self.other_boat.id]),
            {'title': 'Hijacked Boat Title'},
            format='json',
        )

        self.assertEqual(response.status_code, 404)
        self.other_boat.refresh_from_db()
        self.assertEqual(self.other_boat.title, 'Other Host Boat')

    def test_host_cannot_delete_another_hosts_listing(self):
        self.client.force_authenticate(user=self.host)

        response = self.client.delete(
            reverse('my-boat-update', args=[self.other_boat.id]),
        )

        self.assertEqual(response.status_code, 404)
        self.assertTrue(BoatListing.objects.filter(id=self.other_boat.id).exists())

    def test_renter_cannot_update_listing_through_owner_endpoint(self):
        self.client.force_authenticate(user=self.renter)

        response = self.client.patch(
            reverse('my-boat-update', args=[self.own_boat.id]),
            {'title': 'Renter Edited Boat'},
            format='json',
        )

        self.assertEqual(response.status_code, 404)
        self.own_boat.refresh_from_db()
        self.assertEqual(self.own_boat.title, 'Owner Boat')