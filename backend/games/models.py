from django.db import models
from games_sessions.models import Group

class Project(models.Model):
    name = models.CharField(max_length=200)
    group = models.OneToOneField(Group, related_name='project', on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class GamePhase(models.Model):
    STATUS_CHOICES = [
        ('not_started', 'Non commencé'),
        ('in_progress', 'En cours'),
        ('pending', 'En attente de validation'),
        ('completed', 'Complété'),
        ('wrong', 'Fausse réponse'),
        ('correct_waiting', 'Juste, en attente'),
        ('wrong_waiting', 'Fausse, en attente'),
        ('finished', 'Terminé')
    ]

    name = models.CharField(max_length=200)
    project = models.ForeignKey(Project, related_name='phases', on_delete=models.CASCADE)
    answer = models.TextField(blank=True, null=True)
    correct_answer = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')

    def __str__(self):
        return self.name
