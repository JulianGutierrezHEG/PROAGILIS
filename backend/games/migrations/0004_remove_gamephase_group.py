# Generated by Django 5.0.6 on 2024-07-11 13:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0003_remove_gamephase_project_gamephase_group'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='gamephase',
            name='group',
        ),
    ]