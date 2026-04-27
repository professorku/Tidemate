from django.conf import settings
from django.middleware.csrf import CsrfViewMiddleware

ACCESS_COOKIE_NAME = getattr(settings, 'JWT_ACCESS_COOKIE_NAME', 'access_token')
ACCESS_COOKIE_PATH = getattr(settings, 'JWT_ACCESS_COOKIE_PATH', '/')
ACCESS_COOKIE_SECURE = getattr(settings, 'JWT_ACCESS_COOKIE_SECURE', not settings.DEBUG)
ACCESS_COOKIE_HTTPONLY = getattr(settings, 'JWT_ACCESS_COOKIE_HTTPONLY', True)
ACCESS_COOKIE_SAMESITE = getattr(settings, 'JWT_ACCESS_COOKIE_SAMESITE', 'Lax')
ACCESS_COOKIE_MAX_AGE = int(settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds())

REFRESH_COOKIE_NAME = getattr(settings, 'JWT_REFRESH_COOKIE_NAME', 'refresh_token')
REFRESH_COOKIE_PATH = getattr(settings, 'JWT_REFRESH_COOKIE_PATH', '/api/users/')
REFRESH_COOKIE_SECURE = getattr(settings, 'JWT_REFRESH_COOKIE_SECURE', not settings.DEBUG)
REFRESH_COOKIE_HTTPONLY = getattr(settings, 'JWT_REFRESH_COOKIE_HTTPONLY', True)
REFRESH_COOKIE_SAMESITE = getattr(settings, 'JWT_REFRESH_COOKIE_SAMESITE', 'Lax')
REFRESH_COOKIE_MAX_AGE = int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds())


def set_access_cookie(response, access_token):
    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access_token,
        max_age=ACCESS_COOKIE_MAX_AGE,
        httponly=ACCESS_COOKIE_HTTPONLY,
        secure=ACCESS_COOKIE_SECURE,
        samesite=ACCESS_COOKIE_SAMESITE,
        path=ACCESS_COOKIE_PATH,
    )


def clear_access_cookie(response):
    response.delete_cookie(
        key=ACCESS_COOKIE_NAME,
        path=ACCESS_COOKIE_PATH,
        samesite=ACCESS_COOKIE_SAMESITE,
    )


def set_refresh_cookie(response, refresh_token):
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=REFRESH_COOKIE_MAX_AGE,
        httponly=REFRESH_COOKIE_HTTPONLY,
        secure=REFRESH_COOKIE_SECURE,
        samesite=REFRESH_COOKIE_SAMESITE,
        path=REFRESH_COOKIE_PATH,
    )


def clear_refresh_cookie(response):
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path=REFRESH_COOKIE_PATH,
        samesite=REFRESH_COOKIE_SAMESITE,
    )


def enforce_csrf(request):
    middleware = CsrfViewMiddleware(lambda req: None)
    return middleware.process_view(request, None, (), {})
