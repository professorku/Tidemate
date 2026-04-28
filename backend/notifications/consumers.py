import asyncio
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from django.utils import timezone


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = None
        self.auth_session_group_name = None
        self.user_auth_group_name = None
        self.expiry_disconnect_task = None

        user = self.scope.get("user")

        if not user or user.is_anonymous:
            await self.close(code=4401)
            return

        self.group_name = f"user_{user.id}_notifications"
        self.user_auth_group_name = f"user_{user.id}_auth"

        token_jti = self.scope.get("token_jti")
        if token_jti:
            self.auth_session_group_name = f"auth_session_{token_jti}"
            await self.channel_layer.group_add(self.auth_session_group_name, self.channel_name)

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.channel_layer.group_add(self.user_auth_group_name, self.channel_name)

        accepted_subprotocol = None
        requested_subprotocols = self.scope.get("subprotocols") or []
        if requested_subprotocols and requested_subprotocols[0] == "access_token":
            accepted_subprotocol = "access_token"

        await self.accept(subprotocol=accepted_subprotocol)
        self._schedule_expiry_disconnect()

    def _schedule_expiry_disconnect(self):
        token_exp = self.scope.get("token_exp")
        if token_exp is None:
            return

        delay_seconds = max((token_exp - timezone.now()).total_seconds(), 0)
        self.expiry_disconnect_task = asyncio.create_task(
            self._close_when_token_expires(delay_seconds)
        )

    async def _close_when_token_expires(self, delay_seconds):
        try:
            await asyncio.sleep(delay_seconds)
            await self.close(code=4401)
        except asyncio.CancelledError:
            return

    async def disconnect(self, close_code):
        expiry_disconnect_task = getattr(self, "expiry_disconnect_task", None)
        if expiry_disconnect_task is not None:
            expiry_disconnect_task.cancel()

        user = self.scope.get("user")

        group_name = getattr(self, "group_name", None)
        if group_name and user and not user.is_anonymous:
            await self.channel_layer.group_discard(group_name, self.channel_name)

        auth_session_group_name = getattr(self, "auth_session_group_name", None)
        if auth_session_group_name:
            await self.channel_layer.group_discard(auth_session_group_name, self.channel_name)

        user_auth_group_name = getattr(self, "user_auth_group_name", None)
        if user_auth_group_name:
            await self.channel_layer.group_discard(user_auth_group_name, self.channel_name)

    async def notification_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "notification",
            "notification": event["notification"],
        }))

    async def auth_force_disconnect(self, event):
        reason = event.get("reason") or "Session revoked."
        await self.send(text_data=json.dumps({
            "type": "session_revoked",
            "detail": reason,
        }))
        await self.close(code=4401)
