<template>
  <div>
    <div class="mt-8">
      <h3 class="font-bold text-xl text-center mb-4">Phase du groupe</h3>
      <i class="block text-center text-sm"> Cliquez sur le numéro de la phase pour voir les réponses</i>
      <ol class="items-center w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0 rtl:space-x-reverse">
        <li v-for="(phase, index) in phases" :key="phase.id" :class="getPhaseClass(phaseStatus[phase.id]?.status)">
          <span 
            class="flex items-center justify-center w-8 h-8 border rounded-full shrink-0 cursor-pointer"
            :class="getPhaseBorderClass(phaseStatus[phase.id]?.status)"
            @click="() => openPhaseModal(phase)"
          >
            {{ index + 1 }}
          </span>
          <span>
            <h3 class="font-medium leading-tight">{{ phase.name }}</h3>
            <p class="text-sm">{{ getStatusText(phaseStatus[phase.id]?.status) }}</p>
          </span>
        </li>
      </ol>
    </div>
    <Modal />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, provide, onUnmounted } from 'vue';
import { useGame } from '@/composables/useGame';
import EventBus from '@/services/eventBus';
import Modal from '@/components/modals/Modal.vue';

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
});

const { fetchPhases, fetchGroupPhasesStatus, fetchPhaseDetails } = useGame(props.group.id);

const phases = ref([]);
const phaseStatus = ref({});
const statusChoices = ref({});

const groupId = ref(props.group.id);
const phaseId = ref(null);
const phaseNeedsValidation = ref(false);

provide('groupId', groupId);
provide('phaseId', phaseId);
provide('phaseNeedsValidation', phaseNeedsValidation);

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
  console.log('Récupération des données du groupe:', props.group.id);
  try {
    const fetchedPhases = await fetchPhases();
    phases.value = fetchedPhases;
    phases.value = fetchedPhases.sort((a, b) => a.id - b.id);

    const response = await fetchGroupPhasesStatus(props.group.id);
    phaseStatus.value = {};
    statusChoices.value = response.status_choices;
    response.phase_statuses.forEach(status => {
      phaseStatus.value[status.phase.id] = status;
    });

    console.log('Phase Status:', phaseStatus.value);
  } catch (error) {
    console.error('Erreur lors de la récupération des données de la phase:', error);
  }
};

const openPhaseModal = async (phase) => {
  const modalType = `Phase${phase.id}Answer`;
  const phaseDetails = await fetchPhaseDetails(phase.id);
  phaseId.value = phaseDetails.id;
  phaseNeedsValidation.value = phaseDetails.requires_validation;
  groupId.value = props.group.id;
  EventBus.emit('open-modal', { modalType });
};

const handlePhaseStatusUpdate = (data) => {
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
