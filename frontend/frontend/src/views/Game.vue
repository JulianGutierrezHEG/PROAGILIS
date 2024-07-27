<template>
  <div class="w-4/5 h-96 bg-gray-200 shadow-lg rounded-lg p-2 mx-auto my-8 flex flex-col">
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
    </div>
    <div class="phase-container flex-grow overflow-y-auto">
      <component v-if="sessionStatus === 'active'" :is="currentPhaseComponent" :group="selectedGroup" />
      <WaitingScreen v-else-if="sessionStatus === 'not_started' || sessionStatus === 'paused' " />
    </div>
    <hr class="my-4 border-black" />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue';
import { useSession } from '@/composables/useSession';
import websocketService from '@/services/websocketService';
import gamesService from '@/services/gamesService';
import EventBus from '@/services/eventBus';
import WaitingScreen from '@/views/WaitingScreen.vue';
import PhaseOne from '@/components/phases/PhaseOne.vue';
import PhaseTwo from '@/components/phases/PhaseTwo.vue';
import PhaseThree from '@/components/phases/PhaseThree.vue';
import PhaseFour from '@/components/phases/PhaseFour.vue';
import PhaseFive from '@/components/phases/PhaseFive.vue';
import PhaseSix from '@/components/phases/PhaseSix.vue';
import PhaseSeven from '@/components/phases/PhaseSeven.vue';
import PhaseEight from '@/components/phases/PhaseEight.vue';

const { currentUser, sessionStatus, leaveSession, fetchUserSessionInfo, fetchSessionStatus, setupEventListeners, removeEventListeners, selectedGroup, fetchGroupDetail } = useSession();
const sessionId = ref(null);
const currentPhaseIndex = ref(0);
const group = ref(null);

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

const handlePhaseStatusUpdate = async (data) => {
  if (group.value && group.value.id === data.group_id) {
    await fetchCurrentPhase();
  }
};

const handleWebSocketMessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.event === 'session_status_update' && message.session_id === sessionId.value) {
    fetchSessionStatus(sessionId.value).then(() => {
      console.log('WebSocket mis à jour du statut de la session:', message.status);
    });
  }
};

const fetchCurrentPhase = async () => {
  try {
    const phaseStatus = await gamesService.getGroupCurrentPhase(group.value.id);
    currentPhaseIndex.value = phaseStatus.phase -1;
    console.log('LA PHASE ACTUELLE EST LA PHASE: ', phaseStatus.phase);
  } catch (error) {
    console.error('Erreur lors de la récupération de la phase actuelle:', error);
  }
};

onMounted(async () => {
  await fetchUserSessionInfo();
  setupEventListeners();

  if (currentUser.value && currentUser.value.session_id) {
    sessionId.value = currentUser.value.session_id;
    await fetchSessionStatus(sessionId.value);
    websocketService.onMessage(sessionId.value, handleWebSocketMessage);
  }
  EventBus.on('phase_status_update', handlePhaseStatusUpdate);
  watch(() => selectedGroup.value, async (newGroup) => {
    if (newGroup && newGroup.id) {
      await fetchGroupDetail(newGroup.id);
      group.value = newGroup;
      await fetchCurrentPhase();
    }
  }, { immediate: true });
});

onUnmounted(() => {
  removeEventListeners();
  EventBus.off('phase_status_update', handlePhaseStatusUpdate);
});
</script>
