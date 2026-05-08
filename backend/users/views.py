import logging

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.contrib.auth.models import User
from django.core import signing
from django.db import connection
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import serializers, status
from rest_framework.decorators import api_view, parser_classes, permission_classes, throttle_classes
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.settings import api_settings as jwt_api_settings
from rest_framework_simplejwt.tokens import RefreshToken

from .turnstile import require_turnstile

from config.throttling import (
    AuthAnonRateThrottle,
    AuthUserRateThrottle,
    ChangePasswordRateThrottle,
    ForgotPasswordIdentityRateThrottle,
    ForgotPasswordIpRateThrottle,
    LoginIdentityRateThrottle,
    LoginIpRateThrottle,
    ProfileWriteRateThrottle,
    RelationshipWriteRateThrottle,
    PublicProfileAnonRateThrottle,
    ResendVerificationIdentityRateThrottle,
    ResendVerificationIpRateThrottle,
    ResetPasswordRateThrottle,
    SignupIdentityRateThrottle,
    SignupIpRateThrottle,
    VerifyEmailRateThrottle,
)
from config.websocket_sessions import disconnect_access_token_session, disconnect_all_user_auth_sessions

from .auth_helpers import (
    REFRESH_COOKIE_NAME,
    clear_access_cookie,
    clear_refresh_cookie,
    enforce_csrf,
    set_access_cookie,
    set_refresh_cookie,
)
from .device_tracking import is_device_session_active, revoke_device_session_for_token, upsert_device_session
from .email_verification import send_verification_email, verify_email_change_token, verify_email_token
from .google_auth import GoogleAuthError, get_or_create_user_from_google_credential
from .password_reset import send_password_reset_email
from .profile_serializers import MyProfileSerializer, PublicProfileSerializer
from .selectors import build_profile_payload, get_user_by_id
from .serializers import ChangePasswordSerializer, ForgotPasswordSerializer, ResetPasswordSerializer, SignupSerializer
from .services import revoke_all_device_sessions_for_user, toggle_block_for_user, toggle_crewmate_for_user, update_my_profile

logger = logging.getLogger(__name__)


class TideMateTokenObtainPairSerializer(TokenObtainPairSerializer):
    default_error_messages = {
        **TokenObtainPairSerializer.default_error_messages,
        "no_active_account": "Invalid username or password.",
    }

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        jwt_settings = getattr(settings, "SIMPLE_JWT", {})
        audience = jwt_settings.get("AUDIENCE")
        issuer = jwt_settings.get("ISSUER")
        if audience:
            token["aud"] = audience
        if issuer:
            token["iss"] = issuer
        return token

    def validate(self, attrs):
        username = attrs.get(self.username_field, "")

        if isinstance(username, str):
            attrs[self.username_field] = username.strip()

        return super().validate(attrs)


def _should_include_debug_link(request, header_name):
    return (
        settings.DEBUG
        and getattr(settings, "DEBUG_LINKS_ENABLED", False)
        and request.headers.get(header_name) == "1"
    )


def _should_include_health_details(request):
    user = getattr(request, "user", None)
    return bool(
        settings.DEBUG
        or (user and user.is_authenticated and getattr(user, "is_staff", False))
    )


def _get_user_from_refresh_token(token):
    validated_token = RefreshToken(token)
    user_id = validated_token.get(jwt_api_settings.USER_ID_CLAIM)
    if user_id is None:
        raise InvalidToken("Refresh token is missing the user identifier.")

    user = User.objects.filter(pk=user_id).first()
    if user is None:
        raise InvalidToken("User for refresh token was not found.")

    return user


def _get_token_pair_for_user(user):
    refresh = TideMateTokenObtainPairSerializer.get_token(user)
    return str(refresh.access_token), str(refresh)


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
                "verification_link": verification_link if _should_include_debug_link(request, "X-Debug-Verification-Link") else None,
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

    access_token, refresh_token = _get_token_pair_for_user(user)

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
        user = _get_user_from_refresh_token(rotated_refresh)
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
            if user and _should_include_debug_link(request, "X-Debug-Reset-Link")
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


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser, JSONParser])
@throttle_classes([ProfileWriteRateThrottle])
def me(request):
    if request.method == "PATCH":
        csrf_error = enforce_csrf(request)
        if csrf_error:
            return csrf_error

        try:
            update_my_profile(user=request.user, data=request.data, serializer_class=MyProfileSerializer, request=request)
        except ValidationError as exc:
            logger.info("Profile update rejected for user %s: %s", request.user.id, exc)
            return Response(exc.detail, status=400)

    return Response(
        build_profile_payload(
            user=request.user,
            request=request,
            serializer_class=MyProfileSerializer,
            include_private_stats=True,
        )
    )


@api_view(["GET"])
@permission_classes([AllowAny])
@throttle_classes([PublicProfileAnonRateThrottle])
def public_profile(request, user_id):
    user = get_user_by_id(user_id)
    if not user:
        return Response({"detail": "User not found."}, status=404)

    return Response(
        build_profile_payload(
            user=user,
            request=request,
            serializer_class=PublicProfileSerializer,
            include_private_stats=False,
        )
    )


def _get_target_user_or_404(user_id):
    target_user = get_user_by_id(user_id)
    if not target_user:
        return None, Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    return target_user, None


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([RelationshipWriteRateThrottle])
def toggle_crewmate(request, user_id):
    csrf_error = enforce_csrf(request)
    if csrf_error:
        return csrf_error

    target_user, error_response = _get_target_user_or_404(user_id)
    if error_response:
        return error_response

    try:
        result = toggle_crewmate_for_user(actor=request.user, target_user=target_user)
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    except PermissionError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_403_FORBIDDEN)

    return Response(result)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([RelationshipWriteRateThrottle])
def toggle_block_user(request, user_id):
    csrf_error = enforce_csrf(request)
    if csrf_error:
        return csrf_error

    target_user, error_response = _get_target_user_or_404(user_id)
    if error_response:
        return error_response

    try:
        result = toggle_block_for_user(actor=request.user, target_user=target_user)
    except ValueError as exc:
        return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(result)
