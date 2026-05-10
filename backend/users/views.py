from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .auth_tokens import TideMateTokenObtainPairSerializer
from .auth_views import google_login, login, logout, refresh_token, signup
from .email_views import resend_verification_email, verify_email, verify_email_change
from .health_views import (
    csrf_token,
    _channel_layer_healthcheck,
    _database_healthcheck,
    _should_include_health_details,
)
from .password_views import change_password, forgot_password, reset_password
from .profile_views import me, public_profile
from .relationship_views import toggle_block_user, toggle_crewmate


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


__all__ = [
    "TideMateTokenObtainPairSerializer",
    "change_password",
    "csrf_token",
    "forgot_password",
    "google_login",
    "health_check",
    "login",
    "logout",
    "me",
    "public_profile",
    "refresh_token",
    "resend_verification_email",
    "reset_password",
    "signup",
    "toggle_block_user",
    "toggle_crewmate",
    "verify_email",
    "verify_email_change",
]