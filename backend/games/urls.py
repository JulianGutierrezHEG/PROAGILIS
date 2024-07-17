from django.urls import path
from .views import (
    GroupMembersViewSet,
    GroupCurrentPhaseDetail,
    GamePhaseDetail,
    SubmitAnswerView,
    GroupPhaseAnswerView,
    GroupPhasesStatusView,
    GamePhaseListView,
    UpdatePhaseStatusView,
    CreateProjectView,
    FetchUserStoriesView,
    FetchToCutUserStoriesView,
    AddUserStoryView,
    DeleteUserStoryView,
)

group_members_list = GroupMembersViewSet.as_view({
    'get': 'list_group_members'
})

urlpatterns = [
    path('phases/', GamePhaseListView.as_view(), name='phaseList'),
    path('group/members/', group_members_list, name='groupMembersList'),
    path('group/<int:group_id>/current-phase/', GroupCurrentPhaseDetail.as_view(), name='groupCurrentPhase'),
    path('phase/<int:id>/', GamePhaseDetail.as_view(), name='gamePhaseDetail'),
    path('group/<int:group_id>/phases-status/', GroupPhasesStatusView.as_view(), name='groupCurrentPhase'),
    path('group/<int:group_id>/phase/<int:phase_id>/submit-answer/', SubmitAnswerView.as_view(), name='submitAnswer'),
    path('group/<int:group_id>/phase/<int:phase_id>/answer/', GroupPhaseAnswerView.as_view(), name='groupPhaseAnswer'),
    path('group/<int:group_id>/phase/<int:phase_id>/update-status/', UpdatePhaseStatusView.as_view(), name='updatePhaseStatus'),
    path('group/<int:group_id>/create-project/', CreateProjectView.as_view(), name='createProject'),
    path('group/<int:group_id>/fetch-userstories/', FetchUserStoriesView.as_view(), name='fetchUserStories'),
    path('fetch-US-To-Cut/<int:group_id>/', FetchToCutUserStoriesView.as_view(), name='fetchUSToCut'),
    path('group/<int:group_id>/add-userstory/', AddUserStoryView.as_view(), name='addUserStory'),
    path('group/<int:group_id>/delete-userstory/<int:story_id>/', DeleteUserStoryView.as_view(), name='deleteUserStory'),
]