from backend.base_consumers import BaseConsumer
from channels.db import database_sync_to_async
from games_sessions.models import Group

# Consumer pour les groupes
# Evenements :
# - user_joined_group : envoi de la notification d'ajout d'un utilisateur à un groupe
# - user_left_group : envoi de la notification de départ d'un utilisateur d'un groupe
# - lock_element : envoi de la notification de verrouillage d'un élément de l'inteface
# - unlock_element : envoi de la notification de déverrouillage d'un élément de l'inteface
# - show_waiting_screen : envoi de la notification d'affichage de l'écran d'attente au groupe
# - phase_status_update : envoi de la notification de mise à jour de l'état de la phase
# - phase_answer_update : envoi de la notification de mise à jour de la réponse de la phase
# - project_update : envoi de la notification de mise à jour du projet
# - send_group_members_update : envoi de la notification de mise à jour des membres du groupe
class GroupConsumer(BaseConsumer):
    def get_group_name(self):
        return f"group_{self.scope['url_route']['kwargs']['group_id']}"

    async def connect(self):
        await super().connect()
        await self.send_group_members_update()

    async def user_joined_group(self, event):
        await self.send_message('user_joined_group', event)

    async def user_left_group(self, event):
        await self.send_message('user_left_group', event)

    async def lock_element(self, event):
        try:
            await self.channel_layer.group_send(
                self.get_group_name(),
                {
                    'type': 'lock_element_broadcast',
                    'event': 'lock_element',
                    'element_id': event['element_id'],
                    'user': event['user']
                }
            )
        except Exception as e:
            print(f"Erreur dans lock_element: {e}")

    async def unlock_element(self, event):
        try:
            await self.channel_layer.group_send(
                self.get_group_name(),
                {
                    'type': 'unlock_element_broadcast',
                    'event': 'unlock_element',
                    'element_id': event['element_id'],
                    'user': event['user']
                }
            )
        except Exception as e:
            print(f"Erreur dans lock_element: {e}")
    
    async def show_waiting_screen(self, event):
        await self.channel_layer.group_send(
            self.get_group_name(),
            {
                'type': 'show_waiting_screen_broadcast',
                'user': event['user'],
            }
        )
    
    async def phase_status_update(self, event):
        await self.channel_layer.group_send(
            self.get_group_name(),
            {
                'type': 'phase_status_update_broadcast',
                'event': 'phase_status_update',
                'group_id': event['group_id'],
                'phase_id': event['phase_id'],
                'status': event['status']
            }
        )

    async def phase_status_update_broadcast(self, event):
        await self.send_message('phase_status_update', {
            'group_id': event['group_id'],
            'phase_id': event['phase_id'],
            'status': event['status']
        })
    
    async def phase_answer_update(self, event):
        await self.channel_layer.group_send(
        self.get_group_name(),
        {
            'type': 'phase_answer_update_broadcast',
            'event': 'phase_answer_update',
            'group_id': event['group_id'],
            'phase_id': event['phase_id'],
            'answer': event['answer']
        }
    )

    async def phase_answer_update_broadcast(self, event):
        await self.send_message('phase_answer_update', {
        'group_id': event['group_id'],
        'phase_id': event['phase_id'],
        'answer': event['answer']
    })

    async def show_waiting_screen_broadcast(self, event):
        await self.send_message('show_waiting_screen', {'user': event['user']})

    async def lock_element_broadcast(self, event):
        await self.send_message('lock_element', {'element_id': event['element_id'], 'user': event['user']})

    async def unlock_element_broadcast(self, event):
        await self.send_message('unlock_element', {'element_id': event['element_id'], 'user': event['user']})
    
    async def project_update_broadcast(self, event):
        await self.send_message('project_update', event)
    
    async def smart_update_broadcast(self, event):
        await self.send_message('smart_update', event)
    
    async def user_story_update_created_broadcast(self, event):
        await self.send_message('user_story_created_update', event)
    
    async def user_story_created_update(self, event):
        await self.channel_layer.group_send(
        self.get_group_name(),
        {
            'type': 'user_story_created_update',
            'userStories': event['userStories'],
            'user': event['user'],
        }
    )
    
    async def project_update(self, event):
        await self.channel_layer.group_send(
            self.get_group_name(),
            {
                'type': 'project_update_broadcast',
                'projectName': event['projectName'],
                'roles': event['roles'],
                'user': event['user'],
            }
        )
    
    async def smart_update(self, event):
        await self.channel_layer.group_send(
            self.get_group_name(),
            {
                'type': 'smart_update_broadcast',
                'event': 'smart_update',
                'group_id': event['group_id'],
                'phase_id': event['phase_id'],
                'smart_details': event['smart_details'],
                'user': event['user']
            }
        )

    async def send_group_members_update(self):
        group_id = self.scope['url_route']['kwargs']['group_id']
        group = await database_sync_to_async(Group.objects.get)(id=group_id)
        users = await database_sync_to_async(list)(group.users.values('id', 'username'))
        await self.send_message('group_members_update', {'members': users})


# Consumer pour les sessions
# Evenements : 
# - session_status_update : envoi de l'état de la session
# - session_deleted : envoi de la suppression de la session
class SessionConsumer(BaseConsumer):
    def get_group_name(self):
        return f"session_{self.scope['url_route']['kwargs']['session_id']}"

    async def session_status_update(self, event):
        await self.send_message('session_status_update', event)

    async def session_deleted(self, event):
        await self.send_message('session_deleted', event)
    