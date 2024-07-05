import os
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from channels.auth import AuthMiddlewareStack
import games_sessions.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'main_project.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            games_sessions.routing.websocket_urlpatterns
        )
    ),
})