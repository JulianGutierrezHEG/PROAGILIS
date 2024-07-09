<template>
    <div>
      <p class="mb-4"><strong>User Story existante :</strong></p>
      <UserStoryCard v-if="existingStory" :story="existingStory" />
      <div class="mb-4">
        <label for="storyName" class="block text-gray-700">Nom de la nouvelle User Story</label>
        <input type="text" id="storyName" v-model="story.name" class="mt-1 block w-full p-2 border rounded-md" />
      </div>
      <div class="mb-4">
        <label for="storyDescription" class="block text-gray-700">Description</label>
        <textarea id="storyDescription" v-model="story.description" class="mt-1 block w-full p-2 border rounded-md" rows="3"></textarea>
      </div>
      <button @click="handleSubmit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
        {{ isSecond ? 'Valider' : 'Valider et créer la deuxième' }}
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import EventBus from '@/services/eventBus';
  import UserStoryCard from '@/components/interactables/UserStoryCard.vue';
  
  const story = ref({ name: '', description: '' });
  const existingStory = ref(null);
  const isSecond = ref(false);
  
  const handleSubmit = () => {
    EventBus.emit('story-submitted', { story: story.value, isDivide: true });
    if (isSecond.value) {
      EventBus.emit('close-modal');
      isSecond.value = false;
    } else {
      // Clear the current story input for creating the second part
      story.value = { name: '', description: '' };
      isSecond.value = true;
    }
  };
  
  const openModalHandler = (event) => {
    existingStory.value = event.story || { name: '', value: '', description: '' };
    isSecond.value = false; // Reset to first story
  };
  
  EventBus.on('open-modal', openModalHandler);
  </script>
  