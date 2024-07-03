from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import Session,Group,User
from games.models import GamePhase
from .serializers import SessionSerializer, GroupSerializer

class SessionCreateView(generics.CreateAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

    def perform_create(self, serializer):
        session = serializer.save(created_by=self.request.user)
    
        groups = []
        for i in range(1, session.number_of_groups + 1): 
            group = Group.objects.create(name=f"Groupe {i}")
            groups.append(group)
        
        session.groups.set(groups)
        session.save()

        return session

class SessionDeleteView(generics.DestroyAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

    def get_object(self):
        obj = super().get_object()
        if obj.created_by != self.request.user:
            raise PermissionDenied("You do not have permission to delete this session.")
        return obj

class SessionListView(generics.ListAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

class SessionDetailView(generics.RetrieveAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

class GroupListView(generics.ListAPIView):
    serializer_class = GroupSerializer

    def get_queryset(self):
        session_id = self.kwargs.get('session_id')
        print(f"Fetching groups for session ID: {session_id}")  
        session = get_object_or_404(Session, id=session_id)
        groups = session.groups.all()
        print(f"Groups found: {groups}")  
        return groups

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

        return Response({'success': True})

class GetJoinedSessionView(APIView):
    def get(self, request):
        user_id = request.query_params.get('userId')
        user = get_object_or_404(User, id=user_id)
        group = Group.objects.filter(users=user).first()
        if group:
            session = group.session_set.first()
            if session:
                serializer = SessionSerializer(session)
                return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({'detail': 'No joined session found'}, status=status.HTTP_404_NOT_FOUND)

class GetUserSessionInfoView(APIView):
    def get(self, request):
        user_id = request.query_params.get('userId')
        user = get_object_or_404(User, id=user_id)
        group = Group.objects.filter(users=user).first()
        if group:
            session = group.session_set.first()
            if session:
                return Response({
                    'username': user.username,
                    'groupname': group.name,
                    'sessionname': session.name,
                    'session_id': session.id ,
                    'user_id': user.id,
                }, status=status.HTTP_200_OK)
        return Response({'detail': 'No joined session found'}, status=status.HTTP_404_NOT_FOUND)


class LeaveSessionView(APIView):
    def post(self, request, session_id):
        user_id = request.data.get('userId')
        user = get_object_or_404(User, id=user_id)
        session = get_object_or_404(Session, id=session_id)
        group = Group.objects.filter(users=user, session=session).first()
        if group:
            group.users.remove(user)
            return Response({'success': True}, status=status.HTTP_200_OK)
        return Response({'detail': 'User not in any group of this session'}, status=status.HTTP_400_BAD_REQUEST)

class StartSessionView(APIView):
    def post(self, request, session_id):
        session = get_object_or_404(Session, id=session_id)
        session.status = 'active'
        session.save()

        print("Looking for Test phase in GamePhase table...")

        test_phase = GamePhase.objects.filter(name__iexact="Test phase").first()
        if not test_phase:
            print("Test Phase not found.")
            return Response({'error': 'Test Phase not found.'}, status=status.HTTP_404_NOT_FOUND)

        print(f"Test Phase found: {test_phase.name}")

        for group in session.groups.all():
            print(f"Setting phase for group: {group.name}")
            group.current_phase = test_phase.name
            group.save()

        return Response({'status': 'Session started successfully.'}, status=status.HTTP_200_OK)

class StopSessionView(APIView):
    def post(self, request, session_id, *args, **kwargs):
        session = get_object_or_404(Session, id=session_id)
        session.status = 'paused'
        session.save()
        return Response({'status': 'Session paused successfully.'}, status=status.HTTP_200_OK)