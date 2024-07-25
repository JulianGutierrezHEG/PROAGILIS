<template>
  <div class="p-4">
    <div v-if="waiting">
      <WaitingScreen />
    </div>
    <div v-else>
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
              <span class="text-sm font-medium text-blue-700 dark:text-black">{{ convertSprintProgress(globalProgress,
                sprintDurationRealTime) }}</span>
            </div>
            <div class="w-full h-6 bg-gray-200 rounded-full dark:bg-gray-700">
              <div class="h-6 bg-green-800 rounded-full dark:bg-yellow-500"
                :style="{ width: globalProgressPercent + '%' }"></div>
            </div>
          </div>
          <div class="mb-4">
            <h3 class="text-xl font-semibold mb-2">User Stories</h3>
            <p class=" mb-5 items-center"> Appuyer sur l'icon de vu pour terminer une User Story</p>
            <div class="overflow-y-auto max-h-96">
              <div v-for="(story, index) in sprintUserStories" :key="index" class="mb-4">
                <div class="flex justify-between mb-1 items-center">
                  <img src="https://cdn-icons-png.flaticon.com/512/16105/16105013.png" alt="complete"
                    class="w-6 h-6 cursor-pointer ml-2" @click="completeUserStoryHandler(story.id)">
                  <span class="text-sm font-medium">{{ story.name }} ({{ convertUserStoryTime(story.time_estimation) }}
                    )</span>
                  <span class="text-xs text-gray-600">({{ Math.round(story.progress) }} %)</span>
                </div>
                <div class="w-full h-6 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div :class="{'bg-green-500': story.is_completed, 'bg-yellow-500': !story.is_completed}"
                    class="h-6 rounded-full" :style="{ width: story.progress + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-4">
            <h3 class="text-xl font-semibold mb-2">Journal des événements</h3>
            <div class="overflow-y-auto max-h-48 bg-gray-100 p-4 rounded-lg">
              <div v-for="(event, index) in eventLog" :key="index" class="mb-2">
                <table class="w-full">
                  <tr>
                    <td class="text-sm">{{ event.description }}</td>
                  </tr>
                  <tr>
                    <td>
                      <textarea v-model="event.answer" class="text-sm w-full mb-2"></textarea>
                    </td>
                  </tr>
                  <tr>
                    <td class="text-right">
                      <button @click="handleEventResponse(event)"
                        class="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 custom-button">
                        Envoyer
                      </button>
                    </td>
                  </tr>
                </table>
                <hr class="my-4 border-black" />
              </div>
            </div>
          </div>
          <div v-if="isScrumMaster" class="mt-10">
            <button @click.prevent="sendSprintData"
              class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 custom-button">
              Terminer le Sprint
            </button>
          </div>
          <div v-else>
            <p class="text-center text-lg mb-10">Seul le Scrum Master peut soumettre la réponse</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useGame } from '@/composables/useGame';
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
  currentSprintProgress,
  sprintUserStories,
  currentSprintDetails,
  isLoadingPhaseDetails, 
  currentPhaseDetails,
  fetchGameTimeControl,
  fetchCurrentPhase, 
  setupEvents, 
  cleanupEvents, 
  checkValidationAndSendAnswer,  
  fetchGroupMembers, 
  fetchProjectDetails, 
  fetchSprintDetails,
  fetchSprintUserStories,
  startSprint,
  updateSprintProgress,
  fetchSprintProgress,
  updateUserStoryProgress,
  fetchUserStoriesProgress,
  completeUserStory,
  showWaitingScreen,
  waiting,
  eventLog,
  fetchSprintRandomEvent,
  updateEventAnswer
} = useGame(props.group.id);

const isScrumMaster = ref(false);
const globalProgress = ref(0);
const globalProgressPercent = ref(0);
const isSprintRunning = ref(false);
const sprintDurationRealTime = ref(0); 
const intervals = ref([]); 

const resetProgress = () => {
  globalProgress.value = 0;
  globalProgressPercent.value = 0;
  sprintUserStories.value = sprintUserStories.value.map(story => ({
    ...story,
    progress: 0,
    progress_time: '00:00:00',
    is_completed: false,
  }));
};

const convertSprintProgress = (progress, sprintDuration) => {
  const totalSprintDays = sprintDuration / (24 * 60);

  const gameMinutesProgress = progress; 
  const gameDaysProgress = Math.floor(gameMinutesProgress / (24 * 60));
  const gameHoursProgress = Math.floor((gameMinutesProgress % (24 * 60)) / 60);
  const gameMinutesRemaining = gameMinutesProgress % 60;

  return `${gameDaysProgress}j${gameHoursProgress}h${gameMinutesRemaining}m/${totalSprintDays}j`;
};

const convertUserStoryTime = (timeSeconds) => {
  const realMinutes = Math.round(timeSeconds / 60); 
  const gameHours = realMinutes; 

  const days = Math.floor(gameHours / 24);
  const hours = gameHours % 24;

  return `${realMinutes}m en temps réel et ${days}j${hours}h en jeu`;
};

const timeStringToSeconds = (timeString) => {
  const parts = timeString.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parseInt(parts[2], 10);
  return (hours * 3600) + (minutes * 60) + seconds;
};

const updateSprintProgressOnly = async () => {
  await updateSprintProgress(props.group.id, currentSprintDetails.value.id);
  await fetchSprintProgress(props.group.id, currentSprintDetails.value.id);

  const response = currentSprintProgress.value;
  if (response && response.current_progress) {
    globalProgress.value = response.current_progress;
    globalProgressPercent.value = (globalProgress.value / sprintDurationRealTime.value) * 100;
  }
};

const updateUserStoryProgressOnly = async () => {
  try {
    await fetchUserStoriesProgress(props.group.id, currentSprintDetails.value.id);

    sprintUserStories.value = sprintUserStories.value.map(story => {
      const progressTimeSeconds = parseFloat(story.progress_time);
      const timeEstimationSeconds = parseFloat(story.time_estimation);
      const progressPercentage = (progressTimeSeconds / timeEstimationSeconds) * 100;
      console.log(`User Story: ${story.name}, Progress Time: ${progressTimeSeconds}, Time Estimation: ${timeEstimationSeconds}, Progress: ${progressPercentage}%`);
      return {
        ...story,
        progress: progressPercentage
      };
    });

    for (const story of sprintUserStories.value) {
      if (!story.is_completed) {
        console.log(`Updating user story progress for story ID: ${story.id}`);
        await updateUserStoryProgress(props.group.id, currentSprintDetails.value.id, story.id);
      }
    }
  } catch (error) {
    console.error('Error updating user story progress:', error);
  }
};

const updateProgress = async () => {
  await updateSprintProgressOnly();
  await updateUserStoryProgressOnly();
};

const SprintStart = async () => {
  isSprintRunning.value = true;
  resetProgress();
  await startSprint(props.group.id, currentSprintDetails.value.id);
  const intervalId = setInterval(updateProgress, 1000);
  intervals.value.push(intervalId); 
};

const fetchSprintDetailsPhase = async () => {
  await fetchSprintDetails(props.group.id);
};

const fetchSprintUserStoriesPhase = async () => {
  await fetchSprintUserStories(props.group.id);
  console.log('Fetched User Stories:', sprintUserStories.value);
  sprintUserStories.value = sprintUserStories.value.map(story => ({
    ...story,
    progress: (timeStringToSeconds(story.progress_time) / timeStringToSeconds(story.time_estimation)) * 100
  }));
};

const completeUserStoryHandler = async (storyId) => {
  await completeUserStory(props.group.id, currentSprintDetails.value.id, storyId);
  await fetchUserStoriesProgress(props.group.id, currentSprintDetails.value.id);
};

const sendData = async (isSprintCompletion = false) => {
  const answerData = {
    events: eventLog.value.filter(event => event.answer).map(event => ({
      id: event.id,
      answer: event.answer
    }))
  };

  if (isSprintCompletion) {
    if (confirm("Êtes-vous sûr de vouloir terminer le sprint ?")) {
      showWaitingScreen(props.group.id, currentUser.value);
      await checkValidationAndSendAnswer(answerData);
    }
  }
  else {
    websocketService.sendPhaseAnswerUpdate(groupId, currentPhaseDetails.value.id, answerData);
  }
};

const sendSprintData = async () => {
  await sendData(true);
};

const handleEventResponse = async (event) => {
  await updateEventAnswer(props.group.id, event.id, event.answer);
  await sendData(false);
};

const fetchInitialData = async () => {
  await fetchSprintDetailsPhase();
  await fetchGameTimeControl();
  await fetchGroupMembers();
  setupEvents();
  await fetchCurrentPhase();
  await fetchSprintUserStoriesPhase();
  await fetchSprintProgress(props.group.id, currentSprintDetails.value.id);
  await fetchUserStoriesProgress(props.group.id, currentSprintDetails.value.id);

  sprintDurationRealTime.value = gameTimeControl.value.sprint_duration * 24 * 60;
  globalProgress.value = currentSprintProgress.value.current_progress;
  globalProgressPercent.value = (globalProgress.value / sprintDurationRealTime.value) * 100;

  const projectDetails = await fetchProjectDetails(props.group.id);
  if (projectDetails) {
    isScrumMaster.value = projectDetails.scrum_master === currentUser.value;
  }

  if (currentSprintProgress.value.current_progress < sprintDurationRealTime.value) {
    SprintStart(); 
  }

  const eventFetchInterval = setInterval(() => fetchSprintRandomEvent(props.group.id), 60000); // Fetch event every 60 seconds
  intervals.value.push(eventFetchInterval);
};

onMounted(async () => {
  await fetchInitialData();
});

onUnmounted(() => {
  cleanupEvents();
  intervals.value.forEach(clearInterval); 
});
</script>
