from rest_framework import serializers
from .models import Session, Group
from users.serializers import CustomUserDetailsSerializer

class GroupSerializer(serializers.ModelSerializer):
    users = CustomUserDetailsSerializer(many=True, read_only=True)
    current_phase = serializers.CharField()

    class Meta:
        model = Group
        fields = ['id','users', 'current_phase']

class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Session
        fields = '__all__'
        extra_kwargs = {
            'name': {'required': True},
            'number_of_groups': {'required': True},
            'group_size': {'required': True},
            'password': {'required': True},
            'created_by': {'required': True},
        }