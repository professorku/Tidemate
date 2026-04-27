import asyncio
from datetime import timedelta

from asgiref.sync import async_to_sync
from channels.testing import WebsocketCommunicator
from django.conf import settings
from django.contrib.auth.models import User
from django.test import TransactionTestCase, override_settings
from django.utils import timezone
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from rest_framework.test import APIClient, APITestCase

from config.asgi import application
from .models import Notification
from .services import create_and_push_notification, disconnect_access_token_websocket_session


class NotificationApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='notify-user', password='strong-pass-123')
        self.other_user = User.objects.create_user(username='notify-other', password='strong-pass-123')
        self.own_notification = Notification.objects.create(
            user=self.user,
            message='Your booking was approved.',
            target_url='/bookings/1',
        )
        self.other_notification = Notification.objects.create(
            user=self.other_user,
            message='Private notification.',
            target_url='/messages/1',
        )

    def test_notifications_list_only_returns_authenticated_users_notifications(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get('/api/notifications/')

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload['count'], 1)
        self.assertEqual(payload['results'][0]['id'], self.own_notification.id)

    def test_user_can_mark_own_notification_as_read(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            f'/api/notifications/{self.own_notification.id}/read/',
            {},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.own_notification.refresh_from_db()
        self.assertTrue(self.own_notification.is_read)


    def test_user_can_mark_all_own_notifications_as_read_in_one_request(self):
        unread_notification = Notification.objects.create(
            user=self.user,
            message='Another unread notification.',
            target_url='/bookings/2',
        )
        self.client.force_authenticate(user=self.user)

        response = self.client.post('/api/notifications/mark-all-read/', {}, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['marked_count'], 2)
        self.own_notification.refresh_from_db()
        unread_notification.refresh_from_db()
        self.other_notification.refresh_from_db()
        self.assertTrue(self.own_notification.is_read)
        self.assertTrue(unread_notification.is_read)
        self.assertFalse(self.other_notification.is_read)

    def test_mark_all_read_returns_zero_when_everything_is_already_read(self):
        self.own_notification.is_read = True
        self.own_notification.save(update_fields=['is_read'])
        self.client.force_authenticate(user=self.user)

        response = self.client.post('/api/notifications/mark-all-read/', {}, format='json')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['marked_count'], 0)

    def test_user_cannot_mark_another_users_notification_as_read(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            f'/api/notifications/{self.other_notification.id}/read/',
            {},
            format='json',
        )

        self.assertEqual(response.status_code, 404)


@override_settings(
    CHANNEL_LAYERS={
        'default': {
            'BACKEND': 'channels.layers.InMemoryChannelLayer',
        }
    }
)
class NotificationWebsocketTests(TransactionTestCase):
    reset_sequences = True

    def setUp(self):
        self.user = User.objects.create_user(username='ws-user', password='strong-pass-123')

    async def _connect(self, subprotocols=None):
        communicator = WebsocketCommunicator(
            application,
            '/ws/notifications/',
            subprotocols=subprotocols or [],
        )
        connected, negotiated_subprotocol = await communicator.connect()
        return communicator, connected, negotiated_subprotocol

    def test_notification_websocket_rejects_anonymous_connections(self):
        async def scenario():
            communicator, connected, _ = await self._connect()
            self.assertFalse(connected)
            await communicator.disconnect()

        async_to_sync(scenario)()

    def test_notification_websocket_accepts_valid_access_token(self):
        token = str(RefreshToken.for_user(self.user).access_token)

        async def scenario():
            communicator, connected, negotiated_subprotocol = await self._connect(
                ['access_token', token]
            )
            self.assertTrue(connected)
            self.assertEqual(negotiated_subprotocol, 'access_token')
            await communicator.disconnect()

        async_to_sync(scenario)()

    def test_create_and_push_notification_delivers_payload_over_websocket(self):
        token = str(RefreshToken.for_user(self.user).access_token)

        async def scenario():
            communicator, connected, _ = await self._connect(['access_token', token])
            self.assertTrue(connected)

            await asyncio.to_thread(
                create_and_push_notification,
                user=self.user,
                message='New message from captain.',
                target_url='/messages/42',
            )

            event = await communicator.receive_json_from(timeout=3)
            self.assertEqual(event['type'], 'notification')
            self.assertEqual(event['notification']['message'], 'New message from captain.')
            self.assertEqual(event['notification']['target_url'], '/messages/42')
            self.assertFalse(event['notification']['is_read'])
            await communicator.disconnect()

        async_to_sync(scenario)()

    def test_notification_websocket_disconnects_when_access_token_expires(self):
        token = AccessToken.for_user(self.user)
        token.set_exp(from_time=timezone.now(), lifetime=timedelta(seconds=1))

        async def scenario():
            communicator, connected, _ = await self._connect(['access_token', str(token)])
            self.assertTrue(connected)

            await asyncio.sleep(1.3)
            await communicator.wait(timeout=2)

        async_to_sync(scenario)()

    def test_notification_websocket_disconnects_when_session_is_revoked(self):
        token = AccessToken.for_user(self.user)
        token_jti = str(token.get('jti'))

        async def scenario():
            communicator, connected, _ = await self._connect(['access_token', str(token)])
            self.assertTrue(connected)

            await asyncio.to_thread(
                disconnect_access_token_websocket_session,
                token_jti=token_jti,
                reason='Session signed out.',
            )

            event = await communicator.receive_json_from(timeout=3)
            self.assertEqual(event['type'], 'session_revoked')
            self.assertEqual(event['detail'], 'Session signed out.')
            await communicator.wait(timeout=2)

        async_to_sync(scenario)()


class NotificationCsrfProtectionTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='notify-csrf-user', password='strong-pass-123')
        self.notification = Notification.objects.create(
            user=self.user,
            message='Unread notification.',
            target_url='/bookings/7',
        )

    def _cookie_authenticated_client(self, *, with_csrf=False):
        client = APIClient(enforce_csrf_checks=True)
        client.cookies[settings.JWT_ACCESS_COOKIE_NAME] = str(RefreshToken.for_user(self.user).access_token)
        if with_csrf:
            client.cookies['csrftoken'] = 'notification-csrf-token'
            client.credentials(HTTP_X_CSRFTOKEN='notification-csrf-token')
        return client

    def test_mark_notification_read_requires_csrf_when_authenticated_by_cookie(self):
        client = self._cookie_authenticated_client()

        response = client.patch(
            f'/api/notifications/{self.notification.id}/read/',
            {},
            format='json',
        )

        self.assertEqual(response.status_code, 403)

    def test_mark_all_notifications_read_requires_csrf_when_authenticated_by_cookie(self):
        client = self._cookie_authenticated_client()

        response = client.post('/api/notifications/mark-all-read/', {}, format='json')

        self.assertEqual(response.status_code, 403)

    def test_mark_all_notifications_read_succeeds_with_matching_csrf_token(self):
        client = self._cookie_authenticated_client(with_csrf=True)

        response = client.post('/api/notifications/mark-all-read/', {}, format='json')

        self.assertEqual(response.status_code, 200)
