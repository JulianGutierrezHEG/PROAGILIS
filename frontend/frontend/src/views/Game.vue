<template>
  <div class="w-4/5 max-h-screen overflow-hidden bg-gray-200 shadow-lg rounded-lg p-2 mx-auto my-8">
    <div class="flex justify-between items-center">
      <div>
        <p v-if="currentUser">
          {{ currentUser.username }} ({{ currentUser.groupname }})
        </p>
      </div>
      <div>
        <p>
          Status: 
          <span v-if="sessionStatus === 'not_started'">En attente du début du jeu par l'enseignant(e)</span>
          <span v-if="sessionStatus === 'active'">La session est en cours</span>
          <span v-if="sessionStatus === 'paused'">La session est en pause</span>
        </p>
      </div>
      <div>
        <button @click="leaveSession" class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
          Quitter la session
        </button>
      </div>
    </div>
    <hr class="my-4 border-black" />
    <div>
      <TestPhase v-if="sessionStatus === 'active'" />
      <WaitingScreen v-else />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useSession } from '@/composables/useSession';
import websocketService from '@/services/websocketService';
import TestPhase from '@/views/TestPhase.vue';
import WaitingScreen from '@/views/WaitingScreen.vue';

const { currentUser,sessionStatus, leaveSession,fetchUserSessionInfo, fetchSessionStatus, setupEventListeners, removeEventListeners } = useSession();
const sessionId = ref(null);

const handleWebSocketMessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.event === 'session_status_update' && message.session_id === sessionId.value) {
    fetchSessionStatus(sessionId.value).then(() => {
      console.log('Session status updated via WebSocket:', message.status);
    });
  }
};

onMounted(async () => {
  console.log('onMounted: Setting up event listeners and fetching user session info.');
  await fetchUserSessionInfo();
  setupEventListeners();

  if (currentUser.value && currentUser.value.session_id) {
    sessionId.value = currentUser.value.session_id;
    await fetchSessionStatus(sessionId.value);
    websocketService.onMessage(sessionId.value, handleWebSocketMessage);
  }
});

onUnmounted(() => {
  console.log('onUnmounted: Removing event listeners.');
  removeEventListeners();

  if (sessionId.value) {
    websocketService.offMessage(sessionId.value, handleWebSocketMessage);
    websocketService.disconnectSession(sessionId.value);
  }

  if (currentUser.value && currentUser.value.group_id) {
    websocketService.disconnectGroup(currentUser.value.group_id);
  } else if (currentUser.value && currentUser.value.groupname) {
    websocketService.disconnectGroup(currentUser.value.groupname);
  }
});
</script>
