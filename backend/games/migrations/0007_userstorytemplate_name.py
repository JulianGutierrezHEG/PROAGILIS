# Generated by Django 5.0.6 on 2024-07-19 15:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0006_userstory_has_been_created'),
    ]

    operations = [
        migrations.AddField(
            model_name='userstorytemplate',
            name='name',
            field=models.CharField(default=1, max_length=200),
            preserve_default=False,
        ),
    ]
