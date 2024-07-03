from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework import status
from .models import GamePhase
from games_sessions.models import Group
from users.models import User

class UserGroupProjectPhaseView(APIView):
    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        group = user.games_sessions.first()
        project = group.project
        current_phase = project.phases.filter(status='not_started').first()
        
        data = {
            'user': user.username,
            'group': group.name,
            'current_phase': current_phase.name if current_phase else "All phases completed"
        }
        return Response(data)

class UpdateGroupPhaseView(APIView):
    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        new_phase_name = request.data.get('new_phase_name')
        new_phase = GamePhase.objects.filter(name=new_phase_name).first()
        if not new_phase:
            return Response({'error': 'Phase not found.'}, status=status.HTTP_404_NOT_FOUND)
        group.current_phase = new_phase.name
        group.save()
        return Response({'status': 'Group phase updated successfully.'}, status=status.HTTP_200_OK)