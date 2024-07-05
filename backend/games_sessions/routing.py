from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path('ws/group/<group_id>/', consumers.GroupConsumer.as_asgi()),
    path('ws/session/<session_id>/', consumers.SessionConsumer.as_asgi()),
]