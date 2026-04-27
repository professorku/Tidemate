from datetime import datetime, timezone
from http.cookies import SimpleCookie

from django.conf import settings
import logging

from channels.db import database_sync_to_async
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
    except (InvalidToken, TokenError) as exc:
        logger.info("Rejected websocket JWT token: %s", exc)
        return {
            "user": AnonymousUser(),
            "token_exp": None,
            "token_jti": None,
        }


def _get_token_from_cookies(scope):
    cookie_header = None

    for header_name, header_value in scope.get("headers", []):
        if header_name == b"cookie":
            cookie_header = header_value
            break

    if not cookie_header:
        return None

    try:
        decoded_cookie_header = cookie_header.decode()
    except UnicodeDecodeError as exc:
        logger.warning("Malformed websocket cookie header: %s", exc)
        return None

    cookie = SimpleCookie()
    cookie.load(decoded_cookie_header)
    cookie_name = getattr(settings, "JWT_ACCESS_COOKIE_NAME", "access_token")
    morsel = cookie.get(cookie_name)
    return morsel.value if morsel else None


def _get_token_from_subprotocols(scope):
    for header_name, header_value in scope.get("headers", []):
        if header_name == b"sec-websocket-protocol":
            try:
                decoded_header = header_value.decode()
            except UnicodeDecodeError as exc:
                logger.warning("Malformed websocket protocol header: %s", exc)
                return None

            protocols = [item.strip() for item in decoded_header.split(",") if item.strip()]
            if len(protocols) >= 2 and protocols[0] == "access_token":
                return protocols[1]
    return None


class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        token = _get_token_from_cookies(scope) or _get_token_from_subprotocols(scope)

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
