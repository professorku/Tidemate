import asyncio
import json
import logging

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.cache import cache
from rest_framework.exceptions import ValidationError
from django.utils import timezone

from .constants import (
    WEBSOCKET_SEND_RATE_LIMIT_COUNT,
    WEBSOCKET_SEND_RATE_LIMIT_WINDOW_SECONDS,
)
from .models import Message
from .selectors import get_user_conversations, get_visible_conversation_for_user, mark_messages_as_read_for_viewer
from .serializers import ConversationSerializer, MessageSerializer
from .services import delete_message, send_message

logger = logging.getLogger(__name__)


def get_public_error_detail(exc, default_message):
    if isinstance(exc, (ValueError, PermissionError, ValidationError)):
        detail = getattr(exc, 'detail', None)
        if isinstance(detail, (list, tuple)) and detail:
            return str(detail[0])
        if isinstance(detail, dict):
            first_value = next(iter(detail.values()), None)
            if isinstance(first_value, (list, tuple)) and first_value:
                return str(first_value[0])
            if first_value is not None:
                return str(first_value)
        return str(exc) or default_message

    logger.exception(default_message, exc_info=exc)
    return default_message


@database_sync_to_async
def get_conversation_for_user(user, conversation_id):
    conversation = get_visible_conversation_for_user(user, conversation_id)
    if conversation is None:
        return None
    return conversation


@database_sync_to_async
def serialize_conversation_for_user(user, conversation_id):
    conversation = get_user_conversations(user).filter(id=conversation_id).first()
    if conversation is None:
        return None
    return ConversationSerializer(conversation).data


@database_sync_to_async
def create_message_for_conversation(*, conversation, sender, text):
    serializer = MessageSerializer(data={'text': text})
    serializer.is_valid(raise_exception=True)
    message = send_message(conversation=conversation, sender=sender, serializer=serializer)
    return MessageSerializer(message).data


@database_sync_to_async
def delete_conversation_message(*, user, conversation_id, message_id):
    message = (
        Message.objects.select_related('conversation', 'sender')
        .filter(id=message_id, conversation_id=conversation_id)
        .first()
    )
    if message is None:
        raise ValueError('Message not found.')

    updated_message = delete_message(message=message, actor=user)
    return MessageSerializer(updated_message).data


@database_sync_to_async
def mark_conversation_as_read(*, conversation, user):
    return mark_messages_as_read_for_viewer(conversation, user)


