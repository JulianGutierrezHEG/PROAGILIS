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
from datetime import timedelta
from games_sessions.models import Group
from .models import GamePhase, GroupPhaseStatus,Project,Backlog,UserStory,UserStoryTemplate,Sprint,GameTimeControl
from .serializers import GroupPhaseStatusSerializer,GamePhaseSerializer,ProjectSerializer,SprintSerializer,UserStorySerializer
from .utils import update_group_phase_status

# Retourne les détails de la configuration du temps de jeu
class GameTimeControlView(APIView):
    def get(self, request):
        try:
            game_time_control = GameTimeControl.objects.first()  
            return Response({
                "game_hours": game_time_control.game_hours,
                "real_minutes": game_time_control.real_minutes
            }, status=status.HTTP_200_OK)
        except GameTimeControl.DoesNotExist:
            return Response({"detail": "GameTimeControl pas trouvé"}, status=status.HTTP_404_NOT_FOUND)

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

        backlog = Backlog.objects.create(project=project)

        user_story_templates = UserStoryTemplate.objects.all()
        for template in user_story_templates:
            UserStory.objects.create(
                name=template.name,
                description=template.description,
                business_value=template.business_value,
                time_estimation=template.time_estimation,
                backlog=backlog
            )

        group.project = project
        group.save()

        serializer = ProjectSerializer(project)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
# Retourne les détails d'un projet pour un groupe
class FetchProjectDetailsView(APIView):
    def get(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
            project = group.assigned_project
            if project:
                return Response({
                    'project_name': project.name,
                    'current_sprint': project.current_sprint,
                    'scrum_master': project.scrum_master,
                    'product_owner': project.product_owner,
                    'developers': project.developers
                }, status=status.HTTP_200_OK)
            return Response({"detail": "Projet pas trouvé"}, status=status.HTTP_404_NOT_FOUND)
        except Group.DoesNotExist:
            return Response({"detail": "Groupe aps trouvé"}, status=status.HTTP_404_NOT_FOUND)
        
# Retourne les membres d'un groupe
class GroupMembersViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'], url_path='group-members')
    def list_group_members(self, request):
        user = request.user
        group = Group.objects.filter(users=user).first()  
        if not group:
            return Response({'error': 'L\'utilisateur n\'appartient à aucun groupe'}, status=status.HTTP_404_NOT_FOUND)
        
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
                return Response({'detail': 'Pas trouvé.'}, status=404)
        except GroupPhaseStatus.DoesNotExist:
            return Response({'detail': 'Pas trouvé.'}, status=404)

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

        return Response({'status': 'Réponse soumise avec succès'}, status=status.HTTP_200_OK)

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
            return Response({'error': 'Groupe pas trouvé'}, status=status.HTTP_404_NOT_FOUND)

# Met à jour le statut d'une phase de jeu pour un groupe
class UpdatePhaseStatusView(APIView):
    def post(self, request, group_id, phase_id):
        group = get_object_or_404(Group, id=group_id)
        phase = get_object_or_404(GamePhase, id=phase_id)
        new_status = request.data.get('status')

        if not new_status:
            return Response({'error': 'Statut est requis'}, status=status.HTTP_400_BAD_REQUEST)

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

        return Response({'status': 'Statut mis à jour avec succès'}, status=status.HTTP_200_OK)
    
# Retourne des users stories pour un groupe ( si pas de paramètre ids, retourne toutes les user stories du backlog)
class FetchUserStoriesView(APIView):
    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        project = group.project
        if not project:
            return Response({"detail": "Pas de projet trouvé pour ce groupe"}, status=status.HTTP_404_NOT_FOUND)
        
        backlog = project.backlog
        if not backlog:
            return Response({"detail": "Pas de backlog trouvé pour ce projet"}, status=status.HTTP_404_NOT_FOUND)

        ids = request.data.get('ids', [])
        
        if ids:
            user_stories = UserStory.objects.filter(id__in=ids)
        else:
            user_stories = backlog.user_stories.all()
        
        data = [
            {
                "id": story.id,
                "name": story.name,
                "description": story.description,
                "business_value": story.business_value,
                "time_estimation": story.time_estimation,
                "backlog": story.backlog.id,
                "is_completed": story.is_completed,
                "sprint": story.sprint.id if story.sprint else None
            }
            for story in user_stories
        ]
        return Response(data, status=status.HTTP_200_OK)

# Retourne les user stories à découper pour un groupe
class FetchToCutUserStoriesView(APIView):
    def get(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        project = group.project
        if not project:
            return Response({"detail": "Pas de projet trouvé pour ce groupe"}, status=status.HTTP_404_NOT_FOUND)
        
        backlog = project.backlog
        if not backlog:
            return Response({"detail": "Pas de backlog trouvé pour ce projet"}, status=status.HTTP_404_NOT_FOUND)

        user_stories = UserStory.objects.filter(backlog=backlog, name__in=["Consulter le catalogue", "Ajouter au panier"])


        data = [{"id": story.id, "description": story.description, "business_value": story.business_value, "time_estimation": story.time_estimation.total_seconds()} for story in user_stories]
        return Response(data, status=status.HTTP_200_OK)

# Crée une nouvelle user story pour un groupe
class AddUserStoryView(APIView):
    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        project = group.project
        if not project:
            return Response({"detail": "Pas de projet trouvé pour ce groupe"}, status=status.HTTP_404_NOT_FOUND)

        backlog = project.backlog
        if not backlog:
            return Response({"detail": "Pas de backlog trouvé pour ce projet"}, status=status.HTTP_404_NOT_FOUND)

        name = request.data.get('name')
        description = request.data.get('description')
        sprint_id = request.data.get('sprint_id')


        if not name or not description:
            return Response({"detail": "Tous les champs sont requis"}, status=status.HTTP_400_BAD_REQUEST)
        
        sprint = None
        if sprint_id:
            sprint = get_object_or_404(Sprint, id=sprint_id, project=project)

        user_story = UserStory.objects.create(
            name=name,
            description=description,
            business_value=0,
            time_estimation=timedelta(0),
            backlog=backlog,
            has_been_created=True,
            sprint=sprint
        )

        return Response({
            "id": user_story.id,
            "name": user_story.name,
            "description": user_story.description,
            "business_value": user_story.business_value,
            "time_estimation": user_story.time_estimation.total_seconds(),
            "is_completed": user_story.is_completed,
            "sprint": user_story.sprint,
            "original_sprint_number": user_story.original_sprint_number,
            "has_been_created": user_story.has_been_created
        }, status=status.HTTP_201_CREATED)

# Supprime une user story pour un groupe
class DeleteUserStoryView(APIView):
    def delete(self, request, group_id, story_id):
        group = get_object_or_404(Group, id=group_id)
        project = group.project
        if not project:
            return Response({"detail": "Pas de projet trouvé pour ce groupe"}, status=status.HTTP_404_NOT_FOUND)
        
        backlog = project.backlog
        if not backlog:
            return Response({"detail": "Pas de backlog trouvé pour ce projet"}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            user_story = UserStory.objects.get(id=story_id, backlog=backlog)
            user_story.delete()
            return Response({"detail": "User story supprimée avec succès"}, status=status.HTTP_200_OK)
        except UserStory.DoesNotExist:
            return Response({"detail": "User story non trouvée"}, status=status.HTTP_404_NOT_FOUND)
        

# Met à jour les détails d'une user story pour un groupe
class UpdateUserStoryView(APIView):
    def put(self, request, group_id, user_story_id):
        try:
            user_story = get_object_or_404(UserStory, id=user_story_id, backlog__project__group__id=group_id)
        except UserStory.DoesNotExist:
            return Response({"detail": "User Story not found"}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        if 'business_value' in data:
            user_story.business_value = data['business_value']
        if 'name' in data:
            user_story.name = data['name']
        if 'description' in data:
            user_story.description = data['description']
        if 'time_estimation' in data:
            try:
               total_seconds = int(data['time_estimation'])
               user_story.time_estimation = timedelta(seconds=total_seconds)
            except ValueError:
                return Response({"detail": "Invalid time estimation value"}, status=status.HTTP_400_BAD_REQUEST)
        if 'is_completed' in data:
            user_story.is_completed = data['is_completed']
        if 'sprint' in data:
            user_story.sprint_id = data['sprint']
        if 'original_sprint_number' in data:
            user_story.original_sprint_number = data['original_sprint_number']

        user_story.save()
        return Response({
            "id": user_story.id,
            "name": user_story.name,
            "description": user_story.description,
            "business_value": user_story.business_value,
            "time_estimation": user_story.time_estimation.total_seconds(),  
            "is_completed": user_story.is_completed,
            "sprint": user_story.sprint.id if user_story.sprint else None,
            "original_sprint_number": user_story.original_sprint_number
        }, status=status.HTTP_200_OK)

# Met à jour les champs de sprint pour les user stories d'un groupe
class UpdateSprintFieldsView(APIView):
    def put(self, request, group_id):
        data = request.data
        user_story_ids = data.get('user_story_ids', [])
        original_sprint_number = data.get('original_sprint_number', 1)

        if not user_story_ids:
            return Response({"detail": "User story IDs must be provided."}, status=status.HTTP_400_BAD_REQUEST)

        backlog = get_object_or_404(Backlog, project__group__id=group_id)
        sprint = get_object_or_404(Sprint, backlog=backlog, sprint_number=original_sprint_number)

        user_stories = UserStory.objects.filter(id__in=user_story_ids, backlog=backlog)
        for story in user_stories:
            story.sprint = sprint
            story.original_sprint_number = original_sprint_number
            story.save()

        return Response({"detail": "User stories updated successfully."}, status=status.HTTP_200_OK)

# Retourne les user stories crées par un groupe
class FetchCreatedUserStoriesView(APIView):
    def get(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        project = group.project
        if not project:
            return Response({"detail": "Pas de projet trouvé pour ce groupe"}, status=status.HTTP_404_NOT_FOUND)

        user_stories = UserStory.objects.filter(backlog__project=project, has_been_created=True)
        data = [
            {
                "id": story.id,
                "name": story.name,
                "description": story.description,
                "business_value": story.business_value,
                "time_estimation": story.time_estimation.total_seconds()
            } for story in user_stories
        ]

        return Response(data, status=status.HTTP_200_OK)

# Crée un nouveau sprint pour un groupe
class CreateSprintView(APIView):
    def post(self, request, group_id):
        backlog = get_object_or_404(Backlog, project__group_id=group_id)
        sprint_number = request.data.get('sprint_number', 1)

        sprint = Sprint.objects.create(
            backlog=backlog,
            sprint_number=sprint_number
        )

        serializer = SprintSerializer(sprint)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# Retourne les détails du sprint actuel pour un groupe
class GetSprintDetailsView(APIView):
    def get(self, request, group_id):
        sprint = get_object_or_404(Sprint, backlog__project__group_id=group_id, is_completed=False)
        serializer = SprintSerializer(sprint)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Retourne les user stories du sprint actuel pour un groupe
class SprintUserStoriesView(APIView):
    def get(self, request, group_id):
        try:
            sprint = Sprint.objects.get(backlog__project__group_id=group_id, is_completed=False)
            user_stories = UserStory.objects.filter(
                backlog=sprint.backlog,
                original_sprint_number=sprint.sprint_number
            )
            serializer = UserStorySerializer(user_stories, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Sprint.DoesNotExist:
            return Response({"error": "Sprint not found."}, status=status.HTTP_404_NOT_FOUND)