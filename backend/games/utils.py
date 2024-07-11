from .models import GroupPhaseStatus, GamePhase
from games_sessions.models import Group

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