from .models import GroupPhaseStatus, GamePhase
from games_sessions.models import Group
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

def update_group_phase_status(group, phase, status, answer=None):
    group_phase_status, created = GroupPhaseStatus.objects.get_or_create(
        group=group,
        phase=phase,
        defaults={'status': status, 'answer': answer}
    )
    if not created:
        group_phase_status.status = status
        if answer:
            group_phase_status.answer = answer
        group_phase_status.save()
    
    # Send WebSocket message
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"phase_{group.id}",
        {
            'type': 'phase_status_update',
            'group_id': group.id,
            'phase_id': phase.id,
            'status': status,
        }
    )