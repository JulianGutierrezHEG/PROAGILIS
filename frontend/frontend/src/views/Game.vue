<template>
  <div class="w-4/5 max-h-screen overflow-hidden bg-gray-200 shadow-lg rounded-lg p-2 mx-auto my-8 flex flex-col justify-between">
    <div>
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
      <div class="phase-container flex-grow">
        <component :is="currentPhaseComponent" v-if="sessionStatus === 'active'" />
        <WaitingScreen v-else />
      </div>
    </div>
    <hr class="my-4 border-black" />
    <div class="flex justify-center space-x-4">
      <button @click="previousPhase" class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600" :disabled="currentPhaseIndex === 0">
        Revenir en arrière
      </button>
      <button @click="nextPhase" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
        Continuer
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useSession } from '@/composables/useSession';
import websocketService from '@/services/websocketService';
import WaitingScreen from '@/views/WaitingScreen.vue';
import PhaseOne from '@/components/phases/PhaseOne.vue';
import PhaseTwo from '@/components/phases/PhaseTwo.vue';
import PhaseThree from '@/components/phases/PhaseThree.vue';
import PhaseFour from '@/components/phases/PhaseFour.vue';
import PhaseFive from '@/components/phases/PhaseFive.vue';
import PhaseSix from '@/components/phases/PhaseSix.vue';
import PhaseSeven from '@/components/phases/PhaseSeven.vue';
import PhaseEight from '@/components/phases/PhaseEight.vue';

const { currentUser, sessionStatus, leaveSession, fetchUserSessionInfo, fetchSessionStatus, setupEventListeners, removeEventListeners } = useSession();
const sessionId = ref(null);
const currentPhaseIndex = ref(0);

const phases = [
  PhaseOne,
  PhaseTwo,
  PhaseThree,
  PhaseFour,
  PhaseFive,
  PhaseSix,
  PhaseSeven,
  PhaseEight
];

const currentPhaseComponent = computed(() => phases[currentPhaseIndex.value]);

const handleWebSocketMessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.event === 'session_status_update' && message.session_id === sessionId.value) {
    fetchSessionStatus(sessionId.value).then(() => {
      console.log('Session status updated via WebSocket:', message.status);
    });
  }
};

const nextPhase = () => {
  if (currentPhaseIndex.value < phases.length - 1) {
    currentPhaseIndex.value++;
  } else {
    currentPhaseIndex.value = 4; // Loop back to PhaseFive after PhaseEight
  }
  console.log("Next Phase button clicked");
};

const previousPhase = () => {
  if (currentPhaseIndex.value > 0) {
    currentPhaseIndex.value--;
  }
  console.log("Previous Phase button clicked");
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

