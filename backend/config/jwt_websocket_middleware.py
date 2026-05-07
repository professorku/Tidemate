from datetime import datetime, timezone
from http.cookies import SimpleCookie

import logging

from channels.db import database_sync_to_async
from django.conf import settings
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user_and_token_metadata(token):
    try:
        jwt_auth = JWTAuthentication()
        validated_token = jwt_auth.get_validated_token(token)
        user = jwt_auth.get_user(validated_token)

        exp = validated_token.get("exp")
        jti = validated_token.get("jti")

        return {
            "user": user,
            "token_exp": datetime.fromtimestamp(exp, tz=timezone.utc) if exp else None,
            "token_jti": str(jti) if jti else None,
        }

    except (InvalidToken, TokenError):
        logger.info("Rejected websocket authentication attempt.")

        return {
            "user": AnonymousUser(),
            "token_exp": None,
            "token_jti": None,
        }


def _get_token_from_cookies(scope):
    cookie_header = None

    for header_name, header_value in scope.get("headers", []):
        if header_name.lower() == b"cookie":
            cookie_header = header_value
            break

    if not cookie_header:
        return None

    try:
        decoded_cookie_header = cookie_header.decode()
    except UnicodeDecodeError:
        logger.warning("Malformed websocket cookie header.")
        return None

    cookie = SimpleCookie()
    cookie.load(decoded_cookie_header)

    ws_cookie_name = getattr(settings, "JWT_WS_ACCESS_COOKIE_NAME", "ws_access_token")
    access_cookie_name = getattr(settings, "JWT_ACCESS_COOKIE_NAME", "access_token")

    ws_morsel = cookie.get(ws_cookie_name)
    if ws_morsel:
        return ws_morsel.value

    access_morsel = cookie.get(access_cookie_name)
    return access_morsel.value if access_morsel else None


class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        token = _get_token_from_cookies(scope)

        if token:
            auth_result = await get_user_and_token_metadata(token)
            scope["user"] = auth_result["user"]
            scope["token_exp"] = auth_result["token_exp"]
            scope["token_jti"] = auth_result["token_jti"]
        else:
            scope["user"] = AnonymousUser()
            scope["token_exp"] = None
            scope["token_jti"] = None

        return await self.inner(scope, receive, send)