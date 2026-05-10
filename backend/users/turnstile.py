import logging
from functools import wraps

import requests
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response

logger = logging.getLogger(__name__)

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"
TURNSTILE_VERIFY_TIMEOUT_SECONDS = 5


def get_turnstile_secret():
    return getattr(settings, "TURNSTILE_SECRET_KEY", "").strip()


def is_turnstile_enabled():
    return bool(get_turnstile_secret())


logger = logging.getLogger(__name__)

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


def verify_turnstile_token(token, remote_ip=None):
    if not getattr(settings, "TURNSTILE_SECRET_KEY", ""):
        logger.warning("Turnstile secret key is not configured.")
        return False

    if not token:
        logger.info("Turnstile verification missing token.")
        return False

    payload = {
        "secret": settings.TURNSTILE_SECRET_KEY,
        "response": token,
    }

    if remote_ip:
        payload["remoteip"] = remote_ip

    try:
        response = requests.post(
            TURNSTILE_VERIFY_URL,
            data=payload,
            timeout=5,
        )
        response.raise_for_status()
        data = response.json()
    except requests.RequestException:
        logger.exception("Turnstile verification request failed.")
        return False
    except ValueError:
        logger.exception("Turnstile verification returned invalid JSON.")
        return False

    if data.get("success") is True:
        return True

    error_codes = data.get("error-codes") or []
    logger.info(
        "Turnstile verification rejected request. error_codes=%s",
        error_codes,
    )
    return False


def _client_ip_from_request(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "")


def require_turnstile(view_func):
    """
    DRF view decorator. Reads `cf-turnstile-response` from the request body
    and rejects with 400 if it's missing or invalid.
    """

    @wraps(view_func)
    def wrapped(request, *args, **kwargs):
        if not is_turnstile_enabled():
            return view_func(request, *args, **kwargs)

        
        token = (
            request.data.get("cf-turnstile-response")
            or request.data.get("turnstile_token")
            or ""
        )

        if not verify_turnstile_token(
            token, remote_ip=_client_ip_from_request(request)
        ):
            return Response(
                {
                    "detail": "Captcha verification failed. Please try again.",
                    "code": "captcha_failed",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return view_func(request, *args, **kwargs)

    return wrapped