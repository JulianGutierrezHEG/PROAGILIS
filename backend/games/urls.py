from django.urls import path
from .views import UserGroupProjectPhaseView, UpdateGroupPhaseView

urlpatterns = [
    path('', UserGroupProjectPhaseView.as_view(), name='showPhases'),
    path('group/<int:group_id>/update_phase/', UpdateGroupPhaseView.as_view(), name='updateGroupPhase'),
]
