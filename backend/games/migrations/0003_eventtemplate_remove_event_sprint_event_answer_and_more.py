# Generated by Django 5.0.7 on 2024-07-25 07:53

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0002_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='EventTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.TextField()),
                ('effect', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.RemoveField(
            model_name='event',
            name='sprint',
        ),
        migrations.AddField(
            model_name='event',
            name='answer',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='event',
            name='project',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, to='games.project'),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name='event',
            name='effect',
            field=models.TextField(blank=True, null=True),
        ),
    ]
