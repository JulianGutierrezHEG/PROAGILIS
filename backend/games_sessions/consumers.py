import json
from channels.generic.websocket import AsyncWebsocketConsumer

class GroupConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = f"group_{self.scope['url_route']['kwargs']['group_id']}"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        event = text_data_json.get('event')
        user = text_data_json.get('user')
        group_id = text_data_json.get('group_id')
        username = text_data_json.get('username')  

        if event == 'user_joined_group':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'user_joined_group',
                    'user': user,
                    'group_id': group_id,
                    'username': username  
                }
            )
        elif event == 'user_left_group':
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'user_left_group',
                    'user': user,
                    'group_id': group_id,
                    'username': username  
                }
            )

    async def user_joined_group(self, event):
        await self.send(text_data=json.dumps({
            'event': 'user_joined_group',
            'group_id': event['group_id'],
            'user': event['user'],
            'username': event['username']  
        }))

    async def user_left_group(self, event):
        await self.send(text_data=json.dumps({
            'event': 'user_left_group',
            'group_id': event['group_id'],
            'user': event['user'],
            'username': event['username']  
        }))

class SessionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.session_group_name = f"session_{self.session_id}"

        await self.channel_layer.group_add(
            self.session_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.session_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        event = text_data_json.get('event')
        session_id = text_data_json.get('session_id')
        status = text_data_json.get('status')

        if event == 'session_status_update':
            await self.channel_layer.group_send(
                self.session_group_name,
                {
                    'type': 'session_status_update',
                    'session_id': session_id,
                    'status': status,
                }
            )
        elif event == 'session_deleted':
            await self.channel_layer.group_send(
                self.session_group_name,
                {
                    'type': 'session_deleted',
                    'session_id': session_id,
                }
            )

    async def session_status_update(self, event):
        await self.send(text_data=json.dumps({
            'event': 'session_status_update',
            'session_id': event['session_id'],
            'status': event['status'],
        }))

    async def session_deleted(self, event):
        await self.send(text_data=json.dumps({
            'event': 'session_deleted',
            'session_id': event['session_id']
        }))