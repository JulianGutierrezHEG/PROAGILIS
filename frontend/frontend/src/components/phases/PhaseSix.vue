<template>
  <div class="p-4">
    <h2 v-if="!isLoadingPhaseDetails" class="text-3xl font-bold">{{ currentPhaseDetails.name }}</h2>
    <p v-if="!isLoadingPhaseDetails" class="mb-4">{{ currentPhaseDetails.description }}</p>
    <div v-if="currentSprintDetails && Object.keys(currentSprintDetails).length > 0">
      <p class="mb-4">
        Sprint {{ currentSprintDetails.sprint_number }} sur 3
      </p>
      <div class="mb-4">
        <h3 class="text-xl font-semibold mb-2">Timeline du Sprint</h3>
        <div class="relative mb-4">
          <div class="flex justify-between mb-1">
            <span class="text-base font-medium text-blue-700 dark:text-black">Progression Globale</span>
            <span class="text-sm font-medium text-blue-700 dark:text-black">{{ convertToGameTime(globalProgress) }}</span>
          </div>
          <div class="w-full h-6 bg-gray-200 rounded-full dark:bg-gray-700">
            <div class="h-6 bg-green-500 rounded-full dark:bg-green-500" :style="{ width: globalProgressPercent + '%' }"></div>
          </div>
        </div>
        <div class="mb-4">
          <h3 class="text-xl font-semibold mb-2">User Stories</h3>
          <div class="overflow-y-auto max-h-96">
            <div v-for="(story, index) in sprintTasks" :key="index" class="mb-4">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">{{ story.name }} ({{ story.time_estimation }} en temps réel)</span>
                <span class="text-xs text-gray-600">({{ convertToGameTime(story.time_estimation) }} en jeu)</span>
              </div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">{{ story.progress_time }}</span>
              </div>
              <div class="w-full h-6 bg-gray-200 rounded-full dark:bg-gray-700">
                <div class="h-6 bg-green-800 rounded-full dark:bg-green-500" :style="{ width: story.progress + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4 flex justify-between">
          <button @click="startSprint" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
            Démarrer le Sprint
          </button>
          <button @click="simulateEvent" class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">
            Simuler un Événement
          </button>
        </div>
        <div class="mt-4">
          <h3 class="text-xl font-semibold mb-2">Journal des événements</h3>
          <div class="overflow-y-auto max-h-48 bg-gray-100 p-4 rounded-lg">
            <div v-for="(event, index) in eventLog" :key="index" class="mb-2">
              <span class="text-sm">{{ event }}</span>
            </div>
          </div>
        </div>
        <div v-if="isScrumMaster" class="mt-10">
          <button @click.prevent="sendSprintData" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 custom-button">
            Terminer le Sprint
          </button>
        </div>
        <div v-else>
          <p class="text-center text-lg mb-10">Seul le Scrum Master peut soumettre la réponse</p>
        </div>
      </div>
    </div>
    <div v-else>
      <WaitingScreen />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useGame } from '@/composables/useGame';
import websocketService from '@/services/websocketService';
import WaitingScreen from '@/views/WaitingScreen.vue';

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
});

const { 
  currentUser,
  gameTimeControl,
  fetchGameTimeControl,
  fetchCurrentPhase, 
  setupEvents, 
  cleanupEvents, 
  checkValidationAndSendAnswer,  
  fetchGroupMembers, 
  fetchProjectDetails, 
  isLoadingPhaseDetails, 
  currentPhaseDetails,
  fetchSprintDetails,
  currentSprintDetails,
  fetchSprintUserStories,
  sprintUserStories
} = useGame(props.group.id, props.group);

const isScrumMaster = ref(false);
const sprintTasks = ref([]);
const globalProgress = ref(0);
const globalProgressPercent = ref(0);
const eventLog = ref([]);
let sprintInterval;
const sprintDurationRealTime = 14 * 24 * 60; 

const convertToGameTime = (realTime) => {
  if (typeof realTime === 'number') {
    const hours = Math.floor(realTime / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((realTime % 3600) / 60).toString().padStart(2, '0');
    realTime = `${hours}:${minutes}`;
  }
  
  const parts = realTime.split(':');
  const realHours = parseInt(parts[0], 10);
  const realMinutes = parseInt(parts[1], 10);
  const totalRealMinutes = realHours * 60 + realMinutes;
  const gameMinutesPerRealMinute = gameTimeControl.value.game_hours / gameTimeControl.value.real_minutes;
  const totalGameHours = totalRealMinutes * gameMinutesPerRealMinute;
  const gameDays = Math.floor(totalGameHours / 24);
  const gameHours = Math.floor(totalGameHours % 24);

  return `${gameDays}j ${gameHours}h`;
};

const startSprint = () => {
  clearInterval(sprintInterval);
  globalProgress.value = 0;
  globalProgressPercent.value = 0;
  eventLog.value = [];
  sprintTasks.value.forEach(task => {
    task.progress = 0;
    task.progress_time = 0;
  });

  sprintInterval = setInterval(() => {
    if (globalProgress.value < sprintDurationRealTime) {
      globalProgress.value += 1;
      globalProgressPercent.value = (globalProgress.value / sprintDurationRealTime) * 100;

      sprintTasks.value.forEach(task => {
        if (task.progress_time < task.time_estimation) {
          task.progress_time += 60; 
          task.progress = (task.progress_time / task.time_estimation) * 100;
          if (task.progress_time >= task.time_estimation) {
            task.is_completed = true;
            task.status = 'Terminé';
            updateUserStory(task.id);
          }
        }
      });
    } else {
      clearInterval(sprintInterval);
    }
  }, 1000);
};

const fetchSprintDetailsPhase = async () => {
  await fetchSprintDetails(props.group.id);
  console.log('Current Sprint Details:', currentSprintDetails.value);
};

const fetchSprintUserStoriesPhase = async () => {
  await fetchSprintUserStories(props.group.id);
  sprintTasks.value = sprintUserStories.value;
  console.log('Sprint User Stories:', sprintTasks.value);
};

const sendSprintData = async () => {
  const completedStories = sprintTasks.value.filter(story => story.is_completed);
  const answerData = {
    userStories: completedStories.map(story => story.id)
  };
  console.log('Sending Sprint Data:', answerData);
  await checkValidationAndSendAnswer(answerData);
};

onMounted(async () => {
  await fetchSprintDetailsPhase();
  await fetchGameTimeControl();
  await fetchGroupMembers();
  setupEvents();
  await fetchCurrentPhase();
  await fetchSprintUserStoriesPhase();
  const projectDetails = await fetchProjectDetails(props.group.id);
  if (projectDetails) {
    isScrumMaster.value = projectDetails.scrum_master === currentUser.value;
  }
});

onUnmounted(() => {
  cleanupEvents();
});
</script>
