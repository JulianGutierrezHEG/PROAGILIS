<template>
  <div class="p-4">
    <div v-if="waiting">
      <WaitingScreen />
    </div>
    <div v-else>
      <h2 v-if="!isLoadingPhaseDetails" class="text-3xl font-bold mb-6 text-center">{{ currentPhaseDetails.name }}</h2>
      <p v-if="!isLoadingPhaseDetails" class="mb-4">{{ currentPhaseDetails.description }}</p>
      <div v-if="currentSprintDetails && Object.keys(currentSprintDetails).length > 0">
        <p class="mb-4">
          Sprint {{ currentSprintDetails.sprint_number }} sur 3
        </p>
        <div class="mb-4">
          <h3 class="text-xl font-semibold mb-2">Timeline du Sprint</h3>
          <h4 class="mb-2">(Infos: Temps réel | Temps en jeu )</h4>
          <div class="relative mb-4">
            <div class="flex justify-between mb-1">
              <span class="text-base font-medium text-blue-700 dark:text-black">
                Progression Globale ({{ convertGameDaysToRealTime(gameTimeControl.sprint_duration) }} | {{ gameTimeControl.sprint_duration }}j )
              </span>
              <span class="text-sm font-medium text-blue-700 dark:text-black">
                {{ convertSecondsToHM(globalProgress) }} | {{ convertToGameTime(globalProgress) }}
              </span>
            </div>
            <div class="w-full h-6 bg-gray-200 rounded-full dark:bg-gray-700">
              <div class="h-6 bg-green-800 rounded-full dark:bg-yellow-500" :style="{ width: sprintprogress + '%' }"></div>
            </div>
          </div>
          <div class="mb-4">
            <h3 class="text-xl font-semibold mb-2">User Stories</h3>
            <p class="mb-5 items-center"> Appuyer sur l'icon de vu pour terminer une User Story</p>
            <div class="overflow-y-auto max-h-96">
              <div v-for="(story, index) in sortedSprintUserStories" :key="index" class="mb-4">
                <div class="flex justify-between mb-1 items-center">
                  <img src="https://cdn-icons-png.flaticon.com/512/16105/16105013.png" alt="complete" class="w-6 h-6 cursor-pointer ml-2" :class="{ locked: lockedElements['completeIcon' + story.id] && lockedElements['completeIcon' + story.id] !== currentUser }" @mouseover="lock('completeIcon' + story.id)" @mouseout="unlock('completeIcon' + story.id)" @click="completeUserStoryHandler(story.id)">
                  <span class="text-sm font-medium">
                    {{ story.name }} ({{ convertSecondsToHM(story.time_estimation) }} | {{ convertToGameTime(story.time_estimation) }})
                  </span>
                  <span class="text-xs text-gray-600">
                    {{ convertSecondsToHM(story.progress_time) }} | {{ convertToGameTime(story.progress_time) }}
                  </span>
                </div>
                <div class="w-full h-6 bg-gray-200 rounded-full dark:bg-gray-700">
                  <div :class="{'bg-green-500': story.is_completed, 'bg-yellow-500': !story.is_completed}" class="h-6 rounded-full" :style="{ width: Math.min(100, story.progress) + '%'}"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-between mt-4">
            <div class="w-1/2 pr-2">
              <h3 class="text-xl font-semibold mb-2">Journal des événements</h3>
              <div class="overflow-y-auto max-h-48 bg-gray-100 p-4 rounded-lg">
                <div v-if="sortedEvents.length === 0" class="text-center text-gray-500">
                  Pas d'événements en attente
                </div>
                <div v-else v-for="(event, index) in sortedEvents" :key="index" class="mb-2">
                  <table class="w-full">
                    <tr>
                      <td class="text-sm">{{ event.description }}</td>
                    </tr>
                    <tr>
                      <td>
                        <textarea v-model="event.answer" class="text-sm w-full mb-2" :disabled="event.answered" :class="{ 'bg-gray-200': event.answered }"></textarea>
                      </td>
                    </tr>
                    <tr v-if="!event.answered">
                      <td class="text-right">
                        <button @click="handleEventResponse(event)" class="bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600 custom-button">Envoyer</button>
                      </td>
                    </tr>
                  </table>
                  <hr class="my-4 border-black" />
                </div>
              </div>
            </div>
            <div class="w-1/2 pl-2">
              <h3 class="text-xl font-semibold mb-2">Événements Répondus</h3>
              <div class="overflow-y-auto max-h-48 bg-gray-100 p-4 rounded-lg">
                <div v-if="sortedAnsweredEvents && sortedAnsweredEvents.length === 0" class="text-center text-gray-500">
                  Pas d'événements répondus
                </div>
                <div v-else v-for="(event, index) in sortedAnsweredEvents" :key="index" class="mb-2">
                  <table class="w-full">
                    <tr>
                      <td class="text-sm">{{ event.description }}</td>
                    </tr>
                    <tr>
                      <td>
                        <textarea v-model="event.answer" class="text-sm w-full mb-2 bg-gray-200" disabled></textarea>
                      </td>
                    </tr>
                  </table>
                  <hr class="my-4 border-black" />
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4 text-center">
            <p class="text-sm mb-2 text-gray-500">{{ eventEffectText }}</p>
          </div>
          <div v-if="isScrumMaster" class="mt-10">
            <button @click.prevent="sendSprintData" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 custom-button">Terminer le Sprint</button>
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
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
  currentUser,
  gameTimeControl,
  currentSprintProgress,
  sprintUserStories,
  currentSprintDetails,
  isLoadingPhaseDetails, 
  currentPhaseDetails,
  answeredEvents,
  waiting,
  eventLog,
  lockedElements,
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
  fetchSprintRandomEvent,
  updateEventAnswer,
  fetchAnsweredEvents,
  applyEventEffect,
  setPhaseHandler,
  lockElement, 
  unlockElement,
} = useGame(props.group.id, props.group);

