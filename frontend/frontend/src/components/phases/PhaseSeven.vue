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
      <div class="flex justify-between mb-4">
        <div class="w-1/2 pr-2">
          <h3 class="text-xl font-semibold mb-2">User Stories Terminées</h3>
          <div class="overflow-y-auto max-h-96 bg-white p-4 rounded-lg shadow-md">
            <div v-if="completedUserStories.length === 0" class="text-gray-500">
              Aucune User Story terminée pour ce sprint.
            </div>
            <div v-for="(story, index) in completedUserStories" :key="index" class="mb-4 p-4 bg-gray-100 rounded-lg shadow-sm">
              <h4 class="text-lg font-semibold">{{ story.name }}</h4>
              <p class="text-sm text-gray-600">{{ story.description }}</p>
            </div>
          </div>
        </div>
        <div class="w-1/2 pl-2">
          <h3 class="text-xl font-semibold mb-2">User Stories Non Terminées</h3>
          <p class="text-center text-sm text-gray-500">Retourne dans le backlog</p>
          <div class="overflow-y-auto max-h-96 bg-white p-4 rounded-lg shadow-md">
            <div v-if="incompleteUserStories.length === 0" class="text-gray-500">
              Aucune User Story non terminée pour ce sprint.
            </div>
            <div v-for="(story, index) in incompleteUserStories" :key="index" class="mb-4 p-4 bg-gray-100 rounded-lg shadow-sm">
              <h4 class="text-lg font-semibold">{{ story.name }}</h4>
              <p class="text-sm text-gray-600">{{ story.description }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="mb-4">
        <h3 class="text-xl font-semibold mb-2">Commentaires du Client</h3>
        <div class="bg-white p-4 rounded-lg shadow-md">
          <p class="text-sm text-gray-600">{{ clientComment.description }}</p>
        </div>
      </div>
      <div class="mb-4">
        <h3 class="text-xl font-semibold mb-2">Votre réponse</h3>
        <textarea v-model="groupResponse" class="mt-1 block w-full p-2 border rounded-md" rows="3" 
                  :class="{ locked: lockedElements.groupResponse && lockedElements.groupResponse !== currentUser }"
                  @focus="lock('groupResponse')" @blur="unlock('groupResponse')" required></textarea>
      </div>
      <div v-if="isScrumMaster || isProductOwner">
        <button @click.prevent="submitPhaseSevenAnswer" 
              class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 custom-button mb-10">
          Soumettre
        </button>
      </div>
      <div v-else>
        <p class="text-center text-lg mb-10">Seul le Scrum Master et le Product Owner peuvent répondre au client</p>
      </div>
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
  clientComment,
  waiting,
  fetchGroupMembers, 
  setupEvents, 
  cleanupEvents, 
  lockElement, 
  unlockElement, 
  checkValidationAndSendAnswer,
  showWaitingScreen,
  fetchCurrentPhase,
  fetchProjectDetails,
  fetchCompletedUserStories,
  fetchIncompleteUserStories,
  fetchSprintRandomClientComment,
  updateEventAnswer
} = useGame(props.group.id, props.group);

const groupResponse = ref('');
const completedUserStories = ref([]);
const incompleteUserStories = ref([]);

const isScrumMaster = ref(false);
const isProductOwner = ref(false);

const lock = (elementId) => {
  lockElement(elementId);
};

const unlock = (elementId) => {
  unlockElement(elementId);
};

const submitPhaseSevenAnswer = async () => {
  try {
    showWaitingScreen(props.group.id, currentUser.value);
    const answerData = {
      clientCommentId: clientComment.value.id
    };
    await updateEventAnswer(props.group.id, clientComment.value.id, groupResponse.value);
    await checkValidationAndSendAnswer(answerData);
  } catch (error) {
    console.error('Error in phase 7:', error);
  }
};

onMounted(async () => {
  await fetchCurrentPhase();
  fetchGroupMembers();
  setupEvents();
  
  const projectDetails = await fetchProjectDetails(props.group.id);
  if (projectDetails) {
    isScrumMaster.value = projectDetails.scrum_master === currentUser.value;
    isProductOwner.value = projectDetails.product_owner === currentUser.value;
  }

  completedUserStories.value = await fetchCompletedUserStories(props.group.id);
  incompleteUserStories.value = await fetchIncompleteUserStories(props.group.id);
  await fetchSprintRandomClientComment(props.group.id);
  console.log('clientComment:', clientComment.value);
});

onUnmounted(() => {
  cleanupEvents();
});
</script>
