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
import { onMounted, onUnmounted } from 'vue';
import { useSession } from '@/composables/useSession';
import TestPhase from '@/views/TestPhase.vue';
import WaitingScreen from '@/views/WaitingScreen.vue';

const { currentUser, sessionStatus, fetchUserSessionInfo, leaveSession, setupEventListeners, removeEventListeners } = useSession();

onMounted(() => {
  fetchUserSessionInfo();
  setupEventListeners();
});

onUnmounted(() => {
  removeEventListeners();
  if (currentUser.value && currentUser.value.group_id) {
    websocketService.disconnectGroup(currentUser.value.group_id);
  } else if (currentUser.value && currentUser.value.groupname) {
    websocketService.disconnectGroup(currentUser.value.groupname);
  }
});
</script>