@database_sync_to_async
def websocket_send_allowed(*, user_id, conversation_id):
    cache_key = f"chat:ws-send:{user_id}:{conversation_id}"
    now = timezone.now().timestamp()
    window_start = now - WEBSOCKET_SEND_RATE_LIMIT_WINDOW_SECONDS

    timestamps = cache.get(cache_key, [])
    timestamps = [ts for ts in timestamps if ts > window_start]

    if len(timestamps) >= WEBSOCKET_SEND_RATE_LIMIT_COUNT:
        return False

    timestamps.append(now)
    cache.set(cache_key, timestamps, timeout=WEBSOCKET_SEND_RATE_LIMIT_WINDOW_SECONDS)
    return True


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        if not user or user.is_anonymous:
            await self.close(code=4401)
            return

        try:
            self.conversation_id = int(self.scope['url_route']['kwargs']['conversation_id'])
        except (KeyError, TypeError, ValueError):
            await self.close(code=4404)
            return

        self.conversation = await get_conversation_for_user(user, self.conversation_id)
        if self.conversation is None:
            await self.close(code=4403)
            return

        self.group_name = f'conversation_{self.conversation_id}'
        self.auth_session_group_name = None
        self.user_auth_group_name = f"user_{user.id}_auth"
        self.expiry_disconnect_task = None

        token_jti = self.scope.get('token_jti')
        if token_jti:
            self.auth_session_group_name = f'auth_session_{token_jti}'
            await self.channel_layer.group_add(self.auth_session_group_name, self.channel_name)

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.channel_layer.group_add(self.user_auth_group_name, self.channel_name)

        accepted_subprotocol = None
        requested_subprotocols = self.scope.get('subprotocols') or []
        if requested_subprotocols and requested_subprotocols[0] == 'access_token':
            accepted_subprotocol = 'access_token'

        await self.accept(subprotocol=accepted_subprotocol)
        self._schedule_expiry_disconnect()
        await self._broadcast_read_state()

    def _schedule_expiry_disconnect(self):
        token_exp = self.scope.get('token_exp')
        if token_exp is None:
            return

        delay_seconds = max((token_exp - timezone.now()).total_seconds(), 0)
        self.expiry_disconnect_task = asyncio.create_task(self._close_when_token_expires(delay_seconds))

    async def _close_when_token_expires(self, delay_seconds):
        try:
            await asyncio.sleep(delay_seconds)
            await self.close(code=4401)
        except asyncio.CancelledError:
            return

    async def disconnect(self, close_code):
        if self.expiry_disconnect_task is not None:
            self.expiry_disconnect_task.cancel()

        if getattr(self, 'group_name', None):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

        if self.auth_session_group_name:
            await self.channel_layer.group_discard(self.auth_session_group_name, self.channel_name)

        if getattr(self, 'user_auth_group_name', None):
            await self.channel_layer.group_discard(self.user_auth_group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return

        try:
            payload = json.loads(text_data)
        except json.JSONDecodeError:
            await self._send_error('Invalid chat payload.')
            return

        event_type = payload.get('type')

        if event_type == 'message.send':
            await self._handle_send_message(payload)
            return

        if event_type == 'message.delete':
            await self._handle_delete_message(payload)
            return

        if event_type == 'message.read':
            await self._broadcast_read_state()
            return

        await self._send_error('Unsupported chat event.')

    async def _handle_send_message(self, payload):
        text = str(payload.get('text') or '').strip()
        if not text:
            await self._send_error('Message text cannot be empty.')
            return

        is_allowed = await websocket_send_allowed(
            user_id=self.scope['user'].id,
            conversation_id=self.conversation_id,
        )
        if not is_allowed:
            await self._send_error('Too many messages sent too quickly. Please wait a moment.')
            return

        try:
            message_data = await create_message_for_conversation(
                conversation=self.conversation,
                sender=self.scope['user'],
                text=text,
            )
            conversation_data = await serialize_conversation_for_user(self.scope['user'], self.conversation_id)
        except Exception as exc:
            await self._send_error(get_public_error_detail(exc, 'Failed to send message.'))
            return

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message_created',
                'message': message_data,
                'conversation_id': self.conversation_id,
                'actor_id': self.scope['user'].id,
            },
        )

        if conversation_data is not None:
            await self.send(text_data=json.dumps({
                'type': 'conversation.snapshot',
                'conversation': conversation_data,
            }))

    async def _handle_delete_message(self, payload):
        try:
            message_id = int(payload.get('message_id'))
        except (TypeError, ValueError):
            await self._send_error('Invalid message id.')
            return

        try:
            message_data = await delete_conversation_message(
                user=self.scope['user'],
                conversation_id=self.conversation_id,
                message_id=message_id,
            )
            conversation_data = await serialize_conversation_for_user(self.scope['user'], self.conversation_id)
        except Exception as exc:
            await self._send_error(get_public_error_detail(exc, 'Failed to delete message.'))
            return

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message_deleted',
                'message': message_data,
                'conversation_id': self.conversation_id,
                'actor_id': self.scope['user'].id,
            },
        )

        if conversation_data is not None:
            await self.send(text_data=json.dumps({
                'type': 'conversation.snapshot',
                'conversation': conversation_data,
            }))

    async def _broadcast_read_state(self):
        unread_now = await mark_conversation_as_read(conversation=self.conversation, user=self.scope['user'])
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_messages_read',
                'conversation_id': self.conversation_id,
                'actor_id': self.scope['user'].id,
                'marked_count': unread_now,
            },
        )

    async def _send_error(self, detail):
        await self.send(text_data=json.dumps({
            'type': 'chat.error',
            'detail': detail,
        }))

    async def chat_message_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message.created',
            'conversation_id': event['conversation_id'],
            'message': event['message'],
            'actor_id': event.get('actor_id'),
        }))

    async def chat_message_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message.deleted',
            'conversation_id': event['conversation_id'],
            'message': event['message'],
            'actor_id': event.get('actor_id'),
        }))

    async def chat_messages_read(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message.read',
            'conversation_id': event['conversation_id'],
            'actor_id': event.get('actor_id'),
            'marked_count': event.get('marked_count', 0),
        }))

    async def auth_force_disconnect(self, event):
        reason = event.get('reason') or 'Session revoked.'
        await self.send(text_data=json.dumps({
            'type': 'session_revoked',
            'detail': reason,
        }))
        await self.close(code=4401)
