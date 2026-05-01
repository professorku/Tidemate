import hashlib
import hmac
from datetime import timedelta

from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q
from django.utils import timezone


class DeviceSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="device_sessions")
    refresh_token_hash = models.CharField(max_length=64, unique=True, db_index=True)
    device_label = models.CharField(max_length=255, blank=True)
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_used_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-last_used_at", "-id"]

    def __str__(self):
        return f"{self.user.username} - {self.device_label or 'unknown device'}"


def hash_token(token: str) -> str:
    if token is None:
        return ""

    return hmac.new(
        settings.SECRET_KEY.encode("utf-8"),
        str(token).encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def build_device_label(user_agent: str) -> str:
    normalized = (user_agent or "").strip()
    if not normalized:
        return "Unknown device"
    return normalized[:255]


def get_request_ip(request):
    from rest_framework.settings import api_settings

    num_proxies = api_settings.NUM_PROXIES
    remote_addr = request.META.get("REMOTE_ADDR") or None

    if num_proxies is not None and num_proxies > 0:
        xff = (request.META.get("HTTP_X_FORWARDED_FOR") or "").strip()
        if xff:
            addrs = [addr.strip() for addr in xff.split(",")]
            candidate = addrs[-min(num_proxies, len(addrs))]
            return candidate or remote_addr

    return remote_addr


def upsert_device_session(*, user, refresh_token: str, request):
    expires_at = timezone.now() + settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"]
    token_hash = hash_token(refresh_token)
    user_agent = request.META.get("HTTP_USER_AGENT", "")

    defaults = {
        "device_label": build_device_label(user_agent),
        "user_agent": user_agent,
        "ip_address": get_request_ip(request),
        "expires_at": expires_at,
        "revoked_at": None,
        "last_used_at": timezone.now(),
    }

    session, _ = DeviceSession.objects.update_or_create(
        user=user,
        refresh_token_hash=token_hash,
        defaults=defaults,
    )

    return session


def revoke_device_session_for_token(refresh_token: str):
    token_hash = hash_token(refresh_token)

    return DeviceSession.objects.filter(
        refresh_token_hash=token_hash,
        revoked_at__isnull=True,
    ).update(revoked_at=timezone.now())


def is_device_session_active(refresh_token: str) -> bool:
    token_hash = hash_token(refresh_token)

    return DeviceSession.objects.filter(
        refresh_token_hash=token_hash,
        revoked_at__isnull=True,
        expires_at__gt=timezone.now(),
    ).exists()


def revoke_all_device_sessions_for_user(user):
    return DeviceSession.objects.filter(
        user=user,
        revoked_at__isnull=True,
    ).update(revoked_at=timezone.now())


def get_old_device_sessions_queryset(*, retention_days=90):
    cutoff = timezone.now() - timedelta(days=retention_days)

    return DeviceSession.objects.filter(
        Q(revoked_at__isnull=False, revoked_at__lt=cutoff)
        | Q(expires_at__lt=cutoff)
    )


def cleanup_old_device_sessions(*, retention_days=90):
    queryset = get_old_device_sessions_queryset(retention_days=retention_days)
    deleted_count, deleted_by_model = queryset.delete()

    return deleted_count, deleted_by_model