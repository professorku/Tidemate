from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.db import connection
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


def _should_include_health_details(request):
    user = getattr(request, "user", None)
    return bool(
        settings.DEBUG
        or (user and user.is_authenticated and getattr(user, "is_staff", False))
    )


def _database_healthcheck():
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        row = cursor.fetchone()

    if not row or row[0] != 1:
        raise RuntimeError("Database health probe returned an unexpected response.")


def _channel_layer_healthcheck():
    channel_layer = get_channel_layer()
    if channel_layer is None:
        raise RuntimeError("Channel layer is not configured.")

    channel_name = async_to_sync(channel_layer.new_channel)("healthcheck.")
    probe_message = {"type": "health.check", "value": "ok"}

    async_to_sync(channel_layer.send)(channel_name, probe_message)
    received = async_to_sync(channel_layer.receive)(channel_name)

    if received != probe_message:
        raise RuntimeError("Channel layer health probe returned an unexpected response.")


@api_view(["GET"])
@permission_classes([AllowAny])
def health_check(request):
    checks = {}
    http_status = status.HTTP_200_OK

    probes = {
        "database": _database_healthcheck,
        "channel_layer": _channel_layer_healthcheck,
    }

    include_details = _should_include_health_details(request)

    for name, probe in probes.items():
        try:
            probe()
            checks[name] = {"status": "ok"}
        except Exception as exc:
            checks[name] = {"status": "error"}
            if include_details:
                checks[name]["detail"] = str(exc) or exc.__class__.__name__
            http_status = status.HTTP_503_SERVICE_UNAVAILABLE

    payload = {
        "status": "ok" if http_status == status.HTTP_200_OK else "degraded",
    }

    if include_details:
        payload["environment"] = "production" if not settings.DEBUG else "development"
        payload["checks"] = checks

    return Response(payload, status=http_status)


@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def csrf_token(request):
    return Response({"detail": "CSRF cookie set."})