<template>
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Phase 3: Compléter le Product Backlog</h2>
      <p class="mb-4">
        Ajoutez au moins 5 nouvelles user stories à votre product backlog incomplet. Prenez 2 user stories existantes et divisez-les en stories plus gérables.
      </p>
      <p class="mb-4 text-sm text-gray-500">
        Cliquez sur une user story existante pour la diviser.
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
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import EventBus from '@/services/eventBus';
  import UserStoryCard from '@/components/interactables/UserStoryCard.vue';
  import Modal from '@/components/modals/Modal.vue';
  
  const existingUserStories = ref([
    { name: 'Consulter le catalogue', value: 'Haute', description: 'En tant que client, je veux pouvoir consulter le catalogue de produits pour choisir ce que je veux acheter.' },
    { name: 'Ajouter au panier', value: 'Moyenne', description: 'En tant que client, je veux ajouter des produits à mon panier pour les acheter plus tard.' }
  ]);
  
  const newUserStories = ref([]);
  
  const openDivideModal = (story) => {
    EventBus.emit('open-modal', { modalType: 'userstorydivide', story });
  };
  
  const openCreateModal = () => {
    EventBus.emit('open-modal', { modalType: 'userstorycreate' });
  };
  
  EventBus.on('story-submitted', ({ story, isDivide }) => {
    if (isDivide) {
      existingUserStories.value = existingUserStories.value.filter(s => s.name !== story.name && s.description !== story.description);
      newUserStories.value.push({ name: story.name, value: 'Moyenne', description: story.description });
    } else {
      newUserStories.value.push({ name: story.name, value: 'Moyenne', description: story.description });
    }
  });
  </script>
  