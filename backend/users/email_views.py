from django.contrib.auth.models import User
from django.core import signing
from rest_framework import serializers, status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from config.throttling import (
    AuthAnonRateThrottle,
    AuthUserRateThrottle,
    ResendVerificationIdentityRateThrottle,
    ResendVerificationIpRateThrottle,
    VerifyEmailRateThrottle,
)

from .auth_helpers import enforce_csrf
from .email_verification import send_verification_email, verify_email_change_token, verify_email_token
from .turnstile import require_turnstile


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthAnonRateThrottle, AuthUserRateThrottle, VerifyEmailRateThrottle])
def verify_email(request):
    csrf_error = enforce_csrf(request)
    if csrf_error is not None:
        return csrf_error

    token = request.data.get("token", "").strip()
    if not token:
        return Response({"detail": "Verification token is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = verify_email_token(token)
    except User.DoesNotExist:
        return Response({"detail": "Verification link is invalid."}, status=status.HTTP_400_BAD_REQUEST)
    except signing.SignatureExpired:
        return Response({"detail": "Verification link has expired."}, status=status.HTTP_400_BAD_REQUEST)
    except signing.BadSignature:
        return Response({"detail": "Verification link is invalid."}, status=status.HTTP_400_BAD_REQUEST)

    if not user.is_active:
        user.is_active = True
        user.save(update_fields=["is_active"])

    return Response({"detail": "Email verified. You can now log in."}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthAnonRateThrottle, AuthUserRateThrottle, VerifyEmailRateThrottle])
def verify_email_change(request):
    csrf_error = enforce_csrf(request)
    if csrf_error is not None:
        return csrf_error

    token = request.data.get("token", "").strip()
    if not token:
        return Response({"detail": "Verification token is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        verify_email_change_token(token)
    except User.DoesNotExist:
        return Response({"detail": "Verification link is invalid."}, status=status.HTTP_400_BAD_REQUEST)
    except signing.SignatureExpired:
        return Response({"detail": "Verification link has expired."}, status=status.HTTP_400_BAD_REQUEST)
    except signing.BadSignature:
        return Response({"detail": "Verification link is invalid or no longer valid."}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"detail": "Email address updated successfully."}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthAnonRateThrottle, AuthUserRateThrottle, ResendVerificationIdentityRateThrottle, ResendVerificationIpRateThrottle])
@require_turnstile
def resend_verification_email(request):
    csrf_error = enforce_csrf(request)
    if csrf_error is not None:
        return csrf_error

    email = (request.data.get("email") or "").strip().lower()
    if not email:
        raise serializers.ValidationError({"email": ["Email is required."]})

    user = User.objects.filter(email__iexact=email).first()
    if user and not user.is_active:
        send_verification_email(user)

    return Response({"detail": "If an unverified account exists for that email, a new verification email has been sent."}, status=status.HTTP_200_OK)