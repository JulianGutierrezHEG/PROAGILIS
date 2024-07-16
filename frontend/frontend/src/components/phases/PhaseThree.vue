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
          <div v-for="(story, index) in existingUserStories" :key="index" @click="openDivideModal(story)">
            <UserStoryCard :story="story" />
          </div>
        </div>
      </div>
      <div class="mb-4">
        <h3 class="text-xl font-semibold mb-2">Nouvelles User Stories</h3>
        <div class="overflow-y-auto max-h-80">
          <UserStoryCard v-for="(story, index) in newUserStories" :key="index" :story="story" />
        </div>
        <button @click="openCreateModal" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2">
          Ajouter une User Story
        </button>
      </div>
      <Modal />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useGame } from '@/composables/useGame';
import EventBus from '@/services/eventBus';
import WaitingScreen from '@/views/WaitingScreen.vue';
import UserStoryCard from '@/components/interactables/UserStoryCard.vue';
import Modal from '@/components/modals/Modal.vue';

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
  existingUserStories, 
  fetchUserStoriesToCut,
  waiting, 
  isLoadingPhaseDetails, 
  currentPhaseDetails 
} = useGame(props.group.id, props.group);

const newUserStories = ref([]);

const openDivideModal = (story) => {
  EventBus.emit('open-modal', { modalType: 'userstorydivide', story });
};

const openCreateModal = () => {
  EventBus.emit('open-modal', { modalType: 'userstorycreate' });
};

EventBus.on('story-submitted', ({ story, isDivide }) => {
  if (isDivide) {
    existingUserStories.value = existingUserStories.value.filter(s => s.id !== story.id);
    newUserStories.value.push(story);
  } else {
    newUserStories.value.push(story);
  }
});

onMounted(async () => {
  fetchGroupMembers();
  setupWebSocket();
  await fetchCurrentPhase();
  await fetchUserStoriesToCut(props.group.id);
});

onUnmounted(() => {
  cleanupWebSocket();
});
</script>
