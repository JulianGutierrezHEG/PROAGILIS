"""
Ce module contient la classe BaseConsumer qui est une classe abstraite qui définit les méthodes de base pour les consumers de channels.
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer

class BaseConsumer(AsyncWebsocketConsumer):

    # Établit la connexion WebSocket et l'ajoute à un groupe spécifique.
    async def connect(self):
        group_name = self.get_group_name()
        if group_name:
            await self.channel_layer.group_add(group_name, self.channel_name)
            await self.accept()

    # Déconnecte la connexion WebSocket et la retire du groupe spécifique.
    async def disconnect(self, close_code):
        group_name = self.get_group_name()
        if group_name:
            await self.channel_layer.group_discard(group_name, self.channel_name)

    # Envoie un message au client WebSocket.
    async def send_message(self, event, data):
        await self.send(text_data=json.dumps({
            'event': event,
            **data
        }))

    # Reçoit un message du client WebSocket.
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        event = text_data_json.get('event')
        await self.route_event(event, text_data_json)

    # Route les événements reçus du client WebSocket vers les méthodes appropriées.
    async def route_event(self, event, data):
        handler = getattr(self, event, self.unhandled_event)
        await handler(data)

    # Gère les événements non gérés ou inconnus.
    async def unhandled_event(self, data):
        print(f"Evement non géré: {data}")
    
    # Récupère le nom du groupe pour le consumer.
    def get_group_name(self):
        raise NotImplementedError("Les classes dérivées doivent implémenter cette méthode")

