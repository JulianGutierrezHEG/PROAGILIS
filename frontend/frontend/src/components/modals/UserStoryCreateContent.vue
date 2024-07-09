<template>
    <div>
      <div class="mb-4">
        <label for="storyName" class="block text-gray-700">Nom de la User Story</label>
        <input type="text" id="storyName" v-model="story.name" class="mt-1 block w-full p-2 border rounded-md" />
      </div>
      <div class="mb-4">
        <label for="storyDescription" class="block text-gray-700">Description</label>
        <textarea id="storyDescription" v-model="story.description" class="mt-1 block w-full p-2 border rounded-md" rows="3"></textarea>
      </div>
      <button @click="handleSubmit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
        Valider
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import EventBus from '@/services/eventBus';
  
  const story = ref({ name: '', description: '' });
  
  const handleSubmit = () => {
    EventBus.emit('story-submitted', { story: story.value, isDivide: false });
    EventBus.emit('close-modal');
  };
  </script>
  