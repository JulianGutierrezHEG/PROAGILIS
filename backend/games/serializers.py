from rest_framework import serializers
from .models import GamePhase

class GamePhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = GamePhase
        fields = '__all__'

