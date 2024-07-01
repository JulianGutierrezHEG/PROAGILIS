from rest_framework import generics
from .models import Session
from .serializers import SessionSerializer

class SessionCreateView(generics.CreateAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

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