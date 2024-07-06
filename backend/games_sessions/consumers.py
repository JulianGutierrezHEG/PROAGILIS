from backend.base_consumers import BaseConsumer


class GroupConsumer(BaseConsumer):
    def get_group_name(self):
        return f"group_{self.scope['url_route']['kwargs']['group_id']}"

    async def user_joined_group(self, event):
        await self.send_message('user_joined_group', event)

    async def user_left_group(self, event):
        await self.send_message('user_left_group', event)

class SessionConsumer(BaseConsumer):
    def get_group_name(self):
        return f"session_{self.scope['url_route']['kwargs']['session_id']}"

    async def session_status_update(self, event):
        await self.send_message('session_status_update', event)

    async def session_deleted(self, event):
        await self.send_message('session_deleted', event)