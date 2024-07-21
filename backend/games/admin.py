from django.contrib import admin
from .models import Project, UserStoryTemplate,Event

admin.site.register(Project)
admin.site.register(UserStoryTemplate)
admin.site.register(Event)
