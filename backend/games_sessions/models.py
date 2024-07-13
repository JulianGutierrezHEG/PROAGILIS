from django.db import models, transaction
from django.db.models import CASCADE, SET_NULL
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
    created_by = models.ForeignKey(User, related_name='sessions', on_delete=CASCADE)
    groups = models.ManyToManyField('Group', blank=True, related_name='sessions')
    number_of_groups = models.IntegerField()
    group_size = models.IntegerField()
    password = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')

    def __str__(self):
        return self.name

    def delete(self, *args, **kwargs):
        with transaction.atomic():
            self.groups.all().delete()
        super(Session, self).delete(*args, **kwargs)

class Group(models.Model):
    name = models.CharField(max_length=200, blank=True)  
    users = models.ManyToManyField(User, related_name='games_sessions', blank=True)
    current_phase = models.ForeignKey('games.GamePhase', on_delete=SET_NULL, null=True, blank=True, related_name='groups')
    project = models.OneToOneField('games.Project', on_delete=SET_NULL, null=True, blank=True, related_name='assigned_group')

    def __str__(self):
        return self.name
