import { ref } from 'vue';
import sessionsService from '@/services/sessionsService';
import usersService from '@/services/usersService';
import websocketService from '@/services/websocketService';
import EventBus from '@/services/eventBus';

export function useSession() {
  const sessions = ref([]);
  const selectedSession = ref(null);
  const groups = ref([]);
  const selectedGroup = ref(null);
  const sessionPassword = ref('');
  const passwordError = ref(false);
  const groupSize = ref(0);
  const joinedSession = ref(null);
  const currentUser = ref(null);
  const sessionStatus = ref('not_started');

  const fetchUserSessions = async () => {
    try {
      const user = await usersService.getCurrentUser();
      currentUser.value = user;
      const allSessions = await sessionsService.fetchSessions(user.id);
      sessions.value = allSessions.filter(session => session.status === 'not_started' || session.status === 'active');
    } catch (error) {
      console.error('Error fetching user sessions:', error);
    }
  };

  const fetchUserSessionInfo = async () => {
    try {
      const user = await usersService.getCurrentUser();
      console.log('Fetched user:', user);
      currentUser.value = user;
      const info = await sessionsService.getUserSessionInfo(user.id);
      console.log('Fetched user session info:', info);
      currentUser.value = { ...currentUser.value, ...info };
      if (info && info.session_id) {
        fetchSessionStatus(info.session_id);
        websocketService.connectSessionStatus(info.session_id); 
      }
    } catch (error) {
      console.error('Error fetching user session info:', error);
    }
  };

  const fetchGroups = async () => {
    if (!selectedSession.value || !selectedSession.value.id) return; 
    try {
      const session = await sessionsService.getSessionDetails(selectedSession.value.id);
      groupSize.value = session.group_size;
      groups.value = session.groups.filter(group => group.users.length < session.group_size);
      console.log('Filtered groups:', groups.value);
      
      session.groups.forEach(group => {
        websocketService.connectGroup(group.id);
      });
      websocketService.connectSessionStatus(selectedSession.value.id);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const joinSession = async (router) => {
    try {
      const user = await usersService.getCurrentUser();
      console.log('User:', user);
      console.log('Selected Session ID:', selectedSession.value.id);
      console.log('Selected Group ID:', selectedGroup.value.id);
      const response = await sessionsService.joinSession(selectedSession.value.id, selectedGroup.value.id, sessionPassword.value);
      console.log('Join session response:', response);
      if (response.success) {
        const joinedSessionResponse = await sessionsService.getJoinedSession(user.id);
        if (joinedSessionResponse) {
          router.push(`/game/${joinedSessionResponse.id}`);
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

  const fetchJoinedSession = async () => {
    try {
      const user = await usersService.getCurrentUser();
      currentUser.value = user;
      const session = await sessionsService.getJoinedSession(user.id);
      if (!session) {
        console.log('Pas de session rejointe');
        joinedSession.value = '';
        return;
      }
      joinedSession.value = session;
      console.log('Session rejointe:', session);
    } catch (error) {
      console.error('Erreur lors de la récupération de la session rejointe:', error);
    }
  };

  const fetchSessionStatus = async (sessionId) => {
    try {
      const session = await sessionsService.getSessionDetails(sessionId);
      sessionStatus.value = session.status;
      if (session.groups && session.groups.length > 0) {
        const group = session.groups.find(group => group.users.some(user => user.id === currentUser.value.id));
        if (group) {
          websocketService.connectGroup(group.id);
        }
      }
    } catch (error) {
      console.error('Error fetching session status:', error);
    }
  };

  const leaveSession = async (router) => {
    try {
      if (currentUser.value && currentUser.value.session_id) {
        const group = currentUser.value.group_id ? currentUser.value.group_id : currentUser.value.groupname;
        websocketService.disconnectGroup(group);
        websocketService.sendMessage(group, {
          event: 'user_left_group',
          user: currentUser.value.id,
          group_id: group
        });

        await sessionsService.leaveSession(currentUser.value.session_id, currentUser.value.id);
        router.push('/');
      }
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  const handleStatusSession = async (action) => {
    if (!selectedSession.value) return;
    try {
      const sessionId = selectedSession.value.id;
  
      // Ensure the WebSocket is connected before sending a message
      if (!websocketService.isConnected(sessionId)) {
        websocketService.connectSessionStatus(sessionId);
        // Optionally, wait for a short duration to ensure the connection is established
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
  
      if (action === 'start') {
        await sessionsService.startSession(sessionId);
        selectedSession.value.status = 'active';
        console.log(`Session ${sessionId} started`);
        selectedSession.value.groups.forEach(group => {
          websocketService.connectGroup(group.id);
        });
        websocketService.sendMessage(sessionId, { event: 'session_status_changed', status: 'active' });
        updateSessionStatus({ session_id: sessionId, status: 'active' });
      } else if (action === 'paused') {
        await sessionsService.stopSession(sessionId);
        selectedSession.value.status = 'paused';
        console.log(`Session ${sessionId} paused`);
        selectedSession.value.groups.forEach(group => {
          websocketService.disconnectGroup(group.id);
        });
        websocketService.sendMessage(sessionId, { event: 'session_status_changed', status: 'paused' });
        updateSessionStatus({ session_id: sessionId, status: 'paused' });
      }
    } catch (error) {
      console.error(`Error ${action}ing session:`, error);
    }
  };

  const updateSessionStatus = (data) => {
    console.log('Update session status event received:', data);
    if (selectedSession.value && selectedSession.value.id === data.session_id) {
      sessionStatus.value = data.status;
      console.log('Session status updated to:', sessionStatus.value);
    }
  };
    

  const handleDeleteSession = async (sessionId) => {
    const confirmation = window.confirm('Êtes-vous sûr de vouloir supprimer la session?');
    if (!confirmation) return;

    try {
      await sessionsService.deleteSession(sessionId);
      sessions.value = sessions.value.filter(session => session.id !== sessionId);
      selectedSession.value = sessions.value.length > 0 ? sessions.value[0] : null;
      selectedGroup.value = null;
      if (selectedSession.value) {
        await fetchGroups();
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const updateGroupMembers = (data) => {
    console.log('Update group members event received:', data);
    if (!selectedSession.value || !selectedSession.value.groups) return;
  
    const groupIndex = selectedSession.value.groups.findIndex(g => g.id === data.group_id);
    if (groupIndex !== -1) {
      const group = selectedSession.value.groups[groupIndex];
      const userIndex = group.users.findIndex(user => user.id === data.user);
  
      if (data.event === 'user_joined_group') {
        if (userIndex === -1) {
          group.users.push({ id: data.user, username: data.username });
        } else {
          group.users[userIndex] = { ...group.users[userIndex], ...data };
        }
      } else if (data.event === 'user_left_group' && userIndex !== -1) {
        group.users.splice(userIndex, 1);
      }
      selectedSession.value.groups = [...selectedSession.value.groups];
    }
  };


  const handleSessionDeleted = (data) => {
    console.log('Session deleted event received:', data);
    if (selectedSession.value && selectedSession.value.id === data.session_id) {
      selectedSession.value = null;
      sessions.value = sessions.value.filter(session => session.id !== data.session_id);
    }
  };


  const setupEventListeners = () => {
    EventBus.on('user_joined_group', updateGroupMembers);
    EventBus.on('user_left_group', updateGroupMembers);
    EventBus.on('session_status_changed', updateSessionStatus);
    EventBus.on('session_deleted', handleSessionDeleted);
  };

  const removeEventListeners = () => {
    EventBus.off('user_joined_group', updateGroupMembers);
    EventBus.off('user_left_group', updateGroupMembers);
    EventBus.off('session_status_changed', updateSessionStatus);
    EventBus.off('session_deleted', handleSessionDeleted);
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
    fetchUserSessions,
    fetchGroups,
    joinSession,
    setupEventListeners,
    removeEventListeners,
    joinedSession,
    fetchJoinedSession,
    currentUser,
    handleStatusSession,
    handleDeleteSession,
    sessionStatus,
    fetchSessionStatus,
    leaveSession,
    fetchUserSessionInfo
  };
}
