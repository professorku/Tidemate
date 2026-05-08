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


def verify_turnstile_token(token, *, remote_ip=None):
    """
    POST the token to Cloudflare and return True if verification succeeds.
    Returns False (and logs) on any failure: bad token, missing token,
    network error, Cloudflare 5xx. Never raises.
    """
    secret = get_turnstile_secret()
    if not secret:
        
        return True

    if not token:
        return False

    payload = {"secret": secret, "response": token}
    if remote_ip:
        payload["remoteip"] = remote_ip

    try:
        response = requests.post(
            TURNSTILE_VERIFY_URL,
            data=payload,
            timeout=TURNSTILE_VERIFY_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
    except requests.RequestException:
        logger.warning("Turnstile verification request failed.", exc_info=True)
        
        return False

    error_codes = data.get("error-codes") or []

    logger.info(
        "Turnstile challenge rejected. error_codes=%s",
        error_codes,
    )


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