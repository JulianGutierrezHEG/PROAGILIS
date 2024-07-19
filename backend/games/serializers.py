from rest_framework import serializers
from .models import Project, GamePhase, UserStory, Backlog, Sprint, SprintUserStory, Event, UserStoryTemplate, BacklogTemplate, GroupPhaseStatus

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

class SprintUserStorySerializer(serializers.ModelSerializer):
    user_story = UserStorySerializer()
    
    class Meta:
        model = SprintUserStory
        fields = ['id', 'sprint', 'user_story', 'description', 'time_estimation', 'completed', 'progress_time']

class SprintSerializer(serializers.ModelSerializer):
    user_stories = SprintUserStorySerializer(source='sprintuserstory_set', many=True, read_only=True)
    
    class Meta:
        model = Sprint
        fields = ['id', 'start_time', 'end_time', 'project', 'user_stories', 'current_progress']

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = ['id', 'description', 'effect', 'sprint']

class UserStoryTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStoryTemplate
        fields = ['id', 'description', 'business_value', 'time_estimation']

class BacklogTemplateSerializer(serializers.ModelSerializer):
    user_stories = UserStoryTemplateSerializer(many=True, read_only=True)
    
    class Meta:
        model = BacklogTemplate
        fields = ['id', 'user_stories']
