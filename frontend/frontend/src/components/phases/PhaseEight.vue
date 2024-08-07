<template>
  <div class="p-4">
    <div v-if="waiting">
      <WaitingScreen />
    </div>
    <div v-else>
      <h2 v-if="!isLoadingPhaseDetails" class="text-3xl font-bold mb-6 text-center">{{ currentPhaseDetails.name }}</h2>
      <p v-if="!isLoadingPhaseDetails" class="mb-6 text-center">
        {{ currentPhaseDetails.description }}
      </p>
      <form @submit.prevent="submitPhaseEightAnswer" class="max-w-lg mx-auto">
        <div v-if="showWarning" class="text-center text-red-500 mb-4">Certaines réponses sont vides.</div>
        <div class="mb-6">
          <label for="wentWell" class="block text-gray-700 text-lg">Ce qui a bien fonctionné</label>
          <textarea id="wentWell" v-model="retrospective.wentWell" class="mt-1 block w-full p-4 border rounded-md" rows="5" 
                    :class="{ locked: lockedElements.wentWell && lockedElements.wentWell !== currentUser }"
                    @focus="lock('wentWell')" @blur="unlock('wentWell')" @input="updateRetrospective" required></textarea>
        </div>
        <div class="mb-6">
          <label for="couldBeImproved" class="block text-gray-700 text-lg">Ce qui pourrait être amélioré</label>
          <textarea id="couldBeImproved" v-model="retrospective.couldBeImproved" class="mt-1 block w-full p-4 border rounded-md" rows="5" 
                    :class="{ locked: lockedElements.couldBeImproved && lockedElements.couldBeImproved !== currentUser }"
                    @focus="lock('couldBeImproved')" @blur="unlock('couldBeImproved')" @input="updateRetrospective" required></textarea>
        </div>
        <div class="mb-6">
          <label for="actionItems" class="block text-gray-700 text-lg">Actions à entreprendre</label>
          <textarea id="actionItems" v-model="retrospective.actionItems" class="mt-1 block w-full p-4 border rounded-md" rows="5" 
                    :class="{ locked: lockedElements.actionItems && lockedElements.actionItems !== currentUser }"
                    @focus="lock('actionItems')" @blur="unlock('actionItems')" @input="updateRetrospective" required></textarea>
        </div>
        <div v-if="currentSprintDetails && currentSprintDetails.sprint_number === 3" class="mb-6 text-center">
          <p class="text-red-500 font-bold">Vous êtes sur le point de finir le dernier sprint, vous serez éjecté de la partie après validation de cette phase.</p>
        </div>
        <button @click.prevent="submitPhaseEightAnswer" 
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 custom-button mb-10">
            Soumettre
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useGame } from '@/composables/useGame';
import { useSession } from '@/composables/useSession';
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
  currentSprintDetails,
  waiting,
  fetchGroupMembers, 
  setupEvents, 
  cleanupEvents, 
  lockElement, 
  unlockElement, 
  checkValidationAndSendAnswer,
  fetchCurrentPhase,
  fetchSprintDetails,
  setPhaseHandler
} = useGame(props.group.id, props.group);

const { leaveSession } = useSession();

const retrospective = ref({
  wentWell: '',
  couldBeImproved: '',
  actionItems: ''
});
const showWarning = ref(false);

const lock = (elementId) => {
  lockElement(elementId);
};

const unlock = (elementId) => {
  unlockElement(elementId);
};

const updateRetrospective = () => {
  websocketService.updateInterface(props.group.id, { field: 'retrospective', value: retrospective.value });
};

const submitPhaseEightAnswer = async () => {
  if (!retrospective.value.wentWell.trim() || !retrospective.value.couldBeImproved.trim() || !retrospective.value.actionItems.trim()) {
    showWarning.value = true;
    return;
  }
  showWarning.value = false;

  const answerData = {
      wentWell: retrospective.value.wentWell,
      couldBeImproved: retrospective.value.couldBeImproved,
      actionItems: retrospective.value.actionItems
  };
  await checkValidationAndSendAnswer(answerData);
  if (currentSprintDetails && currentSprintDetails.sprint_number === 3) {
      alert("Vous avez terminé le dernier sprint. Vous serez éjecté de la session.");
      await leaveSession();
  }

};

const handlePhaseInterfaceChange = (data) => {
  if (data.field === 'retrospective') {
    retrospective.value = { ...data.value };
  }
};

onMounted(async () => {
  await fetchCurrentPhase();
  fetchGroupMembers();
  setupEvents();
  setPhaseHandler(handlePhaseInterfaceChange);
  await fetchSprintDetails(props.group.id);
});

onUnmounted(() => {
  cleanupEvents();
  setPhaseHandler(null);
});
</script>

<style scoped>
.custom-button {
  display: block;
  margin: 0 auto;
}
</style>