from rest_framework import serializers
from .models import Session, Group
from users.serializers import CustomUserDetailsSerializer
from games.serializers import GamePhaseSerializer

class GroupSerializer(serializers.ModelSerializer):
    users = CustomUserDetailsSerializer(many=True, read_only=True)
    current_phase = GamePhaseSerializer(read_only=True)  

    class Meta:
        model = Group
        fields = '__all__'

class SessionSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)

    class Meta:
        model = Session
        fields = ['id', 'name', 'start_date', 'created_by', 'groups', 'number_of_groups', 'group_size', 'password', 'status']