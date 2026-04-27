"""
WSGI config for config project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

from config.settings_loader import configure_settings
from django.core.wsgi import get_wsgi_application

configure_settings(strict=True)

application = get_wsgi_application()
