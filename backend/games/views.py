from rest_framework import viewsets
from rest_framework import status
from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework import status
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.shortcuts import get_object_or_404
from games_sessions.models import Group
from .models import GamePhase, GroupPhaseStatus,Project
from .serializers import GroupPhaseStatusSerializer,GamePhaseSerializer,ProjectSerializer
from .utils import update_group_phase_status

# Retourne la liste des phases de jeu
class GamePhaseListView(ListAPIView):
    queryset = GamePhase.objects.all()
    serializer_class = GamePhaseSerializer

# Retourne les détails d'une phase de jeu
class GamePhaseDetail(RetrieveAPIView):
    queryset = GamePhase.objects.all()
    serializer_class = GamePhaseSerializer
    lookup_field = 'id'

# Crée un nouveau projet pour un groupe
class CreateProjectView(APIView):
    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        project_name = request.data.get('projectName')
        roles = request.data.get('roles')

        project = Project.objects.create(
            name=project_name,
            group=group,
            scrum_master=roles.get('scrumMaster'),
            product_owner=roles.get('productOwner'),
            developers=roles.get('developers', [])
        )

        group.project = project
        group.save()

        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Retourne les membres d'un groupe
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

# Retourne les détails de la phase de jeu actuelle pour un groupe
class GroupCurrentPhaseDetail(APIView):
    def get(self, request, group_id):
        try:
            group_phase_status = GroupPhaseStatus.objects.filter(group__id=group_id).order_by('-id').first()
            if group_phase_status:
                serializer = GroupPhaseStatusSerializer(group_phase_status)
                return Response(serializer.data)
            else:
                return Response({'detail': 'Not found.'}, status=404)
        except GroupPhaseStatus.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=404)

# Soumet une réponse pour la phase de jeu actuelle
class SubmitAnswerView(APIView):
    def post(self, request, group_id, phase_id):
        group = get_object_or_404(Group, id=group_id)
        answer = request.data.get('answer')
        user = request.data.get('user')

        group_phase_status, created = GroupPhaseStatus.objects.get_or_create(group=group, phase_id=phase_id)
        group_phase_status.answer = answer
        group_phase_status.status = 'pending'
        group_phase_status.save()

        return Response({'status': 'Answer submitted successfully.'}, status=status.HTTP_200_OK)

# Retourne la réponse soumise pour une phase de jeu
class GroupPhaseAnswerView(APIView):
    def get(self, request, group_id, phase_id):
        group = get_object_or_404(Group, id=group_id)
        group_phase_status = get_object_or_404(GroupPhaseStatus, group=group, phase_id=phase_id)
        
        answer = group_phase_status.answer
        phase = group_phase_status.phase
        phase_name = phase.name
        requires_validation = phase.requires_validation
        response_data = {
            "phase_name": phase_name,
            "answer": answer if answer else {},
            "phase_id": phase.id,
            "requires_validation": requires_validation
        }
        return Response(response_data, status=status.HTTP_200_OK)

# Retourne le statut des phases de jeu pour un groupe
class GroupPhasesStatusView(APIView):
    def get(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
            phases = GamePhase.objects.all()
            phase_status_list = []
            for phase in phases:
                phase_status = GroupPhaseStatus.objects.filter(group=group, phase=phase).first()
                phase_status_list.append({
                    'phase': GamePhaseSerializer(phase).data,
                    'status': phase_status.status if phase_status else 'not_started'
                })
            status_choices = dict(GroupPhaseStatus.STATUS_CHOICES)
            return Response({'phase_statuses': phase_status_list, 'status_choices': status_choices}, status=status.HTTP_200_OK)
        except Group.DoesNotExist:
            return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)

# Met à jour le statut d'une phase de jeu pour un groupe
class UpdatePhaseStatusView(APIView):
    def post(self, request, group_id, phase_id):
        group = get_object_or_404(Group, id=group_id)
        phase = get_object_or_404(GamePhase, id=phase_id)
        new_status = request.data.get('status')

        if not new_status:
            return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)

        update_group_phase_status(group, phase, new_status)

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"phase_{group.id}",
            {
                'type': 'phase_status_update',
                'group_id': group.id,
                'phase_id': phase.id,
                'status': new_status,
            }
        )

        if new_status == 'completed':
            next_phase = GamePhase.objects.filter(id=phase_id + 1).first()
            if next_phase:
                update_group_phase_status(group, next_phase, 'in_progress')

                group.current_phase = next_phase
                group.save()

                async_to_sync(channel_layer.group_send)(
                    f"phase_{group.id}",
                    {
                        'type': 'phase_status_update',
                        'group_id': group.id,
                        'phase_id': next_phase.id,
                        'status': 'in_progress',
                    }
                )

        return Response({'status': 'Phase status updated successfully'}, status=status.HTTP_200_OK)
