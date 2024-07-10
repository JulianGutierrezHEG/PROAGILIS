from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/lock/<int:group_id>/', consumers.LockConsumer.as_asgi()),
    path('ws/phase/<int:group_id>/', consumers.PhaseConsumer.as_asgi()),
]