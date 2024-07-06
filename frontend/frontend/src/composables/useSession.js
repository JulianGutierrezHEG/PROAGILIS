import { ref } from 'vue';
import sessionsService from '@/services/sessionsService';
import usersService from '@/services/usersService';
import websocketService from '@/services/websocketService';
import EventBus from '@/services/eventBus';

export function useSession() {
  const sessions = ref([]);
  const selectedSession = ref('');
  const groups = ref([]);
  const selectedGroup = ref('');
  const sessionPassword = ref('');
  const passwordError = ref(false);
  const groupSize = ref(0);

  const fetchSessionsAndGroups = async () => {
    try {
      const user = await usersService.getCurrentUser();
      const allSessions = await sessionsService.fetchSessions(user.id);
      sessions.value = allSessions.filter(session => session.status === 'not_started' || session.status === 'active');
      if (selectedSession.value) {
        await fetchGroups();
      }
    } catch (error) {
      console.error('Error fetching sessions and groups:', error);
    }
  };

  const fetchGroups = async () => {
    if (!selectedSession.value) return;
    try {
      const session = await sessionsService.getSessionDetails(selectedSession.value);
      groupSize.value = session.group_size;
      groups.value = session.groups.filter(group => group.users.length < session.group_size);
      console.log('Filtered groups:', groups.value);
      
      session.groups.forEach(group => {
        websocketService.connectGroup(group.id);
      });
      websocketService.connectSessionStatus(selectedSession.value);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const joinSession = async (router) => {
    try {
      const user = await usersService.getCurrentUser();
      const response = await sessionsService.joinSession(selectedSession.value, selectedGroup.value, sessionPassword.value);
      console.log('Join session response:', response);
      if (response.success) {
        const joinedSession = await sessionsService.getJoinedSession(user.id);
        if (joinedSession) {
          router.push(`/game/${joinedSession.id}`);
        } else {
          console.error('Error: Joined session not found');
        }
      } else {
        passwordError.value = true;
      }
    } catch (error) {
      console.error('Error joining session:', error);
      passwordError.value = true;
    }
  };

  const updateGroupMembers = (data) => {
    console.log('Update group members event received:', data);
    const groupIndex = groups.value.findIndex(g => g.id === data.group_id);
    if (groupIndex !== -1) {
      const group = { ...groups.value[groupIndex] };
      const userIndex = group.users.findIndex(user => user.username === data.username);

      if (userIndex !== -1) {
        group.users[userIndex] = { ...group.users[userIndex], ...data };
      } else {
        group.users.push({ username: data.username, ...data });
      }
      groups.value[groupIndex] = group;
    }
  };

  const setupEventListeners = () => {
    EventBus.on('user_joined_group', updateGroupMembers);
    EventBus.on('user_left_group', updateGroupMembers);
  };

  const removeEventListeners = () => {
    EventBus.off('user_joined_group', updateGroupMembers);
    EventBus.off('user_left_group', updateGroupMembers);
    websocketService.disconnectAll();
  };

  return {
    sessions,
    selectedSession,
    groups,
    selectedGroup,
    sessionPassword,
    passwordError,
    groupSize,
    fetchSessionsAndGroups,
    fetchGroups,
    joinSession,
    setupEventListeners,
    removeEventListeners,
  };
}
