# Generated by Django 5.0.6 on 2024-07-12 11:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('games', '0007_alter_groupphasestatus_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='groupphasestatus',
            name='status',
            field=models.CharField(choices=[('not_started', 'Non commencé'), ('in_progress', 'En cours'), ('pending', 'En attente de validation'), ('completed', 'Complété'), ('wrong', 'Fausse réponse')], default='not_started', max_length=20),
        ),
    ]
