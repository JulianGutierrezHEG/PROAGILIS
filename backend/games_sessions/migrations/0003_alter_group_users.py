# Generated by Django 5.0.6 on 2024-07-01 13:41

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games_sessions', '0002_alter_session_groups'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AlterField(
            model_name='group',
            name='users',
            field=models.ManyToManyField(blank=True, related_name='games_sessions', to=settings.AUTH_USER_MODEL),
        ),
    ]