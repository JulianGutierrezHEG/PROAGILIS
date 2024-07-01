<template>
  <div class="w-4/5 max-h-screen overflow-hidden bg-gray-200 shadow-lg rounded-lg p-2 mx-auto my-8">
    <div class="flex justify-between items-center mb-8">
      <div v-if="sessions.length > 0" class="relative">
        <select v-model="selectedSession" class="bg-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
          <option v-for="session in sessions" :key="session.id" :value="session">{{ session.name }}</option>
        </select>
      </div>
      <h1 class="text-6xl font-bold text-center">Tableau de bord</h1>
    </div>
    <div class="w-full mx-auto overflow-auto scrollbar-thin" style="max-height: 70vh;">
      <div v-if="sessions.length === 0" class="w-full bg-white shadow-lg rounded-lg p-6 mb-10">
        <h2 class="font-bold text-xl mb-4 text-center">Pas de sessions crées</h2>
      </div>
      <div v-if="selectedSession" class="w-full bg-white shadow-lg rounded-lg p-6 mb-10">
        <h2 class="font-bold text-xl mb-4 text-center">{{ selectedSession.name }} </h2>
        <p class="text-center mb-10">Mot de passe: {{ selectedSession.password }}</p>
        <div class="flex justify-center mb-4 space-x-10">
          <img src="https://cdn-icons-png.flaticon.com/512/25/25442.png" alt="settings" class="w-6 h-6 cursor-pointer">
          <img src="https://cdn-icons-png.flaticon.com/512/727/727245.png" alt="start" class="w-6 h-6 cursor-pointer">
          <img @click="handleDeleteSession(selectedSession.id)" src="https://cdn-icons-png.flaticon.com/512/542/542724.png" alt="delete" class="w-6 h-6 cursor-pointer">
        </div>
        <div class="text-center mb-4 flex justify-around">
          <div class="w-1/2">
            <h3 class="font-bold text-lg mb-2">Groupes vides</h3>
            <table class="mx-auto w-3/4">
              <tbody>
                <tr v-for="id in selectedSession.number_of_groups" :key="id">
                  <td class="px-4 py-2 text-center">Groupe {{ id }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="w-1/2">
            <h3 class="font-bold text-lg mb-2">Groupes crées</h3>
            <table class="mx-auto w-3/4">
              <tbody>
                <tr v-for="group in selectedSession.groups.filter(group => group.users.length > 0) || []" :key="group.id" class="hover:bg-gray-100 cursor-pointer">
                  <td class="px-4 py-2 text-center">
                    Groupe {{ group.id }}: {{ group.users.map(user => user.username).join(', ') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <hr class="my-4 border-black" />
        <div>
          <h3 class="font-bold text-xl text-center mb-4">Infos du groupe</h3>
          <table class="mx-auto w-3/4">
            <thead>
              <tr>
                <th class="px-4 py-2 text-center">Membres</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="group in selectedSession.groups" :key="group.id">
                <td class="px-4 py-2 text-center">{{ group.users.map(user => user.username).join(' | ') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="mt-8">
          <h3 class="font-bold text-xl text-center mb-4">Phase du groupe</h3>
          <ol class="items-center sm:flex justify-center">
            <li class="relative mb-6 sm:mb-0 sm:mr-10" v-for="phase in selectedSession.phases" :key="phase.id">
              <div class="flex items-center">
                <div class="z-10 flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full ring-0 ring-white dark:bg-blue-900 sm:ring-8 dark:ring-gray-900 shrink-0">
                  <svg class="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                  </svg>
                </div>
                <div class="hidden sm:flex w-full bg-gray-200 h-0.5 dark:bg-gray-700"></div>
              </div>
              <div class="mt-3 sm:pr-8">
                <time class="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">{{ phase.name }}</time>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import sessionsService from '@/services/sessionsService';
import { useAuthStore } from '@/stores/authStore';

const sessions = ref([]);
const selectedSession = ref(null);
const authStore = useAuthStore();

const fetchSessions = async () => {
  try {
    sessions.value = await sessionsService.fetchSessions(authStore.userId);
    if (sessions.value.length > 0) {
      selectedSession.value = sessions.value[0];
    }
  } catch (error) {
    console.error('Error fetching sessions:', error);
  }
};

const handleDeleteSession = async (sessionId) => {
  const confirmation = window.confirm('Êtes-vous sûr de vouloir supprimer la session?');
  if (!confirmation) {
    return;
  }

  try {
    await sessionsService.deleteSession(sessionId);
    sessions.value = sessions.value.filter(session => session.id !== sessionId);
    selectedSession.value = sessions.value.length > 0 ? sessions.value[0] : null;
  } catch (error) {
    console.error('Error deleting session:', error);
  }
};

onMounted(() => {
  fetchSessions();
});
</script>

