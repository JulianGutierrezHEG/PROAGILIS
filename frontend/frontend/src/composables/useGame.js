import { ref, onMounted, onUnmounted } from 'vue';
import websocketService from '@/services/websocketService';
import gamesService from '@/services/gamesService';
import usersService from '@/services/usersService';
import EventBus from '@/services/eventBus';

export function useGame(groupId) {
  const groupMembers = ref([]);
  const lockedElements = ref({});
  const currentUser = ref(null);

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

  onMounted(() => {
    fetchCurrentUser();
  });

  return {
    groupMembers,
    lockedElements,
    currentUser,
    fetchGroupMembers,
    setupWebSocket,
    cleanupWebSocket,
    lockElement,
    unlockElement,
  };
}
