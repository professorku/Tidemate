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

def env_list(name: str, default: str = "") -> list[str]:
    value = os.getenv(name, default)
    return [item.strip() for item in value.split(",") if item.strip()]

DEFAULT_DEV_SECRET_KEY = "tidemate-dev-secret-key-change-me-please-2026-very-long"
SECRET_KEY = os.getenv("SECRET_KEY", DEFAULT_DEV_SECRET_KEY)
DEBUG = env_bool("DEBUG", False)

DJANGO_SETTINGS_MODULE = os.getenv("DJANGO_SETTINGS_MODULE", "")
IS_PRODUCTION_SETTINGS = DJANGO_SETTINGS_MODULE.endswith(".prod")

if IS_PRODUCTION_SETTINGS and SECRET_KEY == DEFAULT_DEV_SECRET_KEY:
    raise ImproperlyConfigured("SECRET_KEY must be set to a real value in production.")

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
    "notifications",
    "chat",
    "reviews",
    "favorites",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
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
MEDIA_ROOT = Path(os.getenv("MEDIA_ROOT", BASE_DIR / "media"))

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

DEBUG_LINKS_ENABLED = env_bool("DEBUG_LINKS_ENABLED", False)

CORS_ALLOWED_ORIGINS = env_list(
    "CORS_ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)

REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "config.authentication.CookieJWTAuthentication",
    ],
    "DEFAULT_THROTTLE_RATES": {
        # Keep the generic auth bucket high enough for normal multi-step flows
        # (login, refresh, logout, verify, reset) while relying on the
        # endpoint-specific identity throttles for abuse protection.
        "auth_anon": "20/minute",
        "auth_user": "60/minute",
        "chat": "30/minute",
        "reviews": "10/hour",
        "booking_write": "20/hour",
        "listing_write": "30/hour",
        "profile_write": "20/hour",
        "public_listings_anon": "120/hour",
        "public_profile_anon": "120/hour",
        "boat_conditions_anon": "60/hour",
        "login_anon_identity": "50/15minutes",
        "login_user_identity": "100/15minutes",
        "login_ip": "20/10minutes",
        "signup_ip": "10/hour",
        "resend_verification_ip": "10/hour",
        "forgot_password_ip": "10/hour",
        "signup_anon_identity": "3/hour",
        "signup_user_identity": "5/hour",
        "resend_verification_anon_identity": "5/hour",
        "resend_verification_user_identity": "10/hour",
        "forgot_password_anon_identity": "5/hour",
        "forgot_password_user_identity": "10/hour",
        "verify_email": "20/hour",
        "reset_password": "20/hour",
        "change_password": "10/hour",
        "relationship_write": "60/hour",
    },
}

CORS_ALLOW_CREDENTIALS = True

WEBSOCKET_ALLOWED_ORIGINS = env_list(
    "WEBSOCKET_ALLOWED_ORIGINS",
    ",".join(CORS_ALLOWED_ORIGINS),
)

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

EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "django.core.mail.backends.console.EmailBackend")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "noreply@tidemate.local")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
EMAIL_VERIFICATION_MAX_AGE_SECONDS = int(os.getenv("EMAIL_VERIFICATION_MAX_AGE_SECONDS", str(60 * 60 * 24)))

MARINE_CONDITIONS_CACHE_TTL_SECONDS = int(
    os.getenv("MARINE_CONDITIONS_CACHE_TTL_SECONDS", str(30 * 60))
)
