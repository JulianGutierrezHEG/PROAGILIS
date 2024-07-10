from rest_framework import serializers
from .models import Session, Group
from users.serializers import CustomUserDetailsSerializer

class GroupSerializer(serializers.ModelSerializer):
    users = CustomUserDetailsSerializer(many=True, read_only=True)
    current_phase = serializers.CharField()

    class Meta:
        model = Group
        fields = ['id','name','users', 'current_phase', 'project']

class SessionSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)

    class Meta:
        model = Session
        fields = ['id', 'name', 'start_date', 'created_by', 'groups', 'number_of_groups', 'group_size', 'password', 'status']