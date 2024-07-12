from django.db import models,transaction
from django.db.models import CASCADE, SET_NULL
from games_sessions.models import Group
from datetime import timedelta

class Project(models.Model):
    name = models.CharField(max_length=200)
    group = models.OneToOneField(Group, on_delete=SET_NULL, null=True, blank=True, related_name='assigned_project')
    scrum_master = models.CharField(max_length=100, blank=True, null=True)
    product_owner = models.CharField(max_length=100, blank=True, null=True)
    developers = models.JSONField(default=list)

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

class UserStory(models.Model):
    description = models.TextField()
    business_value = models.IntegerField()
    time_estimation = models.DurationField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    is_completed = models.BooleanField(default=False)
    sprint = models.ForeignKey('Sprint', on_delete=models.SET_NULL, null=True, blank=True, related_name='stories')

    def __str__(self):
        return self.description

class Backlog(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user_stories = models.ManyToManyField(UserStory)

    def __str__(self):
        return f"Backlog for {self.project.name}"

class Sprint(models.Model):
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    user_stories = models.ManyToManyField(UserStory, through='SprintUserStory', related_name='related_sprints')
    current_progress = models.DurationField(default=timedelta)

    def __str__(self):
        return f"Sprint from {self.start_time} to {self.end_time}"

class SprintUserStory(models.Model):
    sprint = models.ForeignKey(Sprint, on_delete=models.CASCADE)
    user_story = models.ForeignKey(UserStory, on_delete=models.CASCADE)
    description = models.TextField()
    time_estimation = models.DurationField()
    completed = models.BooleanField(default=False)
    progress_time = models.DurationField(default=timedelta)

    def __str__(self):
        return f"Task: {self.description}"

class Event(models.Model):
    description = models.TextField()
    effect = models.JSONField()  
    sprint = models.ForeignKey(Sprint, on_delete=models.CASCADE)

    def __str__(self):
        return self.description

class UserStoryTemplate(models.Model):
    description = models.TextField()
    business_value = models.IntegerField()
    time_estimation = models.DurationField()

    def __str__(self):
        return self.description

class BacklogTemplate(models.Model):
    user_stories = models.ManyToManyField(UserStoryTemplate)

    def __str__(self):
        return "Backlog Template"
