# Generated by Django 5.0.6 on 2024-07-21 12:10

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0007_userstorytemplate_name'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='sprintuserstory',
            name='sprint',
        ),
        migrations.RemoveField(
            model_name='sprintuserstory',
            name='user_story',
        ),
        migrations.RemoveField(
            model_name='sprint',
            name='user_stories',
        ),
        migrations.DeleteModel(
            name='BacklogTemplate',
        ),
        migrations.DeleteModel(
            name='SprintUserStory',
        ),
    ]
