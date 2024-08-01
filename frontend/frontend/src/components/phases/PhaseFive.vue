<template>
  <div class="p-4 overflow-auto" @click="handleClickOutside">
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
      <div class="mb-10">
        <h3 class="text-xl font-semibold mb-2">User Stories Sélectionnées</h3>
        <span class="mb-5"> Cliquez sur une carte d'User Story pour la séléctionnée pour le prochain sprint. Rappel: {{gameTimeControl.game_hours }}H en jeu = {{gameTimeControl.real_minutes}} minute en réel </span>
        <div class="overflow-y-auto max-h-[45vh] mt-10 mb-5 ">
          <table class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 px-4 bg-gray-100 border-b text-left text-sm font-semibold text-gray-700">User Story</th>
                <th class="py-2 px-4 bg-gray-100 border-b text-left text-sm font-semibold text-gray-700">Temps Estimé</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(story, index) in userStories" :key="index" :class="{ 'bg-white': selectedUserStoryIds.includes(story.id), locked: lockedElements['storyRow' + story.id] && lockedElements['storyRow' + story.id] !== currentUser }" @mouseover="lock('storyRow' + story.id)" @mouseout="unlock('storyRow' + story.id)">
                <td class="py-2 px-4 border-b">
                  <UserStoryCard :story="story" :isSelected="selectedUserStoryIds.includes(story.id)" @click="toggleStorySelection(story.id)" />
                </td>
                <td class="py-2 px-4 border-b">
                  <input type="time" v-model="story.time_estimation_string" class="mt-1 block w-full p-2 border rounded-md" min="00:00" max="23:59" @blur="validateAndUpdateTimeEstimation(story)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="selectedUserStoryIds.length === 0" class="text-red-500 text-center mt-4">
          Au moins une User Story doit être sélectionnée pour continuer
        </div>
        <button v-else @click.prevent="submitPhaseFiveData" 
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 custom-button mt-4">
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
  gameTimeControl,
  lockedElements, 
  currentUser, 
  currentPhaseDetails, 
  isLoadingPhaseDetails, 
  waiting,
  fetchGameTimeControl,
  fetchGroupMembers, 
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
const selectedUserStoryIds = ref([]);
const initialUserStoriesFetched = ref(false);

const lock = (elementId) => {
  lockElement(elementId);
};

const unlock = (elementId) => {
  unlockElement(elementId);
};

const validateAndUpdateTimeEstimation = async (story) => {
  const [hours, minutes] = story.time_estimation_string.split(':').map(part => parseInt(part, 10));
  const totalSeconds = (hours * 3600) + (minutes * 60);

  story.time_estimation = totalSeconds;
  console.log('Time Estimation:', story.time_estimation);

  if (story.time_estimation) {
    await updateUserStory(story.id);
  }
};

const updateUserStory = async (storyId) => {
  const story = userStories.value.find(story => story.id === storyId);
  if (story) {
    await updateUserStoryDetails(storyId, { time_estimation: story.time_estimation });
    websocketService.updateInterface(props.group.id, {
      field: 'userStories',
      value: userStories.value,
    });
  }
};

const toggleStorySelection = (storyId) => {
  if (selectedUserStoryIds.value.includes(storyId)) {
    selectedUserStoryIds.value = selectedUserStoryIds.value.filter(id => id !== storyId);
  } else {
    selectedUserStoryIds.value.push(storyId);
  }
  websocketService.updateInterface(props.group.id, {
    field: 'selectedUserStoryIds',
    value: selectedUserStoryIds.value,
  });
};

const submitPhaseFiveData = async () => {
  showWaitingScreen(props.group.id, currentUser.value);

  const answerData = {
    userStories: selectedUserStoryIds.value
  };
  await checkValidationAndSendAnswer(answerData);
};

const fetchUserStoriesForPhase = async () => {
  if (!initialUserStoriesFetched.value) {
    const response = await fetchBacklog(props.group.id);
    userStories.value = response.map(story => {
      const totalMinutes = Math.floor(story.time_estimation / 60);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      story.time_estimation_string = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      return story;
    });
    initialUserStoriesFetched.value = true;
  }
};

const handlePhaseInterfaceChange = (data) => {
  console.log('Received interface change:', data);
  if (data.field === 'userStories') {
    userStories.value = [...data.value];
  } else if (data.field === 'selectedUserStoryIds') {
    selectedUserStoryIds.value = [...data.value];
  }
};

onMounted(async () => {
  await fetchGroupMembers();
  setupEvents();
  setPhaseHandler(handlePhaseInterfaceChange);
  await fetchCurrentPhase();
  await fetchUserStoriesForPhase();
  await fetchGameTimeControl();
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
