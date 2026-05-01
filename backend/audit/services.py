import hashlib
import hmac
import logging
import re
from typing import Any

from django.conf import settings
from django.db import connection, transaction

logger = logging.getLogger("audit")

SENSITIVE_KEY_RE = re.compile(
    r"(password|token|secret|cookie|authorization|csrf|session|api[_-]?key|credential|refresh|access)",
    re.IGNORECASE,
)


def get_client_ip(request):
    if request is None:
        return None

    trusted_proxy_count = int(getattr(settings, "AUDIT_TRUSTED_PROXY_COUNT", 0))

    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for and trusted_proxy_count > 0:
        parts = [part.strip() for part in forwarded_for.split(",") if part.strip()]
        client_index = -(trusted_proxy_count + 1)
        if len(parts) >= trusted_proxy_count + 1:
            return parts[client_index]

    return request.META.get("REMOTE_ADDR")


def hash_identifier(value: Any) -> str:
    """
    Hash usernames/emails/search identifiers before they enter audit metadata.

    This lets you correlate repeated suspicious activity without storing raw
    personal data or login identifiers in audit rows.
    """
    if value is None:
        return ""

    normalized = str(value).strip().lower()
    if not normalized:
        return ""

    secret = getattr(settings, "SECRET_KEY", "audit-dev-key").encode("utf-8")
    digest = hmac.new(secret, normalized.encode("utf-8"), hashlib.sha256).hexdigest()
    return digest[:24]


def sanitize_metadata(value: Any, *, depth: int = 0) -> Any:
    if depth > 4:
        return "[max-depth]"

    if isinstance(value, dict):
        clean = {}
        for key, item in value.items():
            key_str = str(key)
            if SENSITIVE_KEY_RE.search(key_str):
                clean[key_str] = "[redacted]"
            else:
                clean[key_str] = sanitize_metadata(item, depth=depth + 1)
        return clean

    if isinstance(value, (list, tuple, set)):
        return [sanitize_metadata(item, depth=depth + 1) for item in list(value)[:25]]

    if isinstance(value, (str, int, float, bool)) or value is None:
        if isinstance(value, str) and len(value) > 500:
            return f"{value[:500]}...[truncated]"
        return value

    return str(value)[:500]


def resolve_actor(request=None, actor=None):
    if actor is not None:
        return actor

    if request is None:
        return None

    user = getattr(request, "user", None)
    if user is not None and getattr(user, "is_authenticated", False):
        return user

    return None


def write_audit_event(
    *,
    action: str,
    request=None,
    actor=None,
    status: str = "success",
    severity: str = "info",
    target_type: str = "",
    target_id: str | int = "",
    metadata: dict | None = None,
):
    """
    Write one audit event.

    This function must never break normal app behavior. If audit logging fails,
    it logs the failure and returns None.
    """
    if not getattr(settings, "AUDIT_LOGGING_ENABLED", True):
        return None

    if not action:
        logger.warning("Tried to write audit event without action.")
        return None

    from .models import AuditEvent

    safe_metadata = sanitize_metadata(metadata or {})
    resolved_actor = resolve_actor(request=request, actor=actor)

    request_id = ""
    method = ""
    path = ""
    ip_address = None
    user_agent = ""

    if request is not None:
        request_id = getattr(request, "request_id", "") or request.headers.get("X-Request-ID", "")
        method = getattr(request, "method", "") or ""
        path = getattr(request, "path", "") or ""
        ip_address = get_client_ip(request)
        user_agent = request.META.get("HTTP_USER_AGENT", "")[:500]

    event_kwargs = {
        "actor": resolved_actor,
        "action": action[:120],
        "status": status,
        "severity": severity,
        "target_type": str(target_type or "")[:120],
        "target_id": str(target_id or "")[:120],
        "request_id": str(request_id or "")[:64],
        "method": method[:12],
        "path": path[:500],
        "ip_address": ip_address,
        "user_agent": user_agent,
        "metadata": safe_metadata,
    }

    def create_event():
        try:
            return AuditEvent.objects.create(**event_kwargs)
        except Exception:
            logger.exception("Failed to create audit event action=%s", action)
            return None

    try:
        if connection.in_atomic_block:
            transaction.on_commit(create_event)
            return None

        return create_event()
    except Exception:
        logger.exception("Failed to schedule audit event action=%s", action)
        return None