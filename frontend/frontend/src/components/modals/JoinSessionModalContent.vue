<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4 text-center">Rejoindre une session</h2>
    <form @submit.prevent="handleJoinSession">
      <div class="mb-6">
        <label for="session-dropdown" class="block text-gray-700 font-medium mb-2">Session</label>
        <select id="session-dropdown" v-model="selectedSessionId" @change="handleSessionChange" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
          <option disabled value="">Veuillez sélectionner une session</option>
          <option v-for="session in sessions" :key="session.id" :value="session.id">{{ session.name }}</option>
        </select>
      </div>
      <div v-if="selectedSession" class="mb-6">
        <p class="text-gray-700 font-medium mb-2">Les groupes sont de max: {{ groupSize }}</p>
        <label for="group-dropdown" class="block text-gray-700 font-medium mb-2">Groupe</label>
        <select id="group-dropdown" v-model="selectedGroup" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
          <option disabled value="">Veuillez sélectionner un groupe</option>
          <option v-for="group in groups" :key="group.id" :value="group">{{ group.name }} {{ group.users.length }}/{{ groupSize }}</option>
        </select>
      </div>
      <div class="mb-6">
        <label for="session-password" class="block text-gray-700 font-medium mb-2">Mot de Passe de la session</label>
        <input type="password" id="session-password" v-model="sessionPassword" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
        <p v-if="passwordError" class="text-red-500 text-sm mt-2">Mauvais mot de passe</p>
      </div>
      <div class="text-center">
        <button type="submit" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 mr-4">Rejoindre la session</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSession } from '@/composables/useSession';

const { 
  sessions, 
  selectedSession, 
  groups, 
  selectedGroup, 
  sessionPassword, 
  passwordError, 
  groupSize, 
  fetchAllSessions,
  fetchGroups, 
  joinSession: joinSessionFromComposable, 
  setupEventListeners, 
  removeEventListeners 
} = useSession();

const router = useRouter();
const selectedSessionId = ref('');

const handleSessionChange = async () => {
  selectedSession.value = sessions.value.find(session => session.id === selectedSessionId.value);
  await fetchGroups();
};

onMounted(() => {
  fetchAllSessions(); 
  setupEventListeners();
});

onUnmounted(() => {
  removeEventListeners();
});

const handleJoinSession = async () => {
  console.log('Selected Session:', selectedSession.value);
  console.log('Selected Group:', selectedGroup.value);
  await joinSessionFromComposable(router);
};
</script>
