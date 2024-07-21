from rest_framework import serializers
from .models import GameTimeControl,Project, GamePhase, UserStory, Backlog, Sprint, Event, UserStoryTemplate, GroupPhaseStatus

class GameTimeControlSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameTimeControl
        fields = '__all__'

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'

class GamePhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = GamePhase
        fields = '__all__'

class GroupPhaseStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = GroupPhaseStatus
        fields = '__all__'

class UserStorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStory
        fields = '__all__'

    def update(self, instance, validated_data):
        if 'time_estimation' in validated_data:
            time_estimation = validated_data.pop('time_estimation')
            validated_data['time_estimation'] = timedelta(hours=time_estimation)
        return super().update(instance, validated_data)

class BacklogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Backlog
        fields = '__all__'

class SprintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sprint
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class UserStoryTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStoryTemplate
        fields = '__all__'
