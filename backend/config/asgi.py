from config.settings_loader import configure_settings

configure_settings(strict=True)

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.security.websocket import AllowedHostsOriginValidator, OriginValidator
from django.conf import settings
from django.core.asgi import get_asgi_application

django_asgi_app = get_asgi_application()

from config.jwt_websocket_middleware import JWTAuthMiddleware
from chat.routing import websocket_urlpatterns as chat_websocket_urlpatterns
from notifications.routing import websocket_urlpatterns as notification_websocket_urlpatterns

websocket_urlpatterns = [*notification_websocket_urlpatterns, *chat_websocket_urlpatterns]

websocket_application = JWTAuthMiddleware(
    URLRouter(websocket_urlpatterns)
)

if settings.WEBSOCKET_ALLOWED_ORIGINS:
    websocket_application = OriginValidator(
        websocket_application,
        settings.WEBSOCKET_ALLOWED_ORIGINS,
    )

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(websocket_application),
})
