from django.urls import path
from .views import GroupMembersViewSet

group_members_list = GroupMembersViewSet.as_view({
    'get': 'list_group_members'
})

urlpatterns = [
    path('group/members/', group_members_list, name='group-members-list'),
]