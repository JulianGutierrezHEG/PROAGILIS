<template>
    <div>
      <h2 class="text-2xl font-semibold mb-4 text-center">Créer une session</h2>
      <form @submit.prevent="createProject">
        <div class="mb-6">
          <label for="project-name" class="block text-gray-700 font-medium mb-2">Nom de la session</label>
          <input type="text" id="project-name" v-model="projectName" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 font-medium mb-2">Groupes</label>
          <div class="flex space-x-4">
            <div class="w-1/2">
              <label for="number-of-groups" class="block text-gray-700 mb-1">Nombre de Groupes</label>
              <input type="number" id="number-of-groups" v-model="numberOfGroups" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
            </div>
            <div class="w-1/2">
              <label for="group-size" class="block text-gray-700 mb-1">Taille du Groupe</label>
              <input type="number" id="group-size" v-model="groupSize" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
            </div>
          </div>
        </div>
        <div class="mb-6">
          <label for="session-password" class="block text-gray-700 font-medium mb-2">Mot de Passe de la Session</label>
          <input type="password" id="session-password" v-model="sessionPassword" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
        </div>
        <div class="text-center">
          <button type="submit" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 mr-4">Créer le Projet</button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const projectName = ref('');
  const numberOfGroups = ref(1);
  const groupSize = ref(1);
  const startDate = ref('');
  const endDate = ref('');
  const sessionPassword = ref('');
  const additionalNotes = ref('');
  
  const createProject = () => {
    console.log('Creating project with:', projectName.value, numberOfGroups.value, groupSize.value, startDate.value, endDate.value, sessionPassword.value, additionalNotes.value);
    // Add your create project logic here
  };
  </script>
  