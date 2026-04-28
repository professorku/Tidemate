from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from config.websocket_sessions import disconnect_access_token_session

from .models import Notification
from .serializers import NotificationSerializer


def create_and_push_notification(*, user, message, target_url=""):
    notification = Notification.objects.create(
        user=user,
        message=message,
        target_url=target_url or "",
    )

    channel_layer = get_channel_layer()

    if channel_layer is not None:
        payload = NotificationSerializer(notification).data
        async_to_sync(channel_layer.group_send)(
            f"user_{user.id}_notifications",
            {
                "type": "notification.message",
                "notification": payload,
            },
        )

    return notification


def mark_notification_read(*, notification):
    if notification.is_read:
        return notification

    notification.is_read = True
    notification.save(update_fields=["is_read"])

    return notification


def mark_all_notifications_read(*, user):
    return Notification.objects.filter(
        user=user,
        is_read=False,
    ).update(is_read=True)


def disconnect_access_token_websocket_session(*, token_jti, reason="Session revoked."):
    return disconnect_access_token_session(token_jti=token_jti, reason=reason)