from django.shortcuts import render
from .models import Session
from rest_framework import generics
from .serializers import SessionSerializer

class SessionList(generics.ListCreateAPIView):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer