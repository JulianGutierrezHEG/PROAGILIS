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
    UpdateUserStoryView,
    FetchProjectDetailsView,
    FetchCreatedUserStoriesView,
    CreateSprintView,
    GetSprintDetailsView,
    SprintUserStoriesView,
    UpdateSprintFieldsView,
    GameTimeControlView,
    UpdateSprintProgressView,
    UpdateUserStoryProgressView,
    GetSprintProgressView,
    GetUserStoriesProgressView,
    CompleteUserStoryView
)

group_members_list = GroupMembersViewSet.as_view({
    'get': 'list_group_members'
})

urlpatterns = [
    path('game-time-control/', GameTimeControlView.as_view(), name='gameTimeControl'),
    path('phases/', GamePhaseListView.as_view(), name='phaseList'),
    path('phase/<int:id>/', GamePhaseDetail.as_view(), name='gamePhaseDetail'),
    path('fetch-userstories-to-cut/<int:group_id>/', FetchToCutUserStoriesView.as_view(), name='fetchUSToCut'),
    path('group/members/', group_members_list, name='groupMembersList'),
    path('group/<int:group_id>/current-phase/', GroupCurrentPhaseDetail.as_view(), name='groupCurrentPhase'),
    path('group/<int:group_id>/project-details/', FetchProjectDetailsView.as_view(), name='fetchProjectDetails'),
    path('group/<int:group_id>/phases-status/', GroupPhasesStatusView.as_view(), name='groupCurrentPhase'),
    path('group/<int:group_id>/phase/<int:phase_id>/submit-answer/', SubmitAnswerView.as_view(), name='submitAnswer'),
    path('group/<int:group_id>/phase/<int:phase_id>/answer/', GroupPhaseAnswerView.as_view(), name='groupPhaseAnswer'),
    path('group/<int:group_id>/phase/<int:phase_id>/update-status/', UpdatePhaseStatusView.as_view(), name='updatePhaseStatus'),
    path('group/<int:group_id>/create-project/', CreateProjectView.as_view(), name='createProject'),
    path('group/<int:group_id>/fetch-userstories/', FetchUserStoriesView.as_view(), name='fetchUserStories'),
    path('group/<int:group_id>/fetch-created-userstories/', FetchCreatedUserStoriesView.as_view(), name='fetchCreatedUserStories'),
    path('group/<int:group_id>/add-userstory/', AddUserStoryView.as_view(), name='addUserStory'),
    path('group/<int:group_id>/delete-userstory/<int:story_id>/', DeleteUserStoryView.as_view(), name='deleteUserStory'),
    path('group/<int:group_id>/update-userstory/<int:user_story_id>/', UpdateUserStoryView.as_view(), name='updateUserStory'),
    path('group/<int:group_id>/create-sprint/', CreateSprintView.as_view(), name='createSprint'),
    path('group/<int:group_id>/sprint-details/', GetSprintDetailsView.as_view(), name='SprintDetails'),
    path('group/<int:group_id>/sprint-user-stories/', SprintUserStoriesView.as_view(), name='SprintUserStories'),
    path('group/<int:group_id>/update-sprint-fields/', UpdateSprintFieldsView.as_view(), name='updateSprintFields'),
    path('group/<int:group_id>/update-sprint-progress/<int:sprint_id>/', UpdateSprintProgressView.as_view(), name='updateSprintProgress'),
    path('group/<int:group_id>/update-user-story-progress/<int:sprint_id>/<int:user_story_id>/', UpdateUserStoryProgressView.as_view(), name='updateUserStoryProgress'),
    path('group/<int:group_id>/sprint-progress/<int:sprint_id>/', GetSprintProgressView.as_view(), name='sprintProgress'),
    path('group/<int:group_id>/user-stories-progress/<int:sprint_id>/', GetUserStoriesProgressView.as_view(), name='getUserStoriesProgress'),  
    path('group/<int:group_id>/sprint/<int:sprint_id>/complete-user-story/<int:story_id>/', CompleteUserStoryView.as_view(), name='completeUserStory'),
   
]