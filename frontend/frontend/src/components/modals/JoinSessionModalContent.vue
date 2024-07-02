<template>
  <div>
    <h2 class="text-2xl font-semibold mb-4 text-center">Rejoindre une session</h2>
    <form @submit.prevent="joinSession">
      <div class="mb-6">
        <label for="session-dropdown" class="block text-gray-700 font-medium mb-2">Session</label>
        <select id="session-dropdown" v-model="selectedSession" @change="fetchGroups" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
          <option disabled value="">Veuillez sélectionner une session</option>
          <option v-for="session in sessions" :key="session.id" :value="session.id">{{ session.name }}</option>
        </select>
      </div>
      <div v-if="selectedSession" class="mb-6">
        <p class="text-gray-700 font-medium mb-2">Les groupes sont de max: {{ groupSize }}</p>
        <label for="group-dropdown" class="block text-gray-700 font-medium mb-2">Groupe</label>
        <select id="group-dropdown" v-model="selectedGroup" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
          <option disabled value="">Veuillez sélectionner un groupe</option>
          <option v-for="group in groups" :key="group.id" :value="group.id">{{ group.name }} {{ group.users.length }}/{{ groupSize }}</option>
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
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import sessionsService from '@/services/sessionsService';
import { useAuthStore } from '@/stores/authStore';

const sessions = ref([]);
const selectedSession = ref('');
const groups = ref([]);
const selectedGroup = ref('');
const sessionPassword = ref('');
const passwordError = ref(false);
const groupSize = ref(0);
const router = useRouter();
const authStore = useAuthStore();

const fetchSessions = async () => {
  try {
    sessions.value = await sessionsService.fetchSessions(authStore.userId);
  } catch (error) {
    console.error('Error fetching sessions:', error);
  }
};

const fetchGroups = async () => {
  if (!selectedSession.value) return;
  try {
    const session = await sessionsService.getSessionDetails(selectedSession.value);
    groupSize.value = session.group_size; 
    groups.value = session.groups.filter(group => group.users.length < session.group_size);
    console.log('Filtered groups:', groups.value);  
  } catch (error) {
    console.error('Error fetching groups:', error);
  }
};

const joinSession = async () => {
  try {
    const response = await sessionsService.joinSession(selectedSession.value, selectedGroup.value, sessionPassword.value);
    console.log('Join session response:', response);
    if (response.success) {
      await sessionsService.fetchSessions(authStore.userId); 
      router.push(`/game/${selectedSession.value}`);
    } else {
      passwordError.value = true;
    }
  } catch (error) {
    console.error('Error joining session:', error);
    passwordError.value = true;
  }
};

onMounted(() => {
  fetchSessions();
});

watch(selectedSession, (newSession, oldSession) => {
  if (newSession !== oldSession) {
    fetchGroups();
  }
});
</script>
