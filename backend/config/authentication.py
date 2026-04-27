from django.conf import settings
from rest_framework import exceptions
from rest_framework_simplejwt.authentication import JWTAuthentication

from users.auth_helpers import enforce_csrf


class CookieJWTAuthentication(JWTAuthentication):
    """Allow JWT auth from Authorization header or an httpOnly access cookie."""

    SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}

    def authenticate(self, request):
        header = self.get_header(request)
        raw_token = None
        token_from_cookie = False

        if header is not None:
            raw_token = self.get_raw_token(header)

        if raw_token is None:
            raw_token = request.COOKIES.get(getattr(settings, "JWT_ACCESS_COOKIE_NAME", "access_token"))
            token_from_cookie = raw_token is not None

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)

        if token_from_cookie and request.method not in self.SAFE_METHODS:
            self.enforce_csrf(request)

        return self.get_user(validated_token), validated_token

    def enforce_csrf(self, request):
        csrf_error = enforce_csrf(request)
        if csrf_error is None:
            return

        detail = getattr(csrf_error, "content", b"CSRF Failed")
        if isinstance(detail, bytes):
            detail = detail.decode("utf-8", errors="ignore")
        detail = (detail or "CSRF Failed").strip()
        raise exceptions.PermissionDenied(detail=detail)
