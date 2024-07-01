from django.urls import path
from .views import SessionCreateView,SessionListView,SessionDeleteView

urlpatterns = [
    path('', SessionListView.as_view(), name='listSessions'),
    path('create/', SessionCreateView.as_view(), name='createSession'),
    path('<int:pk>/delete/', SessionDeleteView.as_view(), name='deleteSession')
]