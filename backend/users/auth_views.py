from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from config.throttling import (
    AuthAnonRateThrottle,
    AuthUserRateThrottle,
    LoginIdentityRateThrottle,
    LoginIpRateThrottle,
    SignupIdentityRateThrottle,
    SignupIpRateThrottle,
)
from config.websocket_sessions import disconnect_access_token_session

from .auth_helpers import (
    REFRESH_COOKIE_NAME,
    clear_access_cookie,
    clear_refresh_cookie,
    enforce_csrf,
    set_access_cookie,
    set_refresh_cookie,
)
from .auth_tokens import (
    TideMateTokenObtainPairSerializer,
    get_token_pair_for_user,
    get_user_from_refresh_token,
)
from .device_tracking import is_device_session_active, revoke_device_session_for_token, upsert_device_session
from .email_verification import send_verification_email
from .google_auth import GoogleAuthError, get_or_create_user_from_google_credential
from .serializers import SignupSerializer
from .turnstile import require_turnstile
from .view_helpers import should_include_debug_link


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthAnonRateThrottle, AuthUserRateThrottle, SignupIdentityRateThrottle, SignupIpRateThrottle])
@require_turnstile
def signup(request):
    csrf_error = enforce_csrf(request)
    if csrf_error is not None:
        return csrf_error

    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        verification_link = send_verification_email(user)
        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "detail": "Account created. Please verify your email before logging in.",
                "verification_required": True,
                "verification_link": verification_link
                if should_include_debug_link(request, "X-Debug-Verification-Link")
                else None,
            },
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthAnonRateThrottle, AuthUserRateThrottle, LoginIdentityRateThrottle, LoginIpRateThrottle])
@require_turnstile
def login(request):
    csrf_error = enforce_csrf(request)
    if csrf_error is not None:
        return csrf_error

    payload = request.data.copy()
    if "username" in payload:
        payload["username"] = (payload.get("username") or "").strip()

    serializer = TideMateTokenObtainPairSerializer(data=payload)
    serializer.is_valid(raise_exception=True)

    response = Response({"detail": "Logged in."}, status=status.HTTP_200_OK)
    set_access_cookie(response, serializer.validated_data["access"])
    set_refresh_cookie(response, serializer.validated_data["refresh"])
    upsert_device_session(user=serializer.user, refresh_token=serializer.validated_data["refresh"], request=request)
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthAnonRateThrottle, AuthUserRateThrottle, LoginIdentityRateThrottle, LoginIpRateThrottle])
def google_login(request):
    csrf_error = enforce_csrf(request)
    if csrf_error is not None:
        return csrf_error

    credential = request.data.get("credential", "")

    try:
        user, created = get_or_create_user_from_google_credential(credential)
    except GoogleAuthError as exc:
        return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)

    access_token, refresh_token = get_token_pair_for_user(user)

    response = Response(
        {
            "detail": "Logged in with Google.",
            "created": created,
        },
        status=status.HTTP_200_OK,
    )
    set_access_cookie(response, access_token)
    set_refresh_cookie(response, refresh_token)
    upsert_device_session(user=user, refresh_token=refresh_token, request=request)
    return response


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthAnonRateThrottle, AuthUserRateThrottle])
def refresh_token(request):
    csrf_error = enforce_csrf(request)
    if csrf_error is not None:
        return csrf_error

    refresh = request.COOKIES.get(REFRESH_COOKIE_NAME)
    if not refresh:
        return Response({"detail": "Refresh token cookie not found."}, status=status.HTTP_401_UNAUTHORIZED)

    if not is_device_session_active(refresh):
        return Response({"detail": "Session not found or has been revoked."}, status=status.HTTP_401_UNAUTHORIZED)

    serializer = TokenRefreshSerializer(data={"refresh": refresh})
    try:
        serializer.is_valid(raise_exception=True)
    except TokenError as exc:
        raise InvalidToken(exc.args[0])

    response = Response({"detail": "Session refreshed."}, status=status.HTTP_200_OK)
    set_access_cookie(response, serializer.validated_data["access"])
    rotated_refresh = serializer.validated_data.get("refresh")
    if rotated_refresh:
        revoke_device_session_for_token(refresh)
        set_refresh_cookie(response, rotated_refresh)
        user = get_user_from_refresh_token(rotated_refresh)
        upsert_device_session(user=user, refresh_token=rotated_refresh, request=request)

    return response


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthAnonRateThrottle, AuthUserRateThrottle])
def logout(request):
    csrf_error = enforce_csrf(request)
    if csrf_error is not None:
        return csrf_error

    refresh = request.COOKIES.get(REFRESH_COOKIE_NAME)
    access_token = request.COOKIES.get(getattr(settings, "JWT_ACCESS_COOKIE_NAME", "access_token"))
    access_token_jti = None

    if access_token:
        try:
            validated_access_token = JWTAuthentication().get_validated_token(access_token)
            access_token_jti = str(validated_access_token.get("jti") or "") or None
        except (InvalidToken, TokenError):
            access_token_jti = None

    if refresh:
        try:
            RefreshToken(refresh).blacklist()
        except (AttributeError, TokenError):
            pass

    response = Response({"detail": "Logged out."}, status=status.HTTP_200_OK)
    if refresh:
        revoke_device_session_for_token(refresh)
    if access_token_jti:
        disconnect_access_token_session(token_jti=access_token_jti, reason="Session signed out.")
    clear_access_cookie(response)
    clear_refresh_cookie(response)
    return response