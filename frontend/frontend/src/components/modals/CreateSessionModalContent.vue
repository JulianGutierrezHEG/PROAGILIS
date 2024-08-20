<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4 text-center">Créer une session</h2>
    <form @submit.prevent="createSession">
      <div class="mb-6">
        <label for="project-name" class="block text-gray-700 font-medium mb-2">Nom de la session</label>
        <input type="text" id="project-name" v-model="sessionName" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
      </div>
      <div class="mb-6">
        <label class="block text-gray-700 font-medium mb-2">Groupes</label>
        <div class="flex space-x-4">
            <div class="w-1/2">
            <label for="number-of-groups" class="block text-gray-700 mb-1">Nombre de groupes</label>
            <input type="number" id="number-of-groups" v-model="numberOfGroups" min="1" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
          </div>
          <div class="w-1/2">
            <label for="group-size" class="block text-gray-700 mb-1">Taille du groupe</label>
            <input type="number" id="group-size" v-model="groupSize" min="1" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
          </div>
        </div>
      </div>
      <div class="mb-6">
        <label for="session-password" class="block text-gray-700 font-medium mb-2">Mot de passe de la session</label>
        <input type="password" id="session-password" v-model="sessionPassword" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
      </div>
      <div class="text-center">
        <button type="submit" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 mr-4">Créer la session</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import sessionsService from '@/services/sessionsService';

const sessionName = ref('');
const numberOfGroups = ref(1);
const groupSize = ref(1);
const sessionPassword = ref('');

const router = useRouter();

const createSession = async () => {
  const sessionData = {
    name: sessionName.value,
    number_of_groups: numberOfGroups.value,
    group_size: groupSize.value,
    password: sessionPassword.value,
  };
  try {
    await sessionsService.createSession(sessionData);
    router.push('/dashboard'); 
  } catch (error) {
    console.log("Erreur lors de la création de la session:",error);
  }

};
</script>
