# Generated by Django 5.0.7 on 2024-07-26 17:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0005_remove_savedgamedata_timestamp_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='savedgamedata',
            name='completed_user_story_ids',
        ),
        migrations.AddField(
            model_name='savedgamedata',
            name='completed_user_story_names',
            field=models.JSONField(default=1),
            preserve_default=False,
        ),
    ]
