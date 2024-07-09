<template>
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Phase 7: Review</h2>
      <p class="mb-4">
        Simulez une revue de sprint avec le client. Examinez les travaux terminés et ajoutez de nouvelles user stories basées sur les retours du client.
      </p>
      <div class="flex justify-between mb-4">
        <div class="w-1/2 pr-2">
          <h3 class="text-xl font-semibold mb-2">User Stories Terminées</h3>
          <div class="overflow-y-auto max-h-96 bg-white p-4 rounded-lg shadow-md">
            <div v-for="(story, index) in completedUserStories" :key="index" class="mb-4 p-4 bg-gray-100 rounded-lg shadow-sm">
              <h4 class="text-lg font-semibold">{{ story.description }}</h4>
              <p class="text-sm text-gray-600">{{ story.details }}</p>
            </div>
          </div>
        </div>
        <div class="w-1/2 pl-2">
          <h3 class="text-xl font-semibold mb-2">User Stories Non Terminées</h3>
          <div class="overflow-y-auto max-h-96 bg-white p-4 rounded-lg shadow-md">
            <div v-for="(story, index) in incompleteUserStories" :key="index" class="mb-4 p-4 bg-gray-100 rounded-lg shadow-sm">
              <h4 class="text-lg font-semibold">{{ story.description }}</h4>
              <p class="text-sm text-gray-600">{{ story.details }}</p>
            </div>
          </div>
          <button @click="moveToBacklog" class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Envoyer dans le Product Backlog
          </button>
        </div>
      </div>
      <div class="mb-4">
        <h3 class="text-xl font-semibold mb-2">Commentaires du Client</h3>
        <div class="bg-white p-4 rounded-lg shadow-md">
          <p class="text-sm text-gray-600">{{ clientComments }}</p>
        </div>
      </div>
      <div class="mb-4">
        <h3 class="text-xl font-semibold mb-2">Ajouter de Nouvelles User Stories</h3>
        <button @click="openCreateModal" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mt-2">
          Ajouter une User Story
        </button>
      </div>
      <Modal />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import EventBus from '@/services/eventBus';
  import Modal from '@/components/modals/Modal.vue';
  
  const completedUserStories = ref([
    { description: 'Consulter le catalogue', details: 'Le client peut consulter le catalogue des produits.' },
    { description: 'Ajouter au panier', details: 'Le client peut ajouter des produits à son panier.' },
  ]);
  
  const incompleteUserStories = ref([
    { description: 'Gérer les paiements', details: 'Le client peut gérer les paiements.' },
  ]);
  
  const clientComments = ref('Le client est satisfait du travail effectué, mais souhaite ajouter quelques fonctionnalités supplémentaires.');
  
  const openCreateModal = () => {
    EventBus.emit('open-modal', { modalType: 'userstorycreate' });
  };
  
  const moveToBacklog = () => {
    incompleteUserStories.value.forEach(story => {
      completedUserStories.value.push(story);
    });
    incompleteUserStories.value = [];
  };
  
  EventBus.on('story-submitted', ({ story, isDivide }) => {
    if (!isDivide) {
      completedUserStories.value.push({ description: story.name, details: story.description });
    }
  });
  </script>
  
  <style scoped>
  /* Add any custom styles if needed */
  </style>
  