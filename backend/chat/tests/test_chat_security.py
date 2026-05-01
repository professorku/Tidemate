from decimal import Decimal

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework.test import APITestCase

from chat.models import Conversation, Message
from listings.models import BoatListing


class ChatSecurityRegressionTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(
            username='chat-sec-host',
            password='strong-pass-123',
        )
        self.renter = User.objects.create_user(
            username='chat-sec-renter',
            password='strong-pass-123',
        )
        self.intruder = User.objects.create_user(
            username='chat-sec-intruder',
            password='strong-pass-123',
        )
        self.boat = BoatListing.objects.create(
            host=self.host,
            title='Chat Security Boat',
            description='A boat used for chat security regression tests.',
            boat_type='motorboat',
            location_name='Mo i Rana',
            guests=4,
            price_per_day=Decimal('1000.00'),
        )
        self.conversation = Conversation.objects.create(
            host=self.host,
            renter=self.renter,
            conversation_type='direct',
        )
        self.message = Message.objects.create(
            conversation=self.conversation,
            sender=self.host,
            text='Private message',
        )

    def test_unauthenticated_user_cannot_list_conversations(self):
        response = self.client.get(reverse('my-conversations'))

        self.assertIn(response.status_code, [401, 403])

    def test_intruder_cannot_list_messages_in_private_conversation(self):
        self.client.force_authenticate(user=self.intruder)

        response = self.client.get(
            reverse('conversation-messages', kwargs={'conversation_id': self.conversation.id})
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['detail'], 'Conversation not found.')

    def test_intruder_cannot_post_message_in_private_conversation(self):
        self.client.force_authenticate(user=self.intruder)

        response = self.client.post(
            reverse('conversation-messages', kwargs={'conversation_id': self.conversation.id}),
            {'text': 'I should not be able to send this.'},
            format='json',
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(Message.objects.count(), 1)

    def test_intruder_cannot_delete_message_in_private_conversation(self):
        self.client.force_authenticate(user=self.intruder)

        response = self.client.delete(
            reverse('message-delete', kwargs={'message_id': self.message.id})
        )

        self.assertEqual(response.status_code, 403)
        self.message.refresh_from_db()
        self.assertFalse(self.message.is_deleted)
        self.assertEqual(self.message.text, 'Private message')

    def test_user_blocked_by_host_cannot_start_listing_conversation(self):
        self.host.profile.blocked_users.add(self.renter)
        self.client.force_authenticate(user=self.renter)

        response = self.client.post(
            reverse('start-direct-conversation'),
            {
                'user_id': self.host.id,
                'boat_id': self.boat.id,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()['detail'], 'You cannot message this user.')

    def test_user_must_unblock_host_before_starting_listing_conversation(self):
        self.renter.profile.blocked_users.add(self.host)
        self.client.force_authenticate(user=self.renter)

        response = self.client.post(
            reverse('start-direct-conversation'),
            {
                'user_id': self.host.id,
                'boat_id': self.boat.id,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()['detail'], 'Unblock this user before messaging them.')