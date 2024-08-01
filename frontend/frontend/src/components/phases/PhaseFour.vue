<template>
  <div class="p-4 overflow-auto" @click="handleClickOutside">
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
        <div class="overflow-y-auto max-h-[45vh] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          <div v-for="(story, index) in userStories" :key="index" class="p-4 border rounded-lg shadow-sm bg-white">
            <UserStoryCard :story="story" />
            <div :class="{ locked: lockedElements['businessValue' + story.id] && lockedElements['businessValue' + story.id] !== currentUser }"
                 @mouseover="lock('businessValue' + story.id)" @mouseout="unlock('businessValue' + story.id)">
              <label for="businessValue" class="block text-gray-700 mt-2">Valeur Métier</label>
              <input
                type="number"
                v-model="story.business_value"
                class="mt-1 block w-full p-2 border rounded-md"
                min="1"
                max="100"
                @input="validateAndUpdateBusinessValue(story)"
              />
            </div>
          </div>
        </div>
        <button @click.prevent="submitPhaseFourData" 
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 custom-button mb-10">
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
  fetchProjectDetails,
  setupEvents, 
  cleanupEvents, 
  lockElement, 
  unlockElement, 
  checkValidationAndSendAnswer,
  showWaitingScreen,
  fetchCurrentPhase,
  fetchBacklog,
  updateUserStoryDetails,
  setPhaseHandler,
} = useGame(props.group.id, props.group);

const userStories = ref([]);
const initialUserStoriesFetched = ref(false);

const lock = (elementId) => {
  lockElement(elementId);
};

const unlock = (elementId) => {
  unlockElement(elementId);
};

const validateAndUpdateBusinessValue = async (story) => {
  const numericValue = story.business_value.toString().replace(/[^0-9]/g, '');
  story.business_value = numericValue ? parseInt(numericValue, 10) : '';
  if (story.business_value) {
    await updateUserStory(story.id);
  }
};

const updateUserStory = async (storyId) => {
  const story = userStories.value.find(story => story.id === storyId);
  if (story) {
    await updateUserStoryDetails(storyId, { business_value: story.business_value });
    websocketService.updateInterface(props.group.id, {
      field: 'userStories',
      value: userStories.value,
    });
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
    const response = await fetchBacklog(props.group.id);
    userStories.value = response.filter(story => !story.is_completed);
    initialUserStoriesFetched.value = true;
  }
};

const handlePhaseInterfaceChange = (data) => {
  console.log('Received interface change:', data);
  if (data.field === 'userStories') {
    userStories.value = [...data.value];
  }
};

onMounted(async () => {
  await fetchCurrentPhase();
  fetchGroupMembers();
  setupEvents();
  setPhaseHandler(handlePhaseInterfaceChange);
  await fetchUserStoriesForPhase();
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

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
</style>
