import os

from django.core.exceptions import ImproperlyConfigured

from .base import *

DEBUG = False

SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_REFERRER_POLICY = "same-origin"
SECURE_CROSS_ORIGIN_OPENER_POLICY = "same-origin"
SECURE_REDIRECT_EXEMPT = (
    [r"^api/users/health/?$"]
    if os.getenv("ENABLE_PLAIN_HTTP_HEALTHCHECK", "").strip().lower() in {"1", "true", "yes", "on"}
    else []
)
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": os.environ["REDIS_URL"],
    }
}

if os.getenv("SECRET_KEY", "").strip() in {"", DEFAULT_DEV_SECRET_KEY}:
    raise ImproperlyConfigured("SECRET_KEY must be configured in production.")

if not os.getenv("ALLOWED_HOSTS", "").strip():
    raise ImproperlyConfigured("ALLOWED_HOSTS must be configured in production.")

if not os.getenv("CORS_ALLOWED_ORIGINS", "").strip():
    raise ImproperlyConfigured("CORS_ALLOWED_ORIGINS must be configured in production.")

if not os.getenv("CSRF_TRUSTED_ORIGINS", "").strip():
    raise ImproperlyConfigured("CSRF_TRUSTED_ORIGINS must be configured in production.")

if not os.getenv("REDIS_URL", "").strip():
    raise ImproperlyConfigured("REDIS_URL must be configured in production for Channels/Redis.")

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [os.getenv("REDIS_URL").strip()],
        },
    }
}
