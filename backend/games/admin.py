from django.contrib import admin
from .models import Project, UserStoryTemplate, BacklogTemplate, Event

admin.site.register(Project)
admin.site.register(UserStoryTemplate)
admin.site.register(BacklogTemplate)
admin.site.register(Event)
