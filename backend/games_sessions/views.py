from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.shortcuts import get_object_or_404
from .models import Session,Group,User
from games.utils import update_group_phase_status
from games.models import GamePhase,GroupPhaseStatus,Project
from .serializers import SessionSerializer, GroupSerializer

class SessionCreateView(generics.CreateAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

    def perform_create(self, serializer):
        session = serializer.save(created_by=self.request.user, status='not_started')
    
        groups = []
        for i in range(1, session.number_of_groups + 1): 
            group = Group.objects.create(name=f"Groupe {i}")
            groups.append(group)
        
        session.groups.set(groups)
        session.save()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"session_{session.id}",
            {
                'type': 'session_status_update',
                'session_id': session.id,
                'status': 'not_started',
            }
        )

        return session

class SessionDeleteView(generics.DestroyAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

    def get_object(self):
        obj = super().get_object()
        if obj.created_by != self.request.user:
            raise PermissionDenied("You do not have permission to delete this session.")
        return obj

    def perform_destroy(self, instance):
        session_id = instance.id
        # Fetch all groups related to the session
        groups = instance.groups.all()
        # Delete all related projects
        for group in groups:
            try:
                project = group.assigned_project
                if project:
                    project.delete()
            except Group.assigned_project.RelatedObjectDoesNotExist:
                pass
        
        # Delete the session
        super().perform_destroy(instance)
        
        # Send WebSocket message
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"session_{session_id}",
            {
                'type': 'session_deleted',
                'session_id': session_id,
            }
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

class StartSessionView(APIView):
    def post(self, request, session_id):
        session = get_object_or_404(Session, id=session_id)
        session.status = 'active'
        session.save()

        phase_one = get_object_or_404(GamePhase, id=1)
        for group in session.groups.all():
            group_phase_status, created = GroupPhaseStatus.objects.get_or_create(group=group, phase=phase_one)
            if created or group_phase_status.status in ['pending', 'not_started']:
                group_phase_status.status = 'in_progress'
                group_phase_status.save()
            group.current_phase = phase_one
            group.save()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"session_{session_id}",
            {
                'type': 'session_status_update',
                'session_id': session_id,
                'status': 'active'
            }
        )

        return Response({'status': 'Session started successfully.'}, status=status.HTTP_200_OK)

class StopSessionView(APIView):
    def post(self, request, session_id, *args, **kwargs):
        session = get_object_or_404(Session, id=session_id)
        session.status = 'paused'
        session.save()

        for group in session.groups.all():
            group_phase_status = GroupPhaseStatus.objects.filter(group=group).first()
            if group_phase_status:
                update_group_phase_status(group, group_phase_status.phase, 'pending')

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"session_{session_id}",
            {
                'type': 'session_status_update',
                'session_id': session_id,
                'status': 'paused'
            }
        )

        return Response({'status': 'Session paused successfully.'}, status=status.HTTP_200_OK)

class SessionListView(generics.ListAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

class SessionDetailView(generics.RetrieveAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

class UserCreatedSessionsListView(generics.ListAPIView):
    serializer_class = SessionSerializer

    def get_queryset(self):
        user = self.request.user
        return Session.objects.filter(created_by=user)

class GroupListView(generics.ListAPIView):
    serializer_class = GroupSerializer

    def get_queryset(self):
        session_id = self.kwargs.get('session_id')
        print(f"Fetching groups for session ID: {session_id}")  
        session = get_object_or_404(Session, id=session_id)
        groups = session.groups.all()
        print(f"Groups found: {groups}")  
        return groups

class GroupDetailView(generics.RetrieveAPIView):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer

class GetJoinedSessionView(APIView):
    def get(self, request):
        user_id = request.query_params.get('userId')
        user = get_object_or_404(User, id=user_id)
        group = Group.objects.filter(users=user).first()
        if group:
            session = Session.objects.filter(groups=group).first()
            if session:
                serializer = SessionSerializer(session)
                return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(status=status.HTTP_204_NO_CONTENT)

class GetUserSessionInfoView(APIView):
    def get(self, request):
        user_id = request.query_params.get('userId')
        user = get_object_or_404(User, id=user_id)
        group = Group.objects.filter(users=user).first()
        if group:
            session = group.sessions.first()
            if session:
                return Response({
                    'username': user.username,
                    'groupname': group.name,
                    'sessionname': session.name,
                    'session_id': session.id ,
                    'user_id': user.id,
                }, status=status.HTTP_200_OK)
        return Response({'detail': 'No joined session found'}, status=status.HTTP_404_NOT_FOUND)

class JoinSessionView(APIView):
    def post(self, request):
        session_id = request.data.get('sessionId')
        group_id = request.data.get('groupId')
        password = request.data.get('password')

        session = get_object_or_404(Session, id=session_id)
        if session.password != password:
            return Response({'success': False, 'detail': 'Incorrect password'}, status=status.HTTP_403_FORBIDDEN)

        group = get_object_or_404(Group, id=group_id)
        group.users.add(request.user)
        group.save()

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"group_{group_id}",
            {
                'type': 'user_joined_group',
                'event': 'user_joined_group',
                'user': request.user.id,
                'group_id': group_id,
                'username': request.user.username
            }
        )

        return Response({'success': True})
    
class LeaveSessionView(APIView):
    def post(self, request, session_id):
        user_id = request.data.get('userId')
        user = get_object_or_404(User, id=user_id)
        session = get_object_or_404(Session, id=session_id)
        group = Group.objects.filter(users=user, sessions=session).first()
        if group:
            group.users.remove(user)
        
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"group_{group.id}",
                {
                    'type': 'user_left_group',
                    'event': 'user_left_group',
                    'user': user.id,
                    'group_id': group.id,
                    'username': user.username
                }
            )
            return Response({'success': True}, status=status.HTTP_200_OK)
        return Response({'detail': 'User not in any group of this session'}, status=status.HTTP_400_BAD_REQUEST)

