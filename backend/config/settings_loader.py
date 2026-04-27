import os

from django.core.exceptions import ImproperlyConfigured

DEFAULT_LOCAL_SETTINGS_MODULE = "config.settings.dev"


def configure_settings(*, strict: bool = True):
    current = os.environ.get("DJANGO_SETTINGS_MODULE", "").strip()
    if current:
        return current

    if strict:
        raise ImproperlyConfigured(
            "DJANGO_SETTINGS_MODULE is not set. Refusing to boot with development settings by default."
        )

    os.environ["DJANGO_SETTINGS_MODULE"] = DEFAULT_LOCAL_SETTINGS_MODULE
    return DEFAULT_LOCAL_SETTINGS_MODULE
