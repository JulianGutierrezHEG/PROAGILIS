from django.db import models
from users.models import User

class Session(models.Model):
    STATUS_CHOICES = [
        ('not_started', 'Non commencé'),
        ('active', 'En cours'),
        ('paused', 'En pause'),
        ('finished', 'Terminé')
    ]

    name = models.CharField(max_length=200)
    start_date = models.DateField(auto_now_add=True)
    created_by = models.ForeignKey(User, related_name='sessions', on_delete=models.CASCADE)
    groups = models.ManyToManyField('Group', blank=True)
    number_of_groups = models.IntegerField()
    group_size = models.IntegerField()
    password = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')

    def __str__(self):
        return self.name

class Group(models.Model):
    users = models.ManyToManyField(User, related_name='games_sessions', blank=True)
    current_phase = models.CharField(max_length=100, blank=True, null=True)  

    def __str__(self):
        return self.name