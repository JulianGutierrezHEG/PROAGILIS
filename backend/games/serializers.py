from rest_framework import serializers
from .models import Project, GamePhase

class GamePhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = GamePhase
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    phases = GamePhaseSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = '__all__'
