from rest_framework import serializers
from .models import Session, Group
from users.serializers import CustomUserDetailsSerializer

class GroupSerializer(serializers.ModelSerializer):
    users = CustomUserDetailsSerializer(many=True, read_only=True)

    class Meta:
        model = Group
        fields = ['id', 'name', 'users']

class SessionSerializer(serializers.ModelSerializer):
    created_by = CustomUserDetailsSerializer(read_only=True)
    groups = GroupSerializer(many=True, read_only=True)

    class Meta:
        model = Session
        fields = ['id', 'name', 'start_date', 'created_by', 'groups', 'number_of_groups', 'group_size', 'password']