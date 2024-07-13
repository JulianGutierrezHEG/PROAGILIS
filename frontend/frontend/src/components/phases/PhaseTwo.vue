<template>
  <div class="p-4 overflow-auto">
    <div v-if="waiting">
      <WaitingScreen />
    </div>
    <div v-else>
      <h2 v-if="!isLoadingPhaseDetails" class="text-3xl font-bold mb-6 text-center">{{ currentPhaseDetails.name }}</h2>
      <p v-if="!isLoadingPhaseDetails" class="mb-6 text-center">
        {{ currentPhaseDetails.description }}
      </p>
      <form @submit.prevent="submitForm" class="max-w-lg mx-auto">
        <div class="mb-6">
          <label for="specific" class="block text-gray-700 text-lg">Spécifique</label>
          <textarea id="specific" v-model="smartObjectives.specific" class="mt-1 block w-full p-2 border rounded-md" rows="3" 
                    :class="{ locked: lockedElements.specific && lockedElements.specific !== currentUser }"
                    @focus="lock('specific')" @blur="unlock('specific')" required></textarea>
        </div>
        <div class="mb-6">
          <label for="measurable" class="block text-gray-700 text-lg">Mesurable</label>
          <textarea id="measurable" v-model="smartObjectives.measurable" class="mt-1 block w-full p-2 border rounded-md" rows="3" 
                    :class="{ locked: lockedElements.measurable && lockedElements.measurable !== currentUser }"
                    @focus="lock('measurable')" @blur="unlock('measurable')" required></textarea>
        </div>
        <div class="mb-6">
          <label for="achievable" class="block text-gray-700 text-lg">Atteignable</label>
          <textarea id="achievable" v-model="smartObjectives.achievable" class="mt-1 block w-full p-2 border rounded-md" rows="3" 
                    :class="{ locked: lockedElements.achievable && lockedElements.achievable !== currentUser }"
                    @focus="lock('achievable')" @blur="unlock('achievable')" required></textarea>
        </div>
        <div class="mb-6">
          <label for="relevant" class="block text-gray-700 text-lg">Pertinent</label>
          <textarea id="relevant" v-model="smartObjectives.relevant" class="mt-1 block w-full p-2 border rounded-md" rows="3" 
                    :class="{ locked: lockedElements.relevant && lockedElements.relevant !== currentUser }"
                    @focus="lock('relevant')" @blur="unlock('relevant')" required></textarea>
        </div>
        <div class="mb-6">
          <label for="timeBound" class="block text-gray-700 text-lg">Délimité dans le temps</label>
          <textarea id="timeBound" v-model="smartObjectives.timeBound" class="mt-1 block w-full p-2 border rounded-md" rows="3" 
                    :class="{ locked: lockedElements.timeBound && lockedElements.timeBound !== currentUser }"
                    @focus="lock('timeBound')" @blur="unlock('timeBound')" required></textarea>
        </div>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Soumettre
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGame } from '@/composables/useGame';
import WaitingScreen from '@/views/WaitingScreen.vue';
import gamesService from '@/services/gamesService';
import websocketService from '@/services/websocketService';
import EventBus from '@/services/eventBus';

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
});

const { 
  groupMembers, 
  lockedElements, 
  currentUser, 
  currentPhaseDetails, 
  isLoadingPhaseDetails, 
  waiting,
  fetchGroupMembers, 
  setupWebSocket, 
  cleanupWebSocket, 
  lockElement, 
  unlockElement, 
  submitGroupAnswer,
  showWaitingScreen,
  fetchCurrentPhase
} = useGame(props.group.id,props.group);

const smartObjectives = ref({
  specific: '',
  measurable: '',
  achievable: '',
  relevant: '',
  timeBound: ''
});

const lock = (elementId) => {
  lockElement(elementId);
};

const unlock = (elementId) => {
  unlockElement(elementId);
};

const submitForm = async () => {
  showWaitingScreen(props.group.id, currentUser.value);

  const answerData = {
    specific: smartObjectives.value.specific,
    measurable: smartObjectives.value.measurable,
    achievable: smartObjectives.value.achievable,
    relevant: smartObjectives.value.relevant,
    timeBound: smartObjectives.value.timeBound
  };

  try {
    await submitGroupAnswer(answerData);

    if (currentPhaseDetails.value.requires_validation) {
      websocketService.sendPhaseStatusUpdate(props.group.id, currentPhaseDetails.value.id, 'pending');
      websocketService.sendPhaseAnswerUpdate(props.group.id, currentPhaseDetails.value.id, answerData);
    } else {
      const nextPhaseId = currentPhaseDetails.value.id + 1;
      await gamesService.updatePhaseStatus(props.group.id, currentPhaseDetails.value.id, 'completed');
      websocketService.sendPhaseStatusUpdate(props.group.id, currentPhaseDetails.value.id, 'completed');

      await gamesService.updatePhaseStatus(props.group.id, nextPhaseId, 'in_progress');
      websocketService.sendPhaseStatusUpdate(props.group.id, nextPhaseId, 'in_progress');

      websocketService.sendPhaseAnswerUpdate(props.group.id, currentPhaseDetails.value.id, answerData);
    }
  } catch (error) {
    console.error('Error submitting SMART objectives:', error);
  }

  EventBus.emit('updateSMARTObjectives', answerData);
};

onMounted(async () => {
  fetchGroupMembers();
  setupWebSocket();
  await fetchCurrentPhase();
  EventBus.on('show_waiting_screen', () => {
    waiting.value = true;
  });
});

onUnmounted(() => {
  cleanupWebSocket();
  EventBus.off('show_waiting_screen', () => {
    waiting.value = true;
  });
});
</script>

<style scoped>
.locked {
  background-color: rgba(211, 211, 211, 0.5); 
  border-color: #a9a9a9; 
  pointer-events: none; 
  opacity: 0.7; 
  position: relative;
}

.locked:after {
  content: "Bloqué"; 
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: red;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.7); 
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 10; 
}

button:hover {
  background-color: #3b82f6; 
}

button:active, button:focus {
  background-color: #2563eb; 
  transform: scale(1); 
  outline: none; 
}

button {
  width: 100%; 
  padding: 12px 24px; 
}
</style>