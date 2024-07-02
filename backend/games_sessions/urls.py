from django.urls import path
from .views import SessionCreateView,SessionListView,SessionDeleteView,GroupListView,JoinSessionView,GetJoinedSessionView,GetUserSessionInfoView,LeaveSessionView,SessionDetailView

urlpatterns = [
    path('', SessionListView.as_view(), name='listSessions'),
    path('<int:pk>/', SessionDetailView.as_view(), name='sessionDetail'),
    path('join/', JoinSessionView.as_view(), name='joinSession'),
    path('joined/', GetJoinedSessionView.as_view(), name='listJoinedSessions'),
    path('create/', SessionCreateView.as_view(), name='createSession'),
    path('<int:pk>/delete/', SessionDeleteView.as_view(), name='deleteSession'),
    path('<int:session_id>/groups/', GroupListView.as_view(), name='listGroups'),
    path('user-info/', GetUserSessionInfoView.as_view(), name='userSessionInfo'),
    path('<int:session_id>/leave/', LeaveSessionView.as_view(), name='leaveSession'),
]