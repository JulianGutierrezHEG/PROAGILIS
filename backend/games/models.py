from django.db import models,transaction
from django.db.models import CASCADE, SET_NULL
from games_sessions.models import Group
from datetime import timedelta

class GameTimeControl(models.Model):
    game_hours = models.IntegerField(default=1)  
    real_minutes = models.IntegerField(default=1)  
    sprint_duration = models.IntegerField(default=14)

    def __str__(self):
        return f"{self.real_minutes} minutes réel = {self.game_hours} heurs en jeu pour un sprint de {self.sprint_duration} jours en jeu"

class Project(models.Model):
    name = models.CharField(max_length=200)
    group = models.OneToOneField(Group, on_delete=SET_NULL, null=True, blank=True, related_name='assigned_project')
    scrum_master = models.CharField(max_length=100, blank=True, null=True)
    product_owner = models.CharField(max_length=100, blank=True, null=True)
    developers = models.JSONField(default=list)
    current_sprint = models.IntegerField(default=1)

    def __str__(self):
        return self.name

class GamePhase(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    requires_validation = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class GroupPhaseStatus(models.Model):
    STATUS_CHOICES = [
        ('not_started', 'Non commencé'),
        ('in_progress', 'En cours'),
        ('pending', 'En attente de validation'),
        ('completed', 'Complété'),
        ('wrong', 'Fausse réponse')
    ]

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='phase_statuses')
    phase = models.ForeignKey(GamePhase, on_delete=models.CASCADE, related_name='group_statuses')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    answer = models.JSONField(blank=True, null=True)

    class Meta:
        unique_together = ('group', 'phase')

    def __str__(self):
        return f"{self.group.name} - {self.phase.name} ({self.status})"
    
class Backlog(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE)

    def __str__(self):
        return f"Backlog for {self.project.name}"

class Sprint(models.Model):
    backlog = models.ForeignKey(Backlog, on_delete=models.CASCADE)
    sprint_number = models.IntegerField(default=1)
    current_progress = models.DurationField(default=timedelta)
    is_completed = models.BooleanField(default=False)

    def __str__(self):
        return f"Sprint {self.sprint_number} for {self.backlog.project.name}"

class UserStory(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    business_value = models.IntegerField()
    time_estimation = models.DurationField()
    backlog = models.ForeignKey('Backlog', on_delete=models.CASCADE, related_name='user_stories')
    is_completed = models.BooleanField(default=False)
    sprint = models.ForeignKey('Sprint', on_delete=models.SET_NULL, null=True, blank=True, related_name='stories')
    original_sprint_number = models.IntegerField(default=0)
    has_been_created = models.BooleanField(default=False)
    progress_time = models.DurationField(default=timedelta)

    def __str__(self):
        return self.description

class UserStoryTemplate(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    business_value = models.IntegerField()
    time_estimation = models.DurationField()

    def __str__(self):
        return self.description

class Event(models.Model):
    description = models.TextField()
    effect = models.TextField(null=True, blank=True)  
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    answer = models.TextField(null=True, blank=True)  

    def __str__(self):
        return self.description

class EventTemplate(models.Model):
    description = models.TextField()
    effect = models.TextField(null=True, blank=True) 

    def __str__(self):
        return self.description


class SavedGameData(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='saved_game_data')
    phase_1_answer = models.JSONField(blank=True, null=True)
    phase_2_answer = models.JSONField(blank=True, null=True)
    completed_user_story_names = models.JSONField()
    created_user_stories = models.JSONField(blank=True, null=True)
    current_sprint = models.IntegerField()

    def __str__(self):
        return f"Saved game data for group {self.group.name} at {self.timestamp}"
