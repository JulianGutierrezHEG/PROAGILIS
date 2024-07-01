from django.db import models
from users.models import User

class Session(models.Model):
    name = models.CharField(max_length=200)
    start_date = models.DateField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, related_name='sessions', on_delete=models.CASCADE)
    groups = models.ManyToManyField('Group', blank=True)
    number_of_groups = models.IntegerField()
    group_size = models.IntegerField()
    password = models.CharField(max_length=200)

    def __str__(self):
        return self.name

class Group(models.Model):
    name = models.CharField(max_length=200)
    users = models.ManyToManyField(CustomUser, related_name='groups', blank=True)

    def __str__(self):
        return self.name
