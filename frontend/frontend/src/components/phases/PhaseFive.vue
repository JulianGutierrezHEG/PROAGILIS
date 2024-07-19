<template>
  <div class="p-4 overflow-auto">
    <div v-if="waiting">
      <WaitingScreen />
    </div>
    <div v-else>
      <div class="flex justify-between items-center mb-4">
        <h2 v-if="!isLoadingPhaseDetails" class="text-3xl font-bold">{{ currentPhaseDetails.name }}</h2>
        <p v-if="!isLoadingPhaseDetails" class="mb-4">{{ currentPhaseDetails.description }}</p>
        <a href="https://trello.com" target="_blank" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
          Ouvrir Trello
        </a>
      </div>
      <div class="mb-4">
        <h3 class="text-xl font-semibold mb-2">User Stories Sélectionnées</h3>
        <span> Clickez sur une carte d'User Story pour la séléctionnée pour le prochain sprint</span>
        <div class="overflow-y-auto max-h-96">
          <table class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 px-4 bg-gray-100 border-b text-left text-sm font-semibold text-gray-700">User Story</th>
                <th class="py-2 px-4 bg-gray-100 border-b text-left text-sm font-semibold text-gray-700">Temps Estimé (h)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(story, index) in userStories" :key="index" :class="{ 'bg-green-100': selectedUserStoryIds.includes(story.id) }">
                <td class="py-2 px-4 border-b">
                  <UserStoryCard :story="story" :isSelected="selectedUserStoryIds.includes(story.id)" @click="toggleStorySelection(story.id)" />
                </td>
                <td class="py-2 px-4 border-b"
                  :class="{ locked: lockedElements['timeEstimate' + story.id] && lockedElements['timeEstimate' + story.id] !== currentUser }"
                  @mouseover="lock('timeEstimate' + story.id)" @mouseout="unlock('timeEstimate' + story.id)">
                  <input type="number" v-model="story.time_estimation" class="mt-1 block w-full p-2 border rounded-md" min="1" @input="validateAndUpdateTimeEstimation(story)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button @click.prevent="submitPhaseFiveData" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 custom-button">
          Soumettre
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useGame } from '@/composables/useGame';
import websocketService from '@/services/websocketService';
import WaitingScreen from '@/views/WaitingScreen.vue';
import UserStoryCard from '@/components/interactables/UserStoryCard.vue';

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
  checkValidationAndSendAnswer,
  showWaitingScreen,
  fetchCurrentPhase,
  fetchUserStories,
  updateUserStoryDetails
} = useGame(props.group.id, props.group);

const userStories = ref([]);
const selectedUserStoryIds = ref([]);
const initialUserStoriesFetched = ref(false);

const lock = (elementId) => {
  lockElement(elementId);
};

const unlock = (elementId) => {
  unlockElement(elementId);
};

const validateAndUpdateTimeEstimation = async (story) => {
  const numericValue = story.time_estimation.toString().replace(/[^0-9]/g, '');
  story.time_estimation = numericValue ? parseInt(numericValue, 10) : '';
  if (story.time_estimation) {
    await updateUserStory(story.id);
  }
};

const updateUserStory = async (storyId) => {
  const story = userStories.value.find(story => story.id === storyId);
  if (story) {
    await updateUserStoryDetails(storyId, { time_estimation: story.time_estimation });
    websocketService.updateUserStoryDetails(props.group.id, storyId, story.time_estimation, currentUser.value);
  }
};

const toggleStorySelection = (storyId) => {
  if (selectedUserStoryIds.value.includes(storyId)) {
    selectedUserStoryIds.value = selectedUserStoryIds.value.filter(id => id !== storyId);
  } else {
    selectedUserStoryIds.value.push(storyId);
  }
  console.log('Selected User Stories for Sprint:', selectedUserStoryIds.value);
};

const submitPhaseFiveData = async () => {
  showWaitingScreen(props.group.id, currentUser.value);

  const answerData = {
    userStories: selectedUserStoryIds.value
  };
  console.log('Answer Data:', answerData);
  await checkValidationAndSendAnswer(answerData);
};

const fetchUserStoriesForPhase = async () => {
  if (!initialUserStoriesFetched.value) {
    const response = await fetchUserStories(props.group.id);
    userStories.value = response;
    initialUserStoriesFetched.value = true;
  }
};

onMounted(async () => {
  fetchGroupMembers();
  setupWebSocket();
  await fetchCurrentPhase();
  await fetchUserStoriesForPhase();
});

onUnmounted(() => {
  cleanupWebSocket();
});
</script>

<style scoped>
.bg-green-100 {
  background-color: rgba(105, 214, 169, 0.5);
}
</style>
