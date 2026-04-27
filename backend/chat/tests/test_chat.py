from unittest.mock import patch

from django.contrib.auth.models import User
from django.db import IntegrityError
from django.urls import reverse
from rest_framework.test import APITestCase

from .models import Conversation, Message


class ChatConversationPermissionTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='chat-host', password='strong-pass-123')
        self.renter = User.objects.create_user(username='chat-renter', password='strong-pass-123')
        self.intruder = User.objects.create_user(username='chat-intruder', password='strong-pass-123')
        self.conversation = Conversation.objects.create(
            host=self.host,
            renter=self.renter,
            conversation_type='direct',
        )
        self.message = Message.objects.create(
            conversation=self.conversation,
            sender=self.host,
            text='Welcome aboard',
        )

    def test_participant_can_view_conversation_detail(self):
        self.client.force_authenticate(user=self.renter)

        response = self.client.get(
            reverse('conversation-detail', kwargs={'conversation_id': self.conversation.id})
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['id'], self.conversation.id)

    def test_non_participant_cannot_view_conversation_detail(self):
        self.client.force_authenticate(user=self.intruder)

        response = self.client.get(
            reverse('conversation-detail', kwargs={'conversation_id': self.conversation.id})
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['detail'], 'Conversation not found.')

    def test_listing_messages_marks_other_users_messages_as_read(self):
        self.assertFalse(self.message.is_read)
        self.client.force_authenticate(user=self.renter)

        response = self.client.get(
            reverse('conversation-messages', kwargs={'conversation_id': self.conversation.id})
        )

        self.assertEqual(response.status_code, 200)
        self.message.refresh_from_db()
        self.assertTrue(self.message.is_read)

    def test_non_sender_cannot_delete_message(self):
        self.client.force_authenticate(user=self.renter)

        response = self.client.delete(
            reverse('message-delete', kwargs={'message_id': self.message.id})
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()['detail'], 'You can only delete your own messages.')

    def test_sender_can_soft_delete_message(self):
        self.client.force_authenticate(user=self.host)

        response = self.client.delete(
            reverse('message-delete', kwargs={'message_id': self.message.id})
        )

        self.assertEqual(response.status_code, 200)
        self.message.refresh_from_db()
        self.assertTrue(self.message.is_deleted)
        self.assertEqual(self.message.text, 'This message was deleted.')
        self.assertIsNotNone(self.message.deleted_at)

    def test_non_participant_cannot_post_message(self):
        self.client.force_authenticate(user=self.intruder)

        response = self.client.post(
            reverse('conversation-messages', kwargs={'conversation_id': self.conversation.id}),
            {'text': 'Let me in'},
            format='json',
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['detail'], 'Conversation not found.')


class DirectConversationUniquenessTests(APITestCase):
    def setUp(self):
        self.actor = User.objects.create_user(username='captain-a', password='strong-pass-123')
        self.target = User.objects.create_user(username='captain-b', password='strong-pass-123')

    def test_start_direct_conversation_normalizes_participants(self):
        conversation = Conversation.objects.create(
            host=self.target,
            renter=self.actor,
            conversation_type='direct',
        )

        self.assertEqual(conversation.direct_user_low_id, min(self.actor.id, self.target.id))
        self.assertEqual(conversation.direct_user_high_id, max(self.actor.id, self.target.id))

    def test_reversed_duplicate_direct_conversation_is_blocked_by_db_constraint(self):
        Conversation.objects.create(
            host=self.target,
            renter=self.actor,
            conversation_type='direct',
        )

        with self.assertRaises(IntegrityError):
            Conversation.objects.create(
                host=self.actor,
                renter=self.target,
                conversation_type='direct',
            )

    @patch('chat.services.Conversation.objects.create')
    @patch('chat.services.create_and_push_notification')
    def test_start_direct_conversation_recovers_when_constraint_wins_race(self, notify_mock, create_mock):
        existing = Conversation.objects.create(
            host=self.target,
            renter=self.actor,
            conversation_type='direct',
        )
        create_mock.side_effect = IntegrityError('duplicate')

        from .services import start_direct_conversation

        conversation, created = start_direct_conversation(actor=self.actor, target_user=self.target)

        self.assertFalse(created)
        self.assertEqual(conversation.id, existing.id)
        notify_mock.assert_not_called()


class ChatMessageValidationTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='limit-host', password='strong-pass-123')
        self.renter = User.objects.create_user(username='limit-renter', password='strong-pass-123')
        self.conversation = Conversation.objects.create(
            host=self.host,
            renter=self.renter,
            conversation_type='direct',
        )

    def test_message_cannot_be_blank_after_trimming(self):
        self.client.force_authenticate(user=self.host)

        response = self.client.post(
            reverse('conversation-messages', kwargs={'conversation_id': self.conversation.id}),
            {'text': '   '},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('text', response.json())

    def test_message_cannot_exceed_max_length(self):
        self.client.force_authenticate(user=self.host)

        response = self.client.post(
            reverse('conversation-messages', kwargs={'conversation_id': self.conversation.id}),
            {'text': 'x' * 1001},
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('text', response.json())
