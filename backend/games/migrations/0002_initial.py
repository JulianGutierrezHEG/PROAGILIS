# Generated by Django 5.0.7 on 2024-08-29 18:05

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('games', '0001_initial'),
        ('games_sessions', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='groupphasestatus',
            name='group',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='phase_statuses', to='games_sessions.group'),
        ),
        migrations.AddField(
            model_name='groupphasestatus',
            name='phase',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='group_statuses', to='games.gamephase'),
        ),
        migrations.AddField(
            model_name='project',
            name='current_client_comment',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='client_comments', to='games.event'),
        ),
        migrations.AddField(
            model_name='project',
            name='current_event',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='current_event_project', to='games.event'),
        ),
        migrations.AddField(
            model_name='project',
            name='group',
            field=models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='assigned_project', to='games_sessions.group'),
        ),
        migrations.AddField(
            model_name='event',
            name='project',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='games.project'),
        ),
        migrations.AddField(
            model_name='backlog',
            name='project',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to='games.project'),
        ),
        migrations.AddField(
            model_name='savedgamedata',
            name='group',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='saved_game_data', to='games_sessions.group'),
        ),
        migrations.AddField(
            model_name='sprint',
            name='backlog',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='games.backlog'),
        ),
        migrations.AddField(
            model_name='userstory',
            name='backlog',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_stories', to='games.backlog'),
        ),
        migrations.AddField(
            model_name='userstory',
            name='sprint',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='stories', to='games.sprint'),
        ),
        migrations.AlterUniqueTogether(
            name='groupphasestatus',
            unique_together={('group', 'phase')},
        ),
    ]