const isScrumMaster = ref(false);
const globalProgress = ref('');
const globalProgressPercent = ref(0);
const isSprintRunning = ref(false);
const userStoryInterval = ref(null); 
const sprintInterval = ref(null); 
const eventFetchInterval = ref(null); 
const eventEffectText = ref('');
const sprintprogress = ref(0);

const lock = (elementId) => {
  lockElement(elementId);
};

const unlock = (elementId) => {
  unlockElement(elementId);
};

const resetProgress = () => {
  globalProgress.value = '';
  globalProgressPercent.value = 0;
  sprintUserStories.value = sprintUserStories.value.map(story => ({
    ...story,
    progress: 0,
    progress_time: '0h00m',
    is_completed: false,
  }));
};

const convertSecondsToHM = (seconds) => {
  if (isNaN(seconds) || seconds === undefined || seconds === null) {
    return '0h00m';
  }
  const date = new Date(0);
  date.setSeconds(seconds);
  const hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}h${minutes}m`;
};

const convertToGameTime = (realTimeSeconds) => {
  const realMinutes = realTimeSeconds / 60;
  const gameHours = realMinutes / gameTimeControl.value.real_minutes * gameTimeControl.value.game_hours;
  
  const days = Math.floor(gameHours / 24);
  const hours = Math.floor(gameHours % 24);
  const minutes = Math.floor((gameHours * 60) % 60);

  return `${days}j${hours}h${minutes}m`;
};

const convertGameDaysToRealTime = (gameDays) => {
  const gameHours = gameDays * 24; 
  const realMinutes = gameHours * gameTimeControl.value.real_minutes / gameTimeControl.value.game_hours;
  const realHours = Math.floor(realMinutes / 60);
  const realRemainingMinutes = Math.floor(realMinutes % 60);
  return `${realHours}h${realRemainingMinutes}m`;
};

const updateSprintProgressOnly = async () => {
  try {
    await updateSprintProgress(props.group.id, currentSprintDetails.value.id);
    await fetchSprintProgress(props.group.id, currentSprintDetails.value.id);

    const response = currentSprintProgress.value;

    if (response && response.current_progress) {
      globalProgress.value = response.current_progress;
      const totalSprintDurationSeconds = gameTimeControl.value.sprint_duration * 24 * 3600; 
      sprintprogress.value = Math.min((response.current_progress / totalSprintDurationSeconds) * 6000, 100); 

      if (globalProgress.value >= totalSprintDurationSeconds) {
        globalProgress.value = totalSprintDurationSeconds; 
        clearInterval(sprintInterval.value);
      }
    }
  } catch (error) {
    console.error("Error updating sprint progress:", error);
  }
};

const updateUserStoryProgressOnly = async () => {
  try {
    await fetchUserStoriesProgress(props.group.id, currentSprintDetails.value.id);

    sprintUserStories.value = sprintUserStories.value.map(story => {
      const progressTime = story.progress_time;
      return {
        ...story,
        progress: Math.min((progressTime / story.time_estimation) * 100, 100) 
      };
    });

    if (sprintUserStories.value.every(story => story.is_completed)) {
    } else {
      for (const story of sprintUserStories.value) {
        if (!story.is_completed) {
          await updateUserStoryProgress(props.group.id, currentSprintDetails.value.id, story.id);
        }
      }
    }
  } catch (error) {
    console.error('Error updating user story progress:', error);
  }
};

const updateSprintProgressInterval = () => {
  sprintInterval.value = setInterval(updateSprintProgressOnly, 1000);
};

const updateUserStoryProgressInterval = () => {
  userStoryInterval.value = setInterval(updateUserStoryProgressOnly, 1000);
};

const SprintStart = async () => {
  isSprintRunning.value = true;
  resetProgress();
  await startSprint(props.group.id, currentSprintDetails.value.id);
  updateSprintProgressInterval();
  updateUserStoryProgressInterval();
};

const fetchSprintDetailsPhase = async () => {
  await fetchSprintDetails(props.group.id);
};

const fetchSprintUserStoriesPhase = async () => {
  await fetchSprintUserStories(props.group.id);
  sprintUserStories.value = sprintUserStories.value.map(story => ({
    ...story,
    progress: (story.progress_time / story.time_estimation) * 100
  }));
};

const completeUserStoryHandler = async (storyId) => {
  await completeUserStory(props.group.id, currentSprintDetails.value.id, storyId);
  await fetchUserStoriesProgress(props.group.id, currentSprintDetails.value.id);
  await fetchAnsweredEvents(props.group.id);
  websocketService.updateInterface(props.group.id, {
    field: 'answeredEvents',
    value: answeredEvents.value,
  });
};

const sendData = async (isSprintCompletion = false) => {
  const answeredEventIds = answeredEvents.value ? answeredEvents.value.map(event => event.id) : [];

  const answerData = {
    answeredEvents: answeredEventIds
  };

  websocketService.sendPhaseAnswerUpdate(props.group.id, currentPhaseDetails.value.id, answerData);

  if (isSprintCompletion) {
    if (confirm("Êtes-vous sûr de vouloir terminer le sprint ?")) {
      showWaitingScreen(props.group.id, currentUser.value);
      await checkValidationAndSendAnswer(answerData);
    }
  } else {
    websocketService.sendPhaseAnswerUpdate(props.group.id, currentPhaseDetails.value.id, answerData);
  }
};

const sendSprintData = async () => {
  await sendData(true);
};

const handleEventResponse = async (event) => {
  try {
    await updateEventAnswer(props.group.id, event.id, event.answer);
    event.answered = true;

    const response = await applyEventEffect(props.group.id, event.id);
    
    if (response.time_change_seconds) {
      const timeChange = response.time_change_seconds;
      const effectType = response.effect_type === 'positif' ? 'Effet positif' : 'Effet négatif';
      const affectedEntity = response.affected_entity;

      if (affectedEntity.includes("user story")) {
        eventEffectText.value = `${effectType} - l'${affectedEntity} ${response.effect_type === 'positif' ? 'avance' : 'recule'} de ${convertSecondsToHM(timeChange)} / ${convertToGameTime(timeChange)}`;
      } else {
        eventEffectText.value = `${effectType} - ${convertSecondsToHM(timeChange)} / ${convertToGameTime(timeChange)} ${response.effect_type === 'positif' ? 'ajouté au sprint' : 'retiré du sprint'}`;
      }
    }

    const updatedEventLog = eventLog.value.filter(e => e.id !== event.id);
    eventLog.value = [event, ...updatedEventLog]; 

    await fetchAnsweredEvents(props.group.id);

    websocketService.updateInterface(props.group.id, {
      field: 'answeredEvents',
      value: answeredEvents.value,
    });

    await sendData(false);
  } catch (error) {
    console.error('Error handling event response:', error);
  }
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
  await fetchAnsweredEvents(props.group.id);

  globalProgress.value = currentSprintProgress.value.current_progress;

  const projectDetails = await fetchProjectDetails(props.group.id);
  if (projectDetails) {
    isScrumMaster.value = projectDetails.scrum_master === currentUser.value;
  }

  if (currentSprintProgress.value.current_progress < gameTimeControl.value.sprint_duration * 24 * 3600) { 
    SprintStart(); 
  }

  eventFetchInterval.value = setInterval(() => fetchSprintRandomEvent(props.group.id), 20000); 
};

