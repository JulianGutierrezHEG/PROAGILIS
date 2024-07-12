<template>
  <div>
    <div class="mt-8">
      <h3 class="font-bold text-xl text-center mb-4">Phase du groupe</h3>
      <ol class="items-center w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0 rtl:space-x-reverse">
        <li v-for="(phase, index) in phases" :key="phase.id" :class="getPhaseClass(phaseStatus[phase.id]?.status)">
          <span class="flex items-center justify-center w-8 h-8 border rounded-full shrink-0"
            :class="getPhaseBorderClass(phaseStatus[phase.id]?.status)">
            {{ index + 1 }}
          </span>
          <span>
            <h3 class="font-medium leading-tight">{{ phase.name }}</h3>
            <p class="text-sm">{{ getStatusText(phaseStatus[phase.id]?.status) }}</p>
          </span>
        </li>
      </ol>
    </div>
    <div v-if="phaseAnswer && phaseAnswer.projectName">
      <h3 class="font-bold text-xl text-center mb-4">Réponse pour la phase {{ currentPhaseName }} :</h3>
      <p class="text-center">Nom du projet: {{ phaseAnswer.projectName }}</p>
      <p class="text-center">Rôles:</p>
      <p class="text-center">Product Owner: {{ phaseAnswer.roles.productOwner }}</p>
      <p class="text-center">Scrum Master: {{ phaseAnswer.roles.scrumMaster }}</p>
      <p class="text-center">Développeurs: {{ phaseAnswer.roles.developers.join(', ') }}</p>
    </div>
    <div v-if="currentPhaseNeedsValidation">
      <button @click="handleValidation(true)"
        class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mt-4">
        Réponse correcte
      </button>
      <button @click="handleValidation(false)"
        class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 mt-4">
        Réponse incorrecte
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useGame } from '@/composables/useGame';
import gamesService from '@/services/gamesService';
import websocketService from '@/services/websocketService';
import EventBus from '@/services/eventBus';

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
});

const { fetchPhases, fetchGroupPhasesStatus, fetchGroupCurrentPhaseAnswer, validatePhase } = useGame(props.group.id);

const phases = ref([]);
const phaseStatus = ref({});
const currentPhaseName = ref(null);
const currentPhaseId = ref(null);
const currentPhaseNeedsValidation = ref(false);
const phaseAnswer = ref(null);
const statusChoices = ref({});

const getPhaseClass = (status) => {
  switch (status) {
    case 'completed':
      return 'flex items-center text-blue-600 dark:text-blue-500 space-x-2.5 rtl:space-x-reverse';
    case 'in_progress':
      return 'flex items-center text-green-600 dark:text-green-500 space-x-2.5 rtl:space-x-reverse';
    case 'pending':
      return 'flex items-center text-yellow-600 dark:text-yellow-500 space-x-2.5 rtl:space-x-reverse';
    case 'wrong':
      return 'flex items-center text-red-600 dark:text-red-500 space-x-2.5 rtl:space-x-reverse';
    default:
      return 'flex items-center text-gray-600 dark:text-gray-500 space-x-2.5 rtl:space-x-reverse';
  }
};

const getPhaseBorderClass = (status) => {
  switch (status) {
    case 'completed':
      return 'border-blue-600 dark:border-blue-500';
    case 'in_progress':
      return 'border-green-600 dark:border-green-500';
    case 'pending':
      return 'border-yellow-600 dark:border-yellow-500';
    case 'wrong':
      return 'border-red-600 dark:border-red-500';
    default:
      return 'border-gray-500 dark:border-gray-400';
  }
};

const getStatusText = (status) => {
  return statusChoices.value[status] || 'Non commencé';
};

const fetchPhaseData = async () => {
  console.log('Fetching phase data for group:', props.group.id);
  try {
    const fetchedPhases = await fetchPhases();
    phases.value = fetchedPhases;
    console.log('Fetched phases:', phases.value);

    const response = await fetchGroupPhasesStatus(props.group.id);
    console.log('Fetched statuses:', response.phase_statuses);
    phaseStatus.value = {};
    statusChoices.value = response.status_choices;
    response.phase_statuses.forEach(status => {
      phaseStatus.value[status.phase.id] = status;
    });
    console.log('Phase status after update:', phaseStatus.value);

    const answerData = await fetchGroupCurrentPhaseAnswer(props.group.id);
    if (answerData) {
      currentPhaseName.value = answerData.phase_name;
      currentPhaseId.value = answerData.phase_id;
      phaseAnswer.value = answerData.answer;
      currentPhaseNeedsValidation.value = answerData.requires_validation; 
    } else {
      currentPhaseName.value = null;
      currentPhaseId.value = null;
      phaseAnswer.value = null;
      currentPhaseNeedsValidation.value = false;
    }
    console.log('Current phase name:', currentPhaseName.value);
    console.log('Current phase id:', currentPhaseId.value);
    console.log('Phase answer:', phaseAnswer.value);
    console.log('Current phase needs validation:', currentPhaseNeedsValidation.value);
  } catch (error) {
    console.error('Error fetching phase data:', error);
  }
};

const handleValidation = async (isCorrect) => {
  console.log('Handling validation for phase id:', currentPhaseId.value);
  const answerData = phaseAnswer.value;
  await validatePhase(props.group.id, currentPhaseId.value, isCorrect,answerData);

  if (isCorrect) {
    try {
      const nextPhaseId = currentPhaseId.value + 1;
      await gamesService.updatePhaseStatus(props.group.id, nextPhaseId, 'in_progress');

      // Broadcast phase status updates
      console.log('Sending phase status update for group:', props.group.id, ', phase:', currentPhaseId.value, ', status: completed');
      websocketService.sendPhaseStatusUpdate(props.group.id, currentPhaseId.value, 'completed');
      
      console.log('Sending phase status update for group:', props.group.id, ', phase:', nextPhaseId, ', status: in_progress');
      websocketService.sendPhaseStatusUpdate(props.group.id, nextPhaseId, 'in_progress');
    } catch (error) {
      console.error('Error setting next phase to in_progress:', error);
    }
  }
};

const handlePhaseStatusUpdate = (data) => {
  console.log('Phase status updated via WebSocket in GroupInfo:', data);
  if (data.group_id === props.group.id) {
    phaseStatus.value[data.phase_id].status = data.status;
  }
};

onMounted(() => {
  fetchPhaseData();
  EventBus.on('phase_status_update', handlePhaseStatusUpdate);
});

onUnmounted(() => {
  EventBus.off('phase_status_update', handlePhaseStatusUpdate);
});

watch(() => props.group.id, fetchPhaseData, { immediate: true });
</script>