from datetime import date
from decimal import Decimal
from unittest.mock import patch

from django.contrib.auth.models import User
from django.db import IntegrityError
from django.urls import reverse
from rest_framework.test import APITestCase

from bookings.models import Booking
from chat.consumers import get_authorized_conversation_for_user
from chat.models import Conversation, Message
from listings.models import BoatListing

from django.utils import timezone


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

    def test_user_blocked_by_counterpart_cannot_view_conversation_detail(self):
        self.host.profile.blocked_users.add(self.renter)
        self.client.force_authenticate(user=self.renter)

        response = self.client.get(
            reverse('conversation-detail', kwargs={'conversation_id': self.conversation.id})
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['detail'], 'Conversation not found.')

    def test_user_who_blocked_counterpart_cannot_view_conversation_detail(self):
        self.host.profile.blocked_users.add(self.renter)
        self.client.force_authenticate(user=self.host)

        response = self.client.get(
            reverse('conversation-detail', kwargs={'conversation_id': self.conversation.id})
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['detail'], 'Conversation not found.')

    def test_blocked_conversation_is_hidden_from_conversation_list_and_counts(self):
        self.host.profile.blocked_users.add(self.renter)
        self.client.force_authenticate(user=self.renter)

        response = self.client.get(reverse('my-conversations'))

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload['count'], 0)
        self.assertEqual(payload['results'], [])
        self.assertEqual(payload['conversation_counts']['all_count'], 0)
        self.assertEqual(payload['conversation_counts']['direct_count'], 0)
        self.assertEqual(payload['conversation_counts']['unread_count'], 0)

    def test_blocked_user_cannot_list_messages_or_mark_them_read(self):
        self.host.profile.blocked_users.add(self.renter)
        self.assertFalse(self.message.is_read)

        self.client.force_authenticate(user=self.renter)

        response = self.client.get(
            reverse('conversation-messages', kwargs={'conversation_id': self.conversation.id})
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()['detail'], 'Conversation not found.')

        self.message.refresh_from_db()
        self.assertFalse(self.message.is_read)

    def test_websocket_conversation_lookup_rejects_blocked_user(self):
        self.host.profile.blocked_users.add(self.renter)

        conversation = get_authorized_conversation_for_user(
            self.renter,
            self.conversation.id,
        )

        self.assertIsNone(conversation)

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

    def test_start_direct_conversation_recovers_when_constraint_wins_race(self):
        from chat.services import start_direct_conversation

        existing_conversation = Conversation.objects.create(
            host=self.target,
            renter=self.actor,
            conversation_type='direct',
        )

        with patch(
            'chat.services.Conversation.objects.create',
            side_effect=IntegrityError('duplicate'),
        ):
            conversation, created = start_direct_conversation(
                actor=self.actor,
                target_user=self.target,
            )

        self.assertFalse(created)
        self.assertEqual(conversation.id, existing_conversation.id)
        
class DirectConversationCreationRulesTests(APITestCase):
    def setUp(self):
        self.host = User.objects.create_user(username='listing-host', password='strong-pass-123')
        self.renter = User.objects.create_user(username='listing-renter', password='strong-pass-123')
        self.other_user = User.objects.create_user(username='random-user', password='strong-pass-123')

        self.boat = BoatListing.objects.create(
            host=self.host,
            title='Secure Direct Chat Boat',
            description='A valid test boat used for direct inquiry permission checks.',
            boat_type='motorboat',
            location_name='Mo i Rana',
            guests=4,
            price_per_day=Decimal('1200.00'),
            latitude='66.312800',
            longitude='14.142800',
        )

    def test_cannot_start_direct_conversation_with_arbitrary_user_id(self):
        self.client.force_authenticate(user=self.renter)

        response = self.client.post(
            reverse('start-direct-conversation'),
            {'user_id': self.other_user.id},
            format='json',
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.json()['detail'],
            'Direct conversations can only be started from a boat listing or an existing booking relationship.',
        )
        self.assertEqual(Conversation.objects.count(), 0)

    def test_can_start_direct_conversation_from_boat_listing_with_host(self):
        self.client.force_authenticate(user=self.renter)

        response = self.client.post(
            reverse('start-direct-conversation'),
            {
                'user_id': self.host.id,
                'boat_id': self.boat.id,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.json()['created'])

        conversation = Conversation.objects.get()
        self.assertEqual(conversation.conversation_type, 'direct')
        self.assertEqual(conversation.host, self.host)
        self.assertEqual(conversation.renter, self.renter)

    def test_cannot_start_listing_inquiry_with_non_host(self):
        self.client.force_authenticate(user=self.renter)

        response = self.client.post(
            reverse('start-direct-conversation'),
            {
                'user_id': self.other_user.id,
                'boat_id': self.boat.id,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.json()['detail'],
            'You can only start a listing inquiry with the host of that boat.',
        )
        self.assertEqual(Conversation.objects.count(), 0)

    def test_host_cannot_start_direct_conversation_about_own_listing(self):
        self.client.force_authenticate(user=self.host)

        response = self.client.post(
            reverse('start-direct-conversation'),
            {
                'user_id': self.host.id,
                'boat_id': self.boat.id,
            },
            format='json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['detail'], 'You cannot start a conversation with yourself.')
        self.assertEqual(Conversation.objects.count(), 0)

    def test_existing_direct_conversation_can_be_reopened_without_boat_id(self):
        conversation = Conversation.objects.create(
            host=self.host,
            renter=self.renter,
            conversation_type='direct',
            archived_by_renter_at=timezone.now(),
        )

        self.client.force_authenticate(user=self.renter)

        response = self.client.post(
            reverse('start-direct-conversation'),
            {'user_id': self.host.id},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()['created'])

        conversation.refresh_from_db()
        self.assertIsNone(conversation.archived_by_renter_at)

    def test_can_start_direct_conversation_with_existing_booking_relationship(self):
        Booking.objects.create(
            boat=self.boat,
            renter=self.renter,
            start_date=date(2026, 6, 1),
            end_date=date(2026, 6, 3),
            total_price=Decimal('3600.00'),
            status='confirmed',
        )

        self.client.force_authenticate(user=self.renter)

        response = self.client.post(
            reverse('start-direct-conversation'),
            {'user_id': self.host.id},
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.json()['created'])
        self.assertEqual(Conversation.objects.count(), 1)


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