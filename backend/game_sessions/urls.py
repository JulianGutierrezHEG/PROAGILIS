from django.urls import path, include
from .views import SessionList

urlpatterns = [
    path('sessions/', SessionList.as_view(), name='session-list'),
]
