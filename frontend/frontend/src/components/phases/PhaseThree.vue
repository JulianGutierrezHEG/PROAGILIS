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
      <div class="flex justify-between mb-4">
        <div class="w-1/2 pr-2">
          <h3 class="text-xl font-semibold mb-2">User Stories Existantes</h3>
          <div class="overflow-y-auto max-h-80">
            <div v-for="(story, index) in existingUserStories" :key="index" @click.stop="selectStoryForDivide(story)" :class="{ isSelected: story.id === selectedStoryId }">
              <UserStoryCard :story="story" :isSelected="story.id === selectedStoryId" />
            </div>
          </div>
        </div>
        <div class="w-1/2 pl-2">
          <h3 class="text-xl font-semibold mb-2">Nouvelles User Stories</h3>
          <div class="overflow-y-auto max-h-80">
            <div v-for="(story, index) in newUserStories" :key="index" class=" flex items-center">
              <UserStoryCard :story="story" class="flex-1" />
              <img src="https://cdn-icons-png.flaticon.com/512/6861/6861362.png" alt="delete" class="w-6 h-6 cursor-pointer ml-2" @click="confirmDeleteStory(story.id)">
            </div>
          </div>
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
      <button @click="handleStoryAction" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2 mb-10">
        {{ isDividing ? (divideCounter === 1 ? 'Valider et créer la deuxième' : 'Diviser la User Story') : 'Ajouter une User Story' }}
      </button>
      <div v-if="isScrumMaster">
          <button @click.prevent="submitPhaseThreeAnswer" 
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 custom-button mb-10">
          Soumettre
        </button>
        </div>
        <div v-else>
          <p class="text-center text-lg mb-10">Seul le Scrum Master peut soumettre la réponse</p>
        </div>
     </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useGame } from '@/composables/useGame';
import WaitingScreen from '@/views/WaitingScreen.vue';
import UserStoryCard from '@/components/interactables/UserStoryCard.vue';

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
});

const { 
  waiting, 
  isLoadingPhaseDetails, 
  currentPhaseDetails,
  currentUser,
  fetchGroupMembers, 
  setupEvents, 
  cleanupEvents, 
  fetchCurrentPhase, 
  fetchUserStoriesToCut,
  fetchCreatedUserStories,
  fetchProjectDetails,
  addUserStory,
  deleteUserStory,
  checkValidationAndSendAnswer,
  showWaitingScreen,
  lockElement,
  unlockElement,
} = useGame(props.group.id, props.group);

const isScrumMaster = ref(false);
const existingUserStories = ref([]);
const newUserStories = ref([]);
const newStory = ref({ name: '', description: '' });
const selectedStoryId = ref(null);
const isDividing = ref(false);
const divideCounter = ref(0);
const lockedElements = ref({});

const fetchInitialData = async () => {
  if (!props.group || !props.group.id) {
    console.error('Group ID is not defined');
    return;
  }

  try {
    await fetchCurrentPhase();
    fetchGroupMembers();
    await fetchInitialUserStoriesToCut();
    await fetchCreatedUserStoriesFrontend();
    const projectDetails = await fetchProjectDetails(props.group.id);
    if (projectDetails) {
      isScrumMaster.value = projectDetails.scrum_master === currentUser.value;
    }
  } catch (error) {
    console.error('Error fetching initial data:', error);
  }
};

const handleStoryAction = async () => {
  try {
    if (isDividing.value && selectedStoryId.value) {
      if (divideCounter.value === 0) {
        const response = await addUserStory({
          groupId: props.group.id,
          name: newStory.value.name,
          description: newStory.value.description,
        });
        newUserStories.value.push({ ...newStory.value, id: response.id });
        newStory.value = { name: '', description: '' };
        divideCounter.value = 1;
      } else if (divideCounter.value === 1) {
        const response = await addUserStory({
          groupId: props.group.id,
          name: newStory.value.name,
          description: newStory.value.description,
        });
        newUserStories.value.push({ ...newStory.value, id: response.id });
        
        await deleteUserStory(props.group.id, selectedStoryId.value);
        existingUserStories.value = existingUserStories.value.filter(story => story.id !== selectedStoryId.value);
        
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
      newUserStories.value.push({ ...newStory.value, id: response.id });
      newStory.value = { name: '', description: '' };
    }
  } catch (error) {
    console.error('Erreur lors de la création de la User Story:', error);
  }
};

const selectStoryForDivide = (story) => {
  selectedStoryId.value = story.id; 
  console.log('Selected story:', story.id);
  if (!isDividing.value) {
    isDividing.value = true;
    selectedStoryId.value = story.id;
    divideCounter.value = 0; 
  } else if (isDividing.value && selectedStoryId.value !== story.id) {
    isDividing.value = false;
    selectedStoryId.value = null;
    isDividing.value = true;
    selectedStoryId.value = story.id;
    divideCounter.value = 0; 
  }
};

const fetchCreatedUserStoriesFrontend = async () => {
  try {
    const response = await fetchCreatedUserStories(props.group.id);
    newUserStories.value = response; 
  } catch (error) {
    console.error('Erreur lors de la récupération des User Stories créées:', error);
  }
};

const fetchInitialUserStoriesToCut = async () => {
  try {
    const response = await fetchUserStoriesToCut(props.group.id);
    if (!response || response.length === 0) {
    } else {
      existingUserStories.value = response; 
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des User Stories à découper:', error);
  }
};

const submitPhaseThreeAnswer = async () => {
  try {
    showWaitingScreen(props.group.id, currentUser.value);
    const answerData = {
      userStories: newUserStories.value.map(story => story.id)
    };
    await checkValidationAndSendAnswer(answerData);
  } catch (error) {
    console.error('Erreur lors de la soumission de la réponse pour la phase 3:', error);
  }
};

const lock = (elementId) => {
  lockElement(elementId);
};

const unlock = (elementId) => {
  unlockElement(elementId);
};

const confirmDeleteStory = (storyId) => {
  if (confirm('Êtes-vous sûr de vouloir supprimer cette User Story?')) {
    deleteStory(storyId);
  }
};

const deleteStory = async (storyId) => {
  try {
    await deleteUserStory(props.group.id, storyId);
    newUserStories.value = newUserStories.value.filter(story => story.id !== storyId);
  } catch (error) {
    console.error('Error in deleteStory:', error);
  }
};

onMounted(async () => {
  await fetchInitialData();
  setupEvents();
});

onUnmounted(() => {
  cleanupEvents();
});

watch(
  () => props.group,
  async (newGroup, oldGroup) => {
    if (newGroup && newGroup.id) {
      console.log('Group changed:', newGroup.id);
      await fetchInitialData();
    }
  },
  { immediate: true }
);
</script>
