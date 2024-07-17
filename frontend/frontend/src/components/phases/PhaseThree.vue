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
        <h3 class="text-xl font-semibold mb-2">User Stories Existantes</h3>
        <div class="overflow-y-auto max-h-80">
          <div v-for="(story, index) in existingUserStories" :key="index" @click.stop="selectStoryForDivide(story)">
            <UserStoryCard :story="story" :isSelected="story.id === selectedStoryId" />
          </div>
        </div>
      </div>
      <div class="mb-4">
        <h3 class="text-xl font-semibold mb-2">Nouvelles User Stories</h3>
        <div class="overflow-y-auto max-h-80">
          <UserStoryCard v-for="(story, index) in newUserStories" :key="index" :story="story" />
        </div>
      </div>
      <div class="mb-4" :class="{ locked: lockedElements.storyName && lockedElements.storyName !== currentUser }">
        <label for="storyName" class="block text-gray-700">Nom de la User Story</label>
        <input type="text" id="storyName" v-model="newStory.name" class="mt-1 block w-full p-2 border rounded-md" 
               @focus="lock('storyName')" @blur="unlock('storyName')" />
      </div>
      <div class="mb-4" :class="{ locked: lockedElements.storyDescription && lockedElements.storyDescription !== currentUser }">
        <label for="storyDescription" class="block text-gray-700">Description</label>
        <textarea id="storyDescription" v-model="newStory.description" class="mt-1 block w-full p-2 border rounded-md" rows="3"
                  @focus="lock('storyDescription')" @blur="unlock('storyDescription')"></textarea>
      </div>
      <button @click="handleStoryAction" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2">
        {{ isDividing ? (divideCounter === 1 ? 'Valider et créer la deuxième' : 'Diviser la User Story') : 'Ajouter une User Story' }}
      </button>
      <button @click="submitPhaseThreeAnswer" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 mt-2">
        Soumettre la réponse
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useGame } from '@/composables/useGame';
import EventBus from '@/services/eventBus';
import WaitingScreen from '@/views/WaitingScreen.vue';
import UserStoryCard from '@/components/interactables/UserStoryCard.vue';
import { useGameStore } from '@/stores/gameStore';

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
});

const { 
  fetchGroupMembers, 
  setupWebSocket, 
  cleanupWebSocket, 
  fetchCurrentPhase, 
  fetchUserStoriesToCut,
  addUserStory,
  deleteUserStory,
  fetchUserStories,
  checkValidationAndSendAnswer,
  showWaitingScreen,
  lockElement,
  unlockElement,
  waiting, 
  isLoadingPhaseDetails, 
  currentPhaseDetails,
  existingUserStories,
  currentUser
} = useGame(props.group.id, props.group);

const gameStore = useGameStore();
const newUserStories = ref([]);
const newStory = ref({ name: '', description: '' });
const selectedStoryId = ref(null);
const isDividing = ref(false);
const divideCounter = ref(0);
const createdUserStoryIds = ref([]);
const initialUserStoriesFetched = ref(false);
const lockedElements = ref({});

const handleStoryAction = async () => {
  try {
    console.log('Handling story action on user stories:', newStory.value.name, selectedStoryId.value);
    if (isDividing.value) {
      if (divideCounter.value === 0) {
        newUserStories.value.push({ ...newStory.value });
        newStory.value = { name: '', description: '' };
        divideCounter.value = 1;
      } else {
        const response = await addUserStory({
          groupId: props.group.id,
          name: newStory.value.name,
          description: newStory.value.description,
        });
        createdUserStoryIds.value.push(response.id);
        gameStore.addCreatedUserStoryId(response.id);
        
        if (selectedStoryId.value) {
          console.log(`Deleting user story with ID ${selectedStoryId.value} for group ${props.group.id}`);
          await deleteUserStory(props.group.id, selectedStoryId.value);
          existingUserStories.value = existingUserStories.value.filter(story => story.id !== selectedStoryId.value);
        }

        newUserStories.value.push({ ...newStory.value });
        newStory.value = { name: '', description: '' };
        isDividing.value = false;
        selectedStoryId.value = null;
        divideCounter.value = 0;
      }
    } else {
      const response = await addUserStory({
        groupId: props.group.id,
        name: newStory.value.name,
        description: newStory.value.description
      });
      createdUserStoryIds.value.push(response.id);
      gameStore.addCreatedUserStoryId(response.id);
      newUserStories.value.push({ ...newStory.value });
      newStory.value = { name: '', description: '' };
    }
  } catch (error) {
    console.error('Error in handleStoryAction:', error);
  }
};

const selectStoryForDivide = (story) => {
  if (!isDividing.value) {
    isDividing.value = true;
    selectedStoryId.value = story.id;
  } else if (isDividing.value && selectedStoryId.value !== story.id) {
    isDividing.value = false;
    selectedStoryId.value = null;
    isDividing.value = true;
    selectedStoryId.value = story.id;
  }
};

const fetchCreatedUserStories = async () => {
  if (gameStore.createdUserStoryIds.length > 0) {
    console.log('Fetching created user stories with IDs:', gameStore.createdUserStoryIds);
    const response = await fetchUserStories(props.group.id, gameStore.createdUserStoryIds);
    newUserStories.value = response;
    console.log('Fetched created user stories:', newUserStories.value);
  }
};

const fetchInitialUserStoriesToCut = async () => {
  if (!initialUserStoriesFetched.value) {
    await fetchUserStoriesToCut(props.group.id);
    initialUserStoriesFetched.value = true;
  }
};

const submitPhaseThreeAnswer = async () => {
  try {
    showWaitingScreen(props.group.id, currentUser.value);
    const answerData = {
      userStories: gameStore.createdUserStoryIds
    };
    await checkValidationAndSendAnswer(answerData);
    console.log('Answer submitted for phase 3:', answerData);
  } catch (error) {
    console.error('Error in submitPhaseThreeAnswer:', error);
  }
};

const lock = (elementId) => {
  lockElement(elementId);
};

const unlock = (elementId) => {
  unlockElement(elementId);
};

onMounted(async () => {
  gameStore.initializeStore();
  fetchGroupMembers();
  setupWebSocket();
  await fetchCurrentPhase();
  await fetchInitialUserStoriesToCut();
  await fetchCreatedUserStories();
});

onUnmounted(() => {
  cleanupWebSocket();
});
</script>

<style scoped>
.isSelected {
  background-color: rgba(0, 123, 255, 0.1);
}
</style>