const sortedSprintUserStories = computed(() => {
  return sprintUserStories.value.slice().sort((a, b) => a.id - b.id);
});

const sortedEvents = computed(() => {
  return eventLog.value.filter(event => !event.answered).reverse(); 
});

const sortedAnsweredEvents = computed(() => {
  return answeredEvents.value ? answeredEvents.value.slice().reverse() : [];
});

const handlePhaseInterfaceChange = (data) => {
  console.log('Received interface change:', data);
  if (data.field === 'answeredEvents') {
    answeredEvents.value = [...data.value];
  }
};

onMounted(async () => {
  await fetchInitialData();
  setPhaseHandler(handlePhaseInterfaceChange);
  if (currentSprintProgress.value.current_progress < gameTimeControl.value.sprint_duration * 24 * 3600) { 
    SprintStart(); 
  }
});

onUnmounted(() => {
  cleanupEvents();
  setPhaseHandler(null);
  if (userStoryInterval.value) {
    clearInterval(userStoryInterval.value);
    userStoryInterval.value = null;
  }
  if (sprintInterval.value) {
    clearInterval(sprintInterval.value);
    sprintInterval.value = null;
  }
  if (eventFetchInterval.value) {
    clearInterval(eventFetchInterval.value);
    eventFetchInterval.value = null;
  }
});
</script>

<style scoped>
.locked {
  display: none;
}
</style>