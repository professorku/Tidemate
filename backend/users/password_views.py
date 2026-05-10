from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from config.throttling import (
    AuthAnonRateThrottle,
    AuthUserRateThrottle,
    ChangePasswordRateThrottle,
    ResetPasswordRateThrottle,
    SignupIdentityRateThrottle,
    SignupIpRateThrottle,
)
from config.websocket_sessions import disconnect_all_user_auth_sessions

from .auth_helpers import REFRESH_COOKIE_NAME, clear_access_cookie, clear_refresh_cookie, enforce_csrf
from .password_reset import send_password_reset_email
from .serializers import ChangePasswordSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
from .services import revoke_all_device_sessions_for_user
from .turnstile import require_turnstile
from .view_helpers import should_include_debug_link


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthAnonRateThrottle, AuthUserRateThrottle, SignupIdentityRateThrottle, SignupIpRateThrottle])
@require_turnstile
def forgot_password(request):
    csrf_error = enforce_csrf(request)
    if csrf_error is not None:
        return csrf_error

    serializer = ForgotPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"]
    user = User.objects.filter(email__iexact=email, is_active=True).first()

    reset_link = send_password_reset_email(user) if user else None

    return Response(
        {
            "detail": "If an account exists for that email, a password reset link has been sent.",
            "reset_link": reset_link
            if user and should_include_debug_link(request, "X-Debug-Reset-Link")
            else None,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthAnonRateThrottle, AuthUserRateThrottle, ResetPasswordRateThrottle])
def reset_password(request):
    csrf_error = enforce_csrf(request)
    if csrf_error is not None:
        return csrf_error

    serializer = ResetPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = serializer.validated_data["user"]
    user.set_password(serializer.validated_data["new_password"])
    user.save(update_fields=["password"])
    revoke_all_device_sessions_for_user(user)
    disconnect_all_user_auth_sessions(user_id=user.id, reason="Password reset. Please log in again.")

    return Response({"detail": "Password reset successful. You can now log in."}, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([ChangePasswordRateThrottle])
def change_password(request):
    csrf_error = enforce_csrf(request)
    if csrf_error is not None:
        return csrf_error

    serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
    serializer.is_valid(raise_exception=True)

    request.user.set_password(serializer.validated_data["new_password"])
    request.user.save(update_fields=["password"])
    revoke_all_device_sessions_for_user(request.user)
    disconnect_all_user_auth_sessions(user_id=request.user.id, reason="Password changed. Please log in again.")

    refresh = request.COOKIES.get(REFRESH_COOKIE_NAME)
    if refresh:
        try:
            RefreshToken(refresh).blacklist()
        except (AttributeError, TokenError):
            pass

    response = Response({"detail": "Password changed successfully. Please log in again."}, status=status.HTTP_200_OK)
    clear_access_cookie(response)
    clear_refresh_cookie(response)
    return response