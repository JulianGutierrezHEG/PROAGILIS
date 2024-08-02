from rest_framework import viewsets
from rest_framework import status
from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from django.http import HttpRequest
from django.http import JsonResponse
from rest_framework.decorators import action
from rest_framework import status
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.shortcuts import get_object_or_404
from datetime import timedelta
from django.http import QueryDict
import random
from games_sessions.models import Group
from .models import GamePhase, GroupPhaseStatus,Project,Backlog,UserStory,UserStoryTemplate,Sprint,GameTimeControl,EventTemplate,Event,SavedGameData
from .serializers import GroupPhaseStatusSerializer,GamePhaseSerializer,ProjectSerializer,SprintSerializer,UserStorySerializer,EventSerializer
from .utils import update_group_phase_status

# Retourne les détails de la configuration du temps de jeu
class GameTimeControlView(APIView):
    def get(self, request):
        try:
            game_time_control = GameTimeControl.objects.first()  
            return Response({
                "game_hours": game_time_control.game_hours,
                "real_minutes": game_time_control.real_minutes,
                "sprint_duration": game_time_control.sprint_duration
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

# Récupère la phase de jeu actuelle pour l'affichage
class PhaseDisplayView(APIView):
    def get(self, request, group_id):
        try:
            group = Group.objects.get(id=group_id)
            current_phase = group.current_phase_id
            current_phase_status = GroupPhaseStatus.objects.filter(group=group,phase=current_phase).first()
            current_sprint = Sprint.objects.filter(backlog__project=group.project).last()
            
            if current_sprint:
                response_text = f"Le groupe {group_id} est à la phase {current_phase} pour le sprint {current_sprint.sprint_number}, confirmé par le status qui est également à la phase {current_phase_status.phase.id} avec le status {current_phase_status.status}."
            else:
                response_text = f"Le groupe {group_id} est à la phase {current_phase} mais pas encore de sprint créé, confirmé par le status qui est également à la phase {current_phase_status.phase.id} avec le status {current_phase_status.status}."

            return Response({"detail": response_text}, status=status.HTTP_200_OK)
        except Group.DoesNotExist:
            return Response({"detail": "Groupe non trouvé."}, status=status.HTTP_404_NOT_FOUND)

# Crée un nouveau projet pour un groupe
# Crée un backlog, des user stories, un sprint et des événements pour le projet
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

        
        sprint = Sprint.objects.create(
            backlog=backlog,
            sprint_number=1
        )

        event_templates = EventTemplate.objects.all()
        for template in event_templates:
            Event.objects.create(
                description=template.description,
                effect=template.effect,
                project=project
            )

        group.project = project
        group.save()

        project_serializer = ProjectSerializer(project)
        sprint_serializer = SprintSerializer(sprint)
        response_data = {
            'project': project_serializer.data,
            'sprint': sprint_serializer.data
        }

        return Response(response_data, status=status.HTTP_201_CREATED)

    
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
            group_phase_status = GroupPhaseStatus.objects.filter(
                group__id=group_id, 
                status__in=['in_progress', 'pending', 'wrong']
            ).order_by('-phase_id').first() 
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
                "original_sprint_number": story.original_sprint_number,
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
            return Response({"detail": "User Story pas trouvé"}, status=status.HTTP_404_NOT_FOUND)

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
                return Response({"detail": "Temps ivalide"}, status=status.HTTP_400_BAD_REQUEST)
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

        if not user_story_ids:
            return Response({"detail": "User story IDs doit être renseigné"}, status=status.HTTP_400_BAD_REQUEST)

        backlog = get_object_or_404(Backlog, project__group__id=group_id)
        current_sprint = Sprint.objects.filter(backlog=backlog).order_by('-sprint_number').first()

        if not current_sprint:
            return Response({"detail": "No current sprint found for the group"}, status=status.HTTP_400_BAD_REQUEST)

        user_stories = UserStory.objects.filter(id__in=user_story_ids, backlog=backlog)
        for story in user_stories:
            story.sprint = current_sprint
            story.original_sprint_number = current_sprint.sprint_number
            story.save()

        return Response({"detail": "User stories mis à jour"}, status=status.HTTP_200_OK)

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
            return Response({"error": "Sprint pas trouvé"}, status=status.HTTP_404_NOT_FOUND)

# Met à jour le progrès du sprint actuel pour un groupe
class UpdateSprintProgressView(APIView):
    def post(self, request, group_id, sprint_id):
        try:
            group = Group.objects.get(id=group_id)
            sprint = Sprint.objects.get(id=sprint_id, backlog__project__group=group)
            game_time_control = GameTimeControl.objects.first()
            sprint_duration_real_time = game_time_control.sprint_duration * 24 * 60 * 60  

            if not sprint.is_completed:
                sprint.current_progress += timedelta(seconds=1)
                if sprint.current_progress.total_seconds() >= sprint_duration_real_time:
                    sprint.is_completed = True
                sprint.save()

            return Response({"detail": "Sprint progrès mis à jour"}, status=status.HTTP_200_OK)
        except (Sprint.DoesNotExist, Group.DoesNotExist, GameTimeControl.DoesNotExist):
            return Response({"detail": "Sprint, Groupe, ou GameTimeControl pas trouvé"}, status=status.HTTP_404_NOT_FOUND)

# Met à jour le progrès des user stories du sprint actuel pour un groupe
class UpdateUserStoryProgressView(APIView):
    def post(self, request, group_id, sprint_id, user_story_id):
        try:
            group = Group.objects.get(id=group_id)
            sprint = Sprint.objects.get(id=sprint_id, backlog__project__group=group)
            story = UserStory.objects.get(id=user_story_id, sprint=sprint)
            if not story.is_completed:
                story.progress_time += timedelta(seconds=1)  
                if story.progress_time >= story.time_estimation:
                    story.is_completed = True
                story.save()

            return Response({"detail": "User story progrès mis à jour"}, status=status.HTTP_200_OK)
        except (Sprint.DoesNotExist, Group.DoesNotExist, UserStory.DoesNotExist):
            return Response({"detail": "Sprint, Groupe, ou GameTimeControl pas trouvé"}, status=status.HTTP_404_NOT_FOUND)

# Retourne le progrès du sprint actuel pour un groupe
class GetSprintProgressView(APIView):
    def get(self, request, group_id, sprint_id):
        try:
            group = Group.objects.get(id=group_id)
            sprint = Sprint.objects.get(id=sprint_id, backlog__project__group=group)
            
            progress_data = {
                "sprint_number": sprint.sprint_number,
                "current_progress": sprint.current_progress,
                "is_completed": sprint.is_completed,
            }

            return Response(progress_data, status=status.HTTP_200_OK)
        except (Sprint.DoesNotExist, Group.DoesNotExist):
            return Response({"detail": "Sprint ou Groupe pas trouvé"}, status=status.HTTP_404_NOT_FOUND)

# Retourne le progrès des user stories du sprint actuel pour un groupe
class GetUserStoriesProgressView(APIView):
    def get(self, request, group_id, sprint_id):
        try:
            group = Group.objects.get(id=group_id)
            sprint = Sprint.objects.get(id=sprint_id, backlog__project__group=group)
            stories = sprint.stories.all()

            user_stories_data = [
                {
                    "id": story.id,
                    "name": story.name,
                    "progress_time": story.progress_time,
                    "time_estimation": story.time_estimation,
                    "is_completed": story.is_completed,
                }
                for story in stories
            ]

            return Response(user_stories_data, status=status.HTTP_200_OK)
        except (Sprint.DoesNotExist, Group.DoesNotExist):
            return Response({"detail": "Sprint ou Groupe pas trouvé"}, status=status.HTTP_404_NOT_FOUND)


# Marque une user story comme complétée
class CompleteUserStoryView(APIView):
    def post(self, request, group_id, sprint_id, story_id):
        try:
            group = Group.objects.get(id=group_id)
            sprint = Sprint.objects.get(id=sprint_id, backlog__project__group=group)
            user_story = UserStory.objects.get(id=story_id, sprint=sprint)
            user_story.is_completed = True
            user_story.save()
            return Response({"detail": "User story complétée"}, status=status.HTTP_200_OK)
        except (Group.DoesNotExist, Sprint.DoesNotExist, UserStory.DoesNotExist):
            return Response({"detail": "Groupe, Sprint, ou User Story pas trouvé"}, status=status.HTTP_404_NOT_FOUND)

# Récupère un événement aléatoire pour un groupe
class FetchSprintRandomEventView(APIView):
    def get(self, request, group_id):
        project = get_object_or_404(Project, group_id=group_id)
        
        if project.current_event and not project.current_event.answer:
            event = project.current_event
        else:
            events = Event.objects.filter(project=project, effect__isnull=False, answer__isnull=True)
            
            if not events.exists():
                return Response({"detail": "Pas d'événements trouvés"}, status=status.HTTP_404_NOT_FOUND)
            
            event = random.choice(events)
            project.current_event = event
            project.save()

        serializer = EventSerializer(event)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Récupère un commentaire client aléatoire pour un groupe
class FetchSprintRandomClientCommentView(APIView):
    def get(self, request, group_id):
        project = get_object_or_404(Project, group_id=group_id)
        if project.current_client_comment:
            serializer = EventSerializer(project.current_client_comment)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        events = Event.objects.filter(project=project, effect__isnull=True)
        
        if not events.exists():
            return Response({"detail": "Pas de commentaire clients trouvés"}, status=status.HTTP_404_NOT_FOUND)
        
        event = random.choice(events)
        project.current_client_comment = event
        project.save()
        serializer = EventSerializer(event)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Met à jour la réponse d'un événement pour un groupe
class UpdateEventAnswerView(APIView):
    def post(self, request, group_id, event_id):
        event = get_object_or_404(Event, id=event_id, project__group_id=group_id)
        answer = request.data.get('answer')
        
        if answer is not None:
            event.answer = answer
            event.save()
            return Response({"detail": "Réponse mise à jour"}, status=status.HTTP_200_OK)
        return Response({"detail": "Réponse requise"}, status=status.HTTP_400_BAD_REQUEST)

# Retourne les événements pour un groupe
class GetEventsView(APIView):
    def post(self, request, group_id):
        event_ids = request.data.get('eventIds', [])
        events = Event.objects.filter(id__in=event_ids, project__group_id=group_id)
        serializer = EventSerializer(events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Retourne les événements répondus pour un groupe
class FetchAnsweredEventsView(APIView):
    def get(self, request, group_id):
        project = get_object_or_404(Project, group_id=group_id)
        answered_events = Event.objects.filter(project=project, effect__isnull=False, answer__isnull=False)

        if not answered_events.exists():
            return Response({"detail": "Pas d'événements trouvés"}, status=status.HTTP_404_NOT_FOUND)

        serializer = EventSerializer(answered_events, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Applique l'effet d'un événement pour un groupe
class ApplyEventEffectView(APIView):
    def post(self, request, group_id, event_id):
        event = get_object_or_404(Event, id=event_id, project__group_id=group_id)
        effect = event.effect

        if effect is not None:
            project = event.project
            sprint = Sprint.objects.filter(backlog__project=project, is_completed=False).first()
            game_time_control = GameTimeControl.objects.first()

            if not sprint:
                return Response({"detail": "Pas de sprint actif pour ce projet"}, status=status.HTTP_400_BAD_REQUEST)

            user_stories = UserStory.objects.filter(sprint=sprint, is_completed=False)
            time_change = timedelta(hours=random.randint(1, 3))
            affected_entity = ""

            if not user_stories.exists() or random.random() < 0.5:
                sprint_max_time = game_time_control.sprint_duration * 24 * 3600
                current_time = sprint.current_progress.total_seconds()
                time_to_end = sprint_max_time - current_time

                if effect == 'positif':
                    time_change = min(time_change, timedelta(seconds=time_to_end))
                    sprint.current_progress += time_change
                else:
                    sprint.current_progress -= time_change
                    if sprint.current_progress < timedelta():
                        sprint.current_progress = timedelta()
                if sprint.current_progress.total_seconds() >= sprint_max_time:
                    sprint.is_completed = True
                sprint.save()
                affected_entity = "sprint"
            else:
                story = random.choice(user_stories)
                story_max_time = story.time_estimation.total_seconds()
                current_time = story.progress_time.total_seconds()
                time_to_end = story_max_time - current_time

                if effect == 'positif':
                    time_change = min(time_change, timedelta(seconds=time_to_end))
                    story.progress_time += time_change
                else:
                    story.progress_time -= time_change
                    if story.progress_time < timedelta():
                        story.progress_time = timedelta()
                if story.progress_time.total_seconds() >= story_max_time:
                    story.is_completed = True
                story.save()
                affected_entity = f"user story {story.name}"

            return Response({
                "detail": "Effet appliqué avec succès",
                "effect_type": effect,
                "affected_entity": affected_entity,
                "time_change_seconds": time_change.total_seconds()
            }, status=status.HTTP_200_OK)

        return Response({"detail": "Pas d'effet trouvé pour cet événement"}, status=status.HTTP_404_NOT_FOUND)


# Sauvegarde les données du jeu pour un groupe
class SaveGameDataView(APIView):
    def post(self, request, group_id):
        group = get_object_or_404(Group, id=group_id)
        project = get_object_or_404(Project, group=group)

        phase_1_status = GroupPhaseStatus.objects.filter(group=group, phase_id=1).first()
        phase_2_status = GroupPhaseStatus.objects.filter(group=group, phase_id=2).first()

        phase_1_answer = phase_1_status.answer if phase_1_status else None
        phase_2_answer = phase_2_status.answer if phase_2_status else None

        completed_user_stories = UserStory.objects.filter(backlog__project__group=group, is_completed=True, has_been_created=False)
        completed_user_story_names = list(completed_user_stories.values_list('name', flat=True))

        created_user_stories = UserStory.objects.filter(backlog__project__group=group, has_been_created=True, is_completed=False)
        created_user_story_infos = list(created_user_stories.values('id', 'name', 'description', 'business_value', 'is_completed', 'sprint_id', 'original_sprint_number', 'time_estimation', 'progress_time'))

        for story in created_user_story_infos:
            story['time_estimation'] = story['time_estimation'].total_seconds()
            story['progress_time'] = story['progress_time'].total_seconds()

        original_sprint_numbers = {story.name: story.original_sprint_number for story in UserStory.objects.filter(backlog__project__group=group)}

        group_users = group.users.all()
        user_details = list(group_users.values('id', 'username', 'email'))

        data = {
            "group": {
                "id": group.id,
                "name": group.name,
                "users": user_details
            },
            "phase_1_answer": phase_1_answer,
            "phase_2_answer": phase_2_answer,
            "completed_user_story_names": completed_user_story_names,
            "created_user_stories": created_user_story_infos,
            "current_sprint": project.current_sprint,
            "original_sprint_numbers": original_sprint_numbers
        }

        SavedGameData.objects.update_or_create(
            group=group,
            defaults={
                'phase_1_answer': phase_1_answer,
                'phase_2_answer': phase_2_answer,
                'completed_user_story_names': completed_user_story_names,
                'created_user_stories': created_user_story_infos,
                'current_sprint': project.current_sprint,
                'original_sprint_numbers': original_sprint_numbers
            }
        )

        print("Données sauvegardée:", data)  
        return JsonResponse(data)

    
# Supprime un projet pour un groupe
class DeleteProjectView(APIView):
    def delete(self, request, group_id):
        try:
            group = get_object_or_404(Group, id=group_id)
            project = get_object_or_404(Project, group=group)

            project.delete()

            return JsonResponse({"detail": "Projet et données supprimées"}, status=200)
        except Group.DoesNotExist:
            return JsonResponse({"detail": "Groupe pas trouvé"}, status=404)
        except Project.DoesNotExist:
            return JsonResponse({"detail": "Projet pas trouvé"}, status=404)

# Crée la boucle de jeu pour un groupe
class LoopView(APIView):
    def post(self, request, group_id):
        saved_data = get_object_or_404(SavedGameData, group_id=group_id)
        group = saved_data.group

        GroupPhaseStatus.objects.filter(group=group).update(answer=None, status='not_started')

        phase_3 = get_object_or_404(GamePhase, id=3)
        group.current_phase = phase_3
        group.save()

        phase_1 = get_object_or_404(GamePhase, id=1)
        phase_2 = get_object_or_404(GamePhase, id=2)

        GroupPhaseStatus.objects.update_or_create(
            group=group,
            phase=phase_1,
            defaults={'answer': saved_data.phase_1_answer, 'status': 'completed'}
        )

        GroupPhaseStatus.objects.update_or_create(
            group=group,
            phase=phase_2,
            defaults={'answer': saved_data.phase_2_answer, 'status': 'completed'}
        )

        GroupPhaseStatus.objects.update_or_create(
            group=group,
            phase=phase_3,
            defaults={'status': 'in_progress'}
        )

        phase_1_answer = saved_data.phase_1_answer or {}
        project_name = phase_1_answer.get('projectName')
        roles = phase_1_answer.get('roles', {})
        
        project = Project.objects.create(
            name=project_name,
            group=group,
            scrum_master=roles.get('scrumMaster'),
            product_owner=roles.get('productOwner'),
            developers=roles.get('developers', []),
            current_sprint=saved_data.current_sprint + 1
        )

        backlog = Backlog.objects.create(project=project)

        sprint_number = saved_data.current_sprint + 1
        sprint = Sprint.objects.create(
            backlog=backlog,
            sprint_number=sprint_number
        )

        user_story_templates = UserStoryTemplate.objects.all()
        for template in user_story_templates:
            UserStory.objects.create(
                name=template.name,
                description=template.description,
                business_value=template.business_value,
                time_estimation=template.time_estimation,
                backlog=backlog
            )

        event_templates = EventTemplate.objects.all()
        for template in event_templates:
            Event.objects.create(
                description=template.description,
                effect=template.effect,
                project=project
            )

        group.project = project
        group.save()

        for name in saved_data.completed_user_story_names:
            UserStory.objects.filter(backlog=backlog, name=name).update(is_completed=True)

        for story_data in saved_data.created_user_stories:
            UserStory.objects.create(
                name=story_data['name'],
                description=story_data['description'],
                business_value=story_data['business_value'],
                time_estimation=timedelta(seconds=story_data['time_estimation']),
                backlog=backlog,
                is_completed=story_data['is_completed'],
                sprint_id=sprint.id,
                original_sprint_number=project.current_sprint,
                progress_time=timedelta(seconds=story_data['progress_time'])
            )

        original_sprint_numbers = saved_data.original_sprint_numbers or {}
        for story_name, original_sprint_number in original_sprint_numbers.items():
            UserStory.objects.filter(backlog=backlog, name=story_name).update(original_sprint_number=original_sprint_number)
        
        return JsonResponse({"detail": "Loop faite"}, status=200)
 
# Supprime les données sauvegardées 
class DeleteSavedGameDataView(APIView):
    def delete(self, request, group_id):
        saved_data = get_object_or_404(SavedGameData, group_id=group_id)
        saved_data.delete()
        return Response({"detail": "Données supprimées"}, status=status.HTTP_204_NO_CONTENT)
