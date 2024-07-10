from rest_framework import serializers
from .models import Project, GamePhase, UserStory, Backlog, Sprint, SprintUserStory, Event, UserStoryTemplate, BacklogTemplate

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'group']

class GamePhaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = GamePhase
        fields = ['id', 'name', 'description', 'project', 'answer', 'status', 'requires_validation']

class UserStorySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStory
        fields = ['id', 'description', 'business_value', 'time_estimation', 'project', 'is_completed', 'sprint']

class BacklogSerializer(serializers.ModelSerializer):
    user_stories = UserStorySerializer(many=True, read_only=True)
    
    class Meta:
        model = Backlog
        fields = ['id', 'project', 'user_stories']

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
