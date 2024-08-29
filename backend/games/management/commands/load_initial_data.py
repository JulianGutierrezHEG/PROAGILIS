from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Charge les données initiales'

    def add_arguments(self, parser):
        parser.add_argument('fixture', type=str, help='Le nom du fichier fixture à charger')

    def handle(self, *args, **kwargs):
        fixture = kwargs['fixture']
        self.stdout.write(self.style.SUCCESS(f'Charge le fichier fixture {fixture}'))
        call_command('loaddata', fixture)
        self.stdout.write(self.style.SUCCESS('Les données ont été chargées avec succès'))
