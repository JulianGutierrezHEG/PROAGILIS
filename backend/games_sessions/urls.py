from django.urls import path
from .views import SessionCreateView,SessionListView

urlpatterns = [
    path('', SessionListView.as_view(), name='listSessions'),
    path('create/', SessionCreateView.as_view(), name='createSession')
]