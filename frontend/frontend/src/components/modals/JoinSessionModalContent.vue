<template>
    <div>
      <h2 class="text-2xl font-semibold mb-4 text-center">Rejoindre une session</h2>
      <form @submit.prevent="joinSession">
        <div class="mb-6">
          <label for="session-dropdown" class="block text-gray-700 font-medium mb-2">Session</label>
          <select id="session-dropdown" v-model="selectedSession" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
            <option disabled value="">Veuillez sélectionner une session</option>
            <option v-for="session in sessions" :key="session.id" :value="session.id">{{ session.name }}</option>
          </select>
        </div>
        <div class="mb-6">
          <label for="group-dropdown" class="block text-gray-700 font-medium mb-2">Groupe</label>
          <select id="group-dropdown" v-model="selectedGroup" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
            <option disabled value="">Veuillez sélectionner un groupe</option>
            <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }}</option>
          </select>
        </div>
        <div class="mb-6">
          <label for="session-password" class="block text-gray-700 font-medium mb-2">Mot de Passe de la session</label>
          <input type="password" id="session-password" v-model="sessionPassword" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
        </div>
        <div class="text-center">
          <button type="submit" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 mr-4">Rejoindre la session</button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const sessions = ref([
    { id: '1', name: 'Session 1' },
    { id: '2', name: 'Session 2' },
  ]);
  const selectedSession = ref('');
  const groups = ref([
    { id: '1', name: 'Group 1' },
    { id: '2', name: 'Group 2' },
  ]);
  const selectedGroup = ref('');
  const sessionPassword = ref('');
  
  const joinSession = () => {
    console.log('Joining session with:', selectedSession.value, selectedGroup.value, sessionPassword.value);
    // Add your join session logic here
  };
  </script>
  