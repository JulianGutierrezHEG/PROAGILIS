import { ref } from 'vue';
import { useRouter } from 'vue-router';
import sessionsService from '@/services/sessionsService';
import usersService from '@/services/usersService';
import websocketService from '@/services/websocketService';
import EventBus from '@/services/eventBus';

// COMPOSABLE POUR LES SESSIONS, UTILISEE DANS LES VUES

export function useSession() {
  const router = useRouter();
  const sessions = ref([]);
  const selectedSession = ref(null);
  const groups = ref([]);
  const selectedGroup = ref(null);
  const groupDetail = ref(null);
  const sessionPassword = ref('');
  const passwordError = ref(false);
  const groupSize = ref(0);
  const joinedSession = ref(null);
  const currentUser = ref(null);
  const sessionStatus = ref('not_started');

  // Récupère toutes les sessions
  const fetchAllSessions = async () => {
    try {
      const allSessions = await sessionsService.getAllSessions();
      sessions.value = allSessions;
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions:', error);
    }
  };

  // Récupère les sessions de l'utilisateur
  const fetchUserSessions = async () => {
    try {
      const user = await usersService.getCurrentUser();
      currentUser.value = user;
      const allSessions = await sessionsService.fetchSessions(user.id);
      sessions.value = allSessions.filter(session => session.status === 'not_started' || session.status === 'active');
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions de l\'utilisateur:', error);
    }
  };

  // Récupère les sessions créées par l'utilisateur
  const fetchCreatedSessions = async () => {
    try {
      const createdSessions = await sessionsService.fetchCreatedSessions();
      sessions.value = createdSessions;
    } catch (error) {
      console.error('Erreur lors de la récupération des sessions créées:', error);
    }
  };

  // Récupère les informations de session de l'utilisateur
  const fetchUserSessionInfo = async () => {
    try {
      const user = await usersService.getCurrentUser();
      currentUser.value = user;
      const info = await sessionsService.getUserSessionInfo(user.id);
      currentUser.value = { ...currentUser.value, ...info };
      if (info && info.groupname) {
        selectedGroup.value = groups.value.find(group => group.name === info.groupname);
      }
      if (info && info.session_id) {
        fetchSessionStatus(info.session_id);
        websocketService.connectSessionStatus(info.session_id); 
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des informations de session de l\'utilisateur:', error);
    }
  };

  // Récupère les groupes de la session 
  const fetchGroups = async () => {
    if (!selectedSession.value || !selectedSession.value.id) return; 
    try {
      const session = await sessionsService.getSessionDetails(selectedSession.value.id);
      groupSize.value = session.group_size;
      groups.value = session.groups.filter(group => group.users.length < session.group_size);
      session.groups.forEach(group => {
        websocketService.connectGroup(group.id);
      });
      websocketService.connectSessionStatus(selectedSession.value.id);
    } catch (error) {
      console.error('Erreur lors de la récupération des groupes de la session:', error);
    }
  };

  // Récupère les détails du groupe
  const fetchGroupDetail = async (groupId) => {
    try {
      const group = await sessionsService.fetchGroupDetail(groupId);
      groupDetail.value = group;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du groupe:', error);
    }
  };

  // Rejoint une session
  const joinSession = async (router) => {
    try {
      const user = await usersService.getCurrentUser();
      console.log('Utilisateur:', user);
      console.log('Session ID:', selectedSession.value.id);
      console.log('Groupe ID:', selectedGroup.value.id);
      const response = await sessionsService.joinSession(selectedSession.value.id, selectedGroup.value.id, sessionPassword.value);
      if (response.success) {
        const joinedSessionResponse = await sessionsService.getJoinedSession(user.id);
        if (joinedSessionResponse) {
          router.push(`/game/${joinedSessionResponse.id}`);
        } else {
          console.error('Erreur: Session introuvable');
        }
      } else {
        passwordError.value = true;
      }
    } catch (error) {
      console.error('Erreur: Impossible de rejoindre la session:', error);
      passwordError.value = true;
    }
  };

  // Récupère la session rejointe
  const fetchJoinedSession = async () => {
    try {
      const user = await usersService.getCurrentUser();
      currentUser.value = user;
      const session = await sessionsService.getJoinedSession(user.id);
      if (!session) {
        joinedSession.value = '';
        return;
      }
      joinedSession.value = session;
    } catch (error) {
      console.error('Erreur lors de la récupération de la session rejointe:', error);
    }
  };

  // Récupère le statut de la session
  const fetchSessionStatus = async (sessionId) => {
    try {
      const session = await sessionsService.getSessionDetails(sessionId);
      sessionStatus.value = session.status;
      if (session.groups && session.groups.length > 0) {
        const group = session.groups.find(group => group.users.some(user => user.id === currentUser.value.id));
        if (group) {
          selectedGroup.value = group;
          websocketService.connectGroup(group.id);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du statut de la session:', error);
    }
  };

  // Quitte la session
  const leaveSession = async () => {
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
      console.error('Erreur: Impossible de quitter la session:', error);
    }
  };

  // Enlève un groupe de la session
  const ejectGroup = async () => {
    try {
      if (currentUser.value && currentUser.value.group_id) {
        const groupId = currentUser.value.group_id;
        websocketService.disconnectGroup(groupId);
        websocketService.sendMessage(groupId, {
          event: 'group_ejected_from_session',
          group_id: groupId
        });
  
        await ejectGroupFromSession(groupId);
        router.push('/');
      }
    } catch (error) {
      console.error('Erreur: Impossible d\'éjecter le groupe de la session:', error);
    }
  };

  // Gère le statut de la session
  const handleStatusSession = async (action) => {
    if (!selectedSession.value) return;
    try {
      const sessionId = selectedSession.value.id;
  
      if (!websocketService.isConnected(sessionId)) {
        websocketService.connectSessionStatus(sessionId);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
  
      if (action === 'start') {
        await sessionsService.startSession(sessionId);
        selectedSession.value.status = 'active';
        console.log(`Session ${sessionId} commencée`);
        selectedSession.value.groups.forEach(group => {
          websocketService.connectGroup(group.id);
        });
        websocketService.sendMessage(sessionId, { event: 'session_status_changed', status: 'active' });
        updateSessionStatus({ session_id: sessionId, status: 'active' });
      } else if (action === 'paused') {
        await sessionsService.stopSession(sessionId);
        selectedSession.value.status = 'paused';
        console.log(`Session ${sessionId} en pause`);
        selectedSession.value.groups.forEach(group => {
          websocketService.disconnectGroup(group.id);
        });
        websocketService.sendMessage(sessionId, { event: 'session_status_changed', status: 'paused' });
        updateSessionStatus({ session_id: sessionId, status: 'paused' });
      }
    } catch (error) {
      console.error(`Erreur lors de l'action ( ${action} ) de la session:`, error);
    }
  };

  // Met à jour le statut de la session
  const updateSessionStatus = (data) => {
    if (selectedSession.value && selectedSession.value.id === data.session_id) {
      sessionStatus.value = data.status;
    }
  };
    

  // Supprime la session
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
      console.error('Erreur lors de la suppression de la session:', error);
    }
  };


  // Met à jour les membres du groupe
  const updateGroupMembers = (data) => {
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


  // Supprime la session
  const handleSessionDeleted = (data) => {
    if (selectedSession.value && selectedSession.value.id === data.session_id) {
      selectedSession.value = null;
      sessions.value = sessions.value.filter(session => session.id !== data.session_id);
    }
    router.push('/');
  };


  // Met en place les écouteurs d'événements
  const setupEventListeners = () => {
    EventBus.on('user_joined_group', updateGroupMembers);
    EventBus.on('user_left_group', updateGroupMembers);
    EventBus.on('session_status_changed', updateSessionStatus);
    EventBus.on('session_deleted', handleSessionDeleted);
  };

  // Supprime les écouteurs d'événements
  const removeEventListeners = () => {
    EventBus.off('user_joined_group', updateGroupMembers);
    EventBus.off('user_left_group', updateGroupMembers);
    EventBus.off('session_status_changed', updateSessionStatus);
    EventBus.off('session_deleted', handleSessionDeleted);
  };

  return {
    sessions,
    selectedSession,
    groups,
    selectedGroup,
    sessionPassword,
    passwordError,
    groupSize,
    groupDetail,
    sessionStatus,
    currentUser,
    joinedSession,
    fetchUserSessions,
    fetchGroups,
    fetchGroupDetail,
    joinSession,
    setupEventListeners,
    removeEventListeners,
    fetchJoinedSession,
    handleStatusSession,
    handleDeleteSession,
    fetchSessionStatus,
    leaveSession,
    fetchUserSessionInfo,
    fetchCreatedSessions,
    fetchAllSessions,
    ejectGroup
  };
}
