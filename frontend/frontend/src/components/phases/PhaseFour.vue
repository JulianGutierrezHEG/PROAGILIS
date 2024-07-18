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
      <div class="mb-4">
        <h3 class="text-xl font-semibold mb-2">User Stories Corrigées</h3>
        <div class="overflow-y-auto" style="max-height: 700px;">
          <table class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 px-4 bg-gray-100 border-b text-left text-sm font-semibold text-gray-700">User Story</th>
                <th class="py-2 px-4 bg-gray-100 border-b text-left text-sm font-semibold text-gray-700">Valeur Métier</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(story, index) in userStories" :key="index">
                <td class="py-2 px-4 border-b">
                  <UserStoryCard :story="story" />
                </td>
                <td class="py-2 px-4 border-b" :class="{ locked: lockedElements['businessValue' + story.id] && lockedElements['businessValue' + story.id] !== currentUser }"
                  @mouseover="lock('businessValue' + story.id)" @mouseout="unlock('businessValue' + story.id)">
                  <input
                    type="number"
                    v-model="story.business_value"
                    class="mt-1 block w-full p-2 border rounded-md"
                    min="1"
                    max="100"
                    @input="updateUserStory(story.id)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button @click.prevent="submitPhaseFourData" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 custom-button">
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
const initialUserStoriesFetched = ref(false);

const lock = (elementId) => {
  lockElement(elementId);
};

const unlock = (elementId) => {
  unlockElement(elementId);
};

const updateUserStory = async (storyId) => {
  const story = userStories.value.find(story => story.id === storyId);
  if (story) {
    await updateUserStoryDetails(storyId, { business_value: story.business_value });
    websocketService.updateUserStoryDetails(props.group.id, storyId, story.business_value, currentUser.value);
  }
};

const submitPhaseFourData = async () => {
  showWaitingScreen(props.group.id, currentUser.value);

  const answerData = {
    userStories: userStories.value.map(story => ({
      id: story.id,
      business_value: story.business_value
    }))
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

