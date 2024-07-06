# Generated by Django 5.0.6 on 2024-07-01 14:03

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('games_sessions', '0003_alter_group_users'),
    ]

    operations = [
        migrations.CreateModel(
            name='Project',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('group', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='project', to='games_sessions.group')),
            ],
        ),
        migrations.CreateModel(
            name='GamePhase',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('answer', models.TextField(blank=True, null=True)),
                ('correct_answer', models.TextField()),
                ('status', models.CharField(choices=[('not_started', 'Non commencé'), ('in_progress', 'En cours'), ('pending', 'En attente de validation'), ('completed', 'Complété'), ('wrong', 'Fausse réponse'), ('correct_waiting', 'Juste, en attente'), ('wrong_waiting', 'Fausse, en attente'), ('finished', 'Terminé')], default='not_started', max_length=20)),
                ('project', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='phases', to='games.project')),
            ],
        ),
    ]