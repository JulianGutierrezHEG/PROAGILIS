from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from users.models import User
from .serializers import ProjectSerializer

class UserGroupProjectPhaseView(APIView):
    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        group = user.games_sessions.first()
        project = group.project
        current_phase = project.phases.filter(status='not_started').first()
        
        data = {
            'user': user.username,
            'group': group.name,
            'project': ProjectSerializer(project).data,
            'current_phase': current_phase.name if current_phase else "All phases completed"
        }
        return Response(data)