import { ref, onMounted, onUnmounted } from 'vue';
import websocketService from '@/services/websocketService';
import gamesService from '@/services/gamesService';
import usersService from '@/services/usersService';
import EventBus from '@/services/eventBus';

export function useGame(groupId) {
  const groupMembers = ref([]);
  const lockedElements = ref({});
  const currentUser = ref(null);
  const currentPhase = ref(null);
  const currentPhaseDetails = ref(null);
  const currentPhaseAnswer = ref(null);
  const isLoadingPhaseDetails = ref(true);
  const waiting = ref(false);

  const fetchGroupMembers = async () => {
    try {
      const members = await gamesService.getGroupMembers();
      groupMembers.value = members;
    } catch (error) {
      console.error('Error fetching group members:', error);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const user = await usersService.getCurrentUser();
      currentUser.value = user.username;
      console.log('Current user:', currentUser.value);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchCurrentPhase = async () => {
    try {
      isLoadingPhaseDetails.value = true; 
      const phaseStatus = await gamesService.getGroupCurrentPhase(groupId);
      currentPhase.value = phaseStatus;
      if (phaseStatus.status === 'pending') { 
        waiting.value = true;
      } else {
        waiting.value = false;
      }
      if (phaseStatus.phase) {
        const phaseDetails = await gamesService.getPhaseDetails(phaseStatus.phase);
        currentPhaseDetails.value = phaseDetails;
      }
      console.log('Current phase:', currentPhase.value);
      console.log('Current phase details:', currentPhaseDetails.value);
    } catch (error) {
      console.error('Error fetching current phase:', error);
    } finally {
      isLoadingPhaseDetails.value = false; 
    }
  };

  const setupWebSocket = () => {
    websocketService.connectGroup(groupId);

    EventBus.on('lock_element', handleLockElement);
    EventBus.on('unlock_element', handleUnlockElement);
  };

  const cleanupWebSocket = () => {
    websocketService.disconnectGroup(groupId);

    EventBus.off('lock_element', handleLockElement);
    EventBus.off('unlock_element', handleUnlockElement);
  };

  const handleLockElement = (data) => {
    console.log(`Element locked by: ${data.user}`);
    lockedElements.value = { ...lockedElements.value, [data.element_id]: data.user };
  };

  const handleUnlockElement = (data) => {
    console.log(`Element unlocked by: ${data.user}`);
    const updatedLockedElements = { ...lockedElements.value };
    delete updatedLockedElements[data.element_id];
    lockedElements.value = updatedLockedElements;
  };

  const lockElement = (elementId) => {
    if (currentUser.value) {
      websocketService.lockElement(groupId, elementId, currentUser.value);
    } else {
      console.error('Current user is not set.');
    }
  };

  const unlockElement = (elementId) => {
    if (currentUser.value) {
      websocketService.unlockElement(groupId, elementId, currentUser.value);
    } else {
      console.error('Current user is not set.');
    }
  };

  const submitGroupAnswer = async (answerData) => {
    try {
      await gamesService.submitAnswer(groupId, answerData, currentUser.value);
    } catch (error) {
      console.error('Error submitting group answer:', error);
    }
  };

  const fetchGroupCurrentPhaseAnswer = async (groupId) => {
    try {
      const response = await gamesService.getGroupCurrentPhaseAnswer(groupId);
      return response;
    } catch (error) {
      console.error('Error fetching group current phase answer:', error);
      return null;
    }
  };

  const showWaitingScreen = () => {
    if (currentUser.value) {
      websocketService.showWaitingScreen(groupId, currentUser.value);
    } else {
      console.error('Current user is not set.');
    }
  };

  onMounted(() => {
    fetchCurrentUser();
    fetchCurrentPhase();
  });

  return {
    groupMembers,
    lockedElements,
    currentUser,
    currentPhase,
    currentPhaseDetails,
    currentPhaseAnswer,
    isLoadingPhaseDetails,
    waiting,
    fetchGroupMembers,
    setupWebSocket,
    cleanupWebSocket,
    lockElement,
    unlockElement,
    showWaitingScreen,
    fetchCurrentPhase,
    submitGroupAnswer,
    fetchGroupCurrentPhaseAnswer,
  };
}
