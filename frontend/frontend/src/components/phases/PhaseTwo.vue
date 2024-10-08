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
      <form @submit.prevent="submitPhaseTwoAnswer" class="max-w-lg mx-auto">
        <div v-if="showWarning" class="text-center text-red-500 mb-4">Certaines réponses sont vides.</div>
        <div class="mb-6">
          <label for="specific" class="block text-gray-700 text-lg">Spécifique</label>
          <textarea id="specific" v-model="smartObjectives.specific" class="mt-1 block w-full p-2 border rounded-md" rows="3" 
                    :class="{ locked: lockedElements.specific && lockedElements.specific !== currentUser }"
                    @focus="lock('specific')" @blur="unlock('specific')" @input="updateSmart" required></textarea>
        </div>
        <div class="mb-6">
          <label for="measurable" class="block text-gray-700 text-lg">Mesurable</label>
          <textarea id="measurable" v-model="smartObjectives.measurable" class="mt-1 block w-full p-2 border rounded-md" rows="3" 
                    :class="{ locked: lockedElements.measurable && lockedElements.measurable !== currentUser }"
                    @focus="lock('measurable')" @blur="unlock('measurable')" @input="updateSmart" required></textarea>
        </div>
        <div class="mb-6">
          <label for="achievable" class="block text-gray-700 text-lg">Atteignable</label>
          <textarea id="achievable" v-model="smartObjectives.achievable" class="mt-1 block w-full p-2 border rounded-md" rows="3" 
                    :class="{ locked: lockedElements.achievable && lockedElements.achievable !== currentUser }"
                    @focus="lock('achievable')" @blur="unlock('achievable')" @input="updateSmart" required></textarea>
        </div>
        <div class="mb-6">
          <label for="relevant" class="block text-gray-700 text-lg">Réalisable</label>
          <textarea id="relevant" v-model="smartObjectives.relevant" class="mt-1 block w-full p-2 border rounded-md" rows="3" 
                    :class="{ locked: lockedElements.relevant && lockedElements.relevant !== currentUser }"
                    @focus="lock('relevant')" @blur="unlock('relevant')" @input="updateSmart" required></textarea>
        </div>
        <div class="mb-6">
          <label for="timeBound" class="block text-gray-700 text-lg">Délimité dans le temps</label>
          <textarea id="timeBound" v-model="smartObjectives.timeBound" class="mt-1 block w-full p-2 border rounded-md" rows="3" 
                    :class="{ locked: lockedElements.timeBound && lockedElements.timeBound !== currentUser }"
                    @focus="lock('timeBound')" @blur="unlock('timeBound')" @input="updateSmart" required></textarea>
        </div>
        <div v-if="isScrumMaster">
          <button @click.prevent="submitPhaseTwoAnswer" 
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 custom-button mb-10">
          Soumettre
        </button>
        </div>
        <div v-else>
          <p class="text-center text-lg mb-10">Seul le Scrum Master peut soumettre la réponse</p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useGame } from '@/composables/useGame';
import WaitingScreen from '@/views/WaitingScreen.vue';
import websocketService from '@/services/websocketService';

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
});

const { 
  lockedElements, 
  currentUser, 
  currentPhaseDetails, 
  isLoadingPhaseDetails, 
  waiting,
  fetchGroupMembers, 
  setupEvents, 
  cleanupEvents, 
  lockElement, 
  unlockElement, 
  checkValidationAndSendAnswer,
  checkPendingStatus,
  fetchCurrentPhase,
  fetchProjectDetails,
  setPhaseHandler
} = useGame(props.group.id, props.group);

const smartObjectives = ref({
  specific: '',
  measurable: '',
  achievable: '',
  relevant: '',
  timeBound: ''
});
const showWarning = ref(false);

const isScrumMaster = ref(false);

const lock = (elementId) => {
  lockElement(elementId);
};

const unlock = (elementId) => {
  unlockElement(elementId);
};

const updateSmart = () => {
  websocketService.updateInterface(props.group.id, { field: 'smartObjectives', value: smartObjectives.value });
};

const submitPhaseTwoAnswer = async () => {
  if (!smartObjectives.value.specific.trim() || !smartObjectives.value.measurable.trim() || !smartObjectives.value.achievable.trim() || !smartObjectives.value.relevant.trim() || !smartObjectives.value.timeBound.trim()) {
    showWarning.value = true;
    return;
  }
  showWarning.value = false;

  const answerData = {
      specific: smartObjectives.value.specific,
      measurable: smartObjectives.value.measurable,
      achievable: smartObjectives.value.achievable,
      relevant: smartObjectives.value.relevant,
      timeBound: smartObjectives.value.timeBound
  };
  await checkValidationAndSendAnswer(answerData);
};

const handlePhaseInterfaceChange = (data) => {
  if (data.field === 'smartObjectives') {
    smartObjectives.value = { ...data.value };
  }
};

onMounted(async () => {
  await fetchCurrentPhase();
  fetchGroupMembers();
  setupEvents();
  setPhaseHandler(handlePhaseInterfaceChange);

  const projectDetails = await fetchProjectDetails(props.group.id);
  if (projectDetails) {
    isScrumMaster.value = projectDetails.scrum_master === currentUser.value;
  }
});

onUnmounted(() => {
  cleanupEvents();
  setPhaseHandler(null);
});
</script>
