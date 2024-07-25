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
      <div class="mb-10">
        <h3 class="text-xl font-semibold mb-2">User Stories Sélectionnées</h3>
        <span class="mb-5"> Clickez sur une carte d'User Story pour la séléctionnée pour le prochain sprint.Rappel: {{gameTimeControl.game_hours }}H en jeu = {{gameTimeControl.real_minutes}} minute en réel </span>
        <div class="overflow-y-auto max-h-96 mt-10 ">
          <table class="min-w-full bg-white ">
            <thead>
              <tr>
                <th class="py-2 px-4 bg-gray-100 border-b text-left text-sm font-semibold text-gray-700">User Story</th>
                <th class="py-2 px-4 bg-gray-100 border-b text-left text-sm font-semibold text-gray-700">Temps Estimé</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(story, index) in userStories" :key="index" :class="{ 'bg-white': selectedUserStoryIds.includes(story.id) }">
                <td class="py-2 px-4 border-b">
                  <UserStoryCard :story="story" :isSelected="selectedUserStoryIds.includes(story.id)" @click="toggleStorySelection(story.id)" />
                </td>
                <td class="py-2 px-4 border-b"
                  :class="{ locked: lockedElements['timeEstimate' + story.id] && lockedElements['timeEstimate' + story.id] !== currentUser }"
                  >
                  <input type="time" v-model="story.time_estimation" class="mt-1 block w-full p-2 border rounded-md" min="00:00" max="23:59" @blur="validateAndUpdateTimeEstimation(story)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
          <button @click.prevent="submitPhaseFiveData" 
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 custom-button">
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
  gameTimeControl,
  fetchGameTimeControl,
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
  const [hours, minutes] = story.time_estimation.split(':').map(part => parseInt(part, 10));
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

onMounted(async () => {
  await fetchGroupMembers();
  setupEvents();
  await fetchCurrentPhase();
  await fetchUserStoriesForPhase();
  await fetchGameTimeControl();
});

onUnmounted(() => {
  cleanupEvents();
});
</script>
