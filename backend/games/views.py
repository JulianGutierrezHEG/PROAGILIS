from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from users.models import User  
from games_sessions.models import Group

class GroupMembersViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'], url_path='group-members')
    def list_group_members(self, request):
        user = request.user
        group = Group.objects.filter(users=user).first()  
        if not group:
            return Response({'error': 'User is not part of any group'}, status=400)
        
        members = group.users.all()
        member_data = [{'id': member.id, 'username': member.username} for member in members]
        return Response(member_data)

