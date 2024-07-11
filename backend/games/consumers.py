# In your games/consumers.py
from backend.base_consumers import BaseConsumer

class LockConsumer(BaseConsumer):
    def get_group_name(self):
        return f"lock_{self.scope['url_route']['kwargs']['group_id']}"

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        event = text_data_json.get('event')
        element_id = text_data_json.get('element_id')
        user_id = self.scope['user'].id

        if event == 'lock':
            await self.channel_layer.group_send(
                self.get_group_name(),
                {
                    'type': 'lock_element',
                    'element_id': element_id,
                    'user_id': user_id
                }
            )
        elif event == 'unlock':
            await self.channel_layer.group_send(
                self.get_group_name(),
                {
                    'type': 'unlock_element',
                    'element_id': element_id,
                    'user_id': user_id
                }
            )

    async def lock_element(self, event):
        await self.send_message('lock_element', {
            'element_id': event['element_id'],
            'user_id': event['user_id']
        })

    async def unlock_element(self, event):
        await self.send_message('unlock_element', {
            'element_id': event['element_id'],
            'user_id': event['user_id']
        })


class PhaseConsumer(BaseConsumer):
    def get_group_name(self):
        return f"phase_{self.scope['url_route']['kwargs']['group_id']}"

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        event = text_data_json.get('event')
        user_id = self.scope['user'].id

        if event == 'show_waiting_screen':
            await self.channel_layer.group_send(
                self.get_group_name(),
                {
                    'type': 'show_waiting_screen',
                    'user_id': user_id,
                }
            )

    async def show_waiting_screen(self, event):
        await self.send_message('show_waiting_screen', {
            'user_id': event['user_id']
        })

