# Generated by Django 5.0.6 on 2024-07-16 15:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0002_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='backlog',
            name='stories',
        ),
    ]