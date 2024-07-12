from django.urls import path
from .views import GroupMembersViewSet,GroupCurrentPhaseDetail,GamePhaseDetail,SubmitAnswerView,GroupCurrentPhaseAnswerView,GroupPhasesStatusView,GamePhaseListView,UpdatePhaseStatusView,CreateProjectView

group_members_list = GroupMembersViewSet.as_view({
    'get': 'list_group_members'
})

urlpatterns = [
    path('phases/', GamePhaseListView.as_view(), name='phaseList'),
    path('group/members/', group_members_list, name='groupMembersList'),
    path('group/<int:group_id>/current-phase/', GroupCurrentPhaseDetail.as_view(), name='groupCurrentPhase'),
    path('phase/<int:id>/', GamePhaseDetail.as_view(), name='gamePhaseDetail'),
    path('group/<int:group_id>/phases-status/', GroupPhasesStatusView.as_view(), name='groupCurrentPhase'),
    path('group/<int:group_id>/submit-answer/', SubmitAnswerView.as_view(), name='submitAnswer'),
    path('group/<int:group_id>/current-phase/answer/', GroupCurrentPhaseAnswerView.as_view(), name='groupCurrentPhaseAnswer'),
    path('group/<int:group_id>/phase/<int:phase_id>/update-status/', UpdatePhaseStatusView.as_view(), name='updatePhaseStatus'),
    path('group/<int:group_id>/create-project/', CreateProjectView.as_view(), name='createProject'),
]