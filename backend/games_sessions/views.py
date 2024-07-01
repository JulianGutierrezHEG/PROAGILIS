from rest_framework import generics
from .models import Session
from .serializers import SessionSerializer

class SessionCreateView(generics.CreateAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class SessionListView(generics.ListAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer