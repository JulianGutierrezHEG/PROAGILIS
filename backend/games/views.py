from rest_framework import viewsets
from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from django.shortcuts import get_object_or_404
from games_sessions.models import Group
from .models import GamePhase, GroupPhaseStatus
from .serializers import GroupPhaseStatusSerializer,GamePhaseSerializer

class GamePhaseDetail(RetrieveAPIView):
    queryset = GamePhase.objects.all()
    serializer_class = GamePhaseSerializer
    lookup_field = 'id'

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

class GroupCurrentPhaseDetail(RetrieveAPIView):
    serializer_class = GroupPhaseStatusSerializer
    lookup_field = 'group_id'
    lookup_url_kwarg = 'group_id'

    def get_queryset(self):
        return GroupPhaseStatus.objects.filter(group__id=self.kwargs[self.lookup_url_kwarg])

class SubmitAnswerView(APIView):
    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        answer = request.data.get('answer')
        user = request.data.get('user')

        group_phase_status, created = GroupPhaseStatus.objects.get_or_create(group=group, phase_id=1)
        group_phase_status.answer = answer
        group_phase_status.status = 'pending'
        group_phase_status.save()

        return Response({'status': 'Answer submitted successfully.'}, status=status.HTTP_200_OK)

class GroupCurrentPhaseAnswerView(APIView):
    def get(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        group_phase_status = GroupPhaseStatus.objects.filter(group=group).first()
        
        if group_phase_status:
            answer = group_phase_status.answer
            phase_name = group_phase_status.phase.name
            response_data = {
                "phase_name": phase_name,
                "answer": answer if answer else {}
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            return Response({"detail": "No phase status found for the group."}, status=status.HTTP_404_NOT_FOUND)

