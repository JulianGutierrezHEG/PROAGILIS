from django.core.management.base import BaseCommand
from django.core.management import call_command

class Command(BaseCommand):
    help = 'Load initial data for the application'

    def add_arguments(self, parser):
        parser.add_argument('fixture', type=str, help='The name of the fixture to load')

    def handle(self, *args, **kwargs):
        fixture = kwargs['fixture']
        self.stdout.write(self.style.SUCCESS(f'Loading fixture {fixture}'))
        call_command('loaddata', fixture)
        self.stdout.write(self.style.SUCCESS('Successfully loaded fixture'))
