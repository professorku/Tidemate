from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


def _send_auth_disconnect(*, group_name, reason):
    channel_layer = get_channel_layer()
    if channel_layer is None:
        return False

    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "auth.force_disconnect",
            "reason": reason,
        },
    )
    return True


def disconnect_access_token_session(*, token_jti, reason="Session revoked."):
    if not token_jti:
        return False
    return _send_auth_disconnect(group_name=f"auth_session_{token_jti}", reason=reason)


def disconnect_all_user_auth_sessions(*, user_id, reason="All sessions revoked."):
    if not user_id:
        return False
    return _send_auth_disconnect(group_name=f"user_{user_id}_auth", reason=reason)
