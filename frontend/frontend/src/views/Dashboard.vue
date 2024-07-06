<template>
  <div class="w-4/5 max-h-screen overflow-hidden bg-gray-200 shadow-lg rounded-lg p-2 mx-auto my-8">
    <div class="flex justify-between items-center mb-8">
      <div v-if="sessions.length > 0" class="relative">
        <select v-model="selectedSession" @change="fetchGroups"
          class="bg-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
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
          <img v-if="selectedSession.status !== 'active'"
               src="https://cdn-icons-png.flaticon.com/512/727/727245.png" 
               alt="start" 
               class="w-6 h-6 cursor-pointer" 
               @click="handleStatusSession('start')">
          <img v-else
               src="https://cdn-icons-png.flaticon.com/512/3669/3669483.png" 
               alt="paused" 
               class="w-6 h-6 cursor-pointer" 
               @click="handleStatusSession('paused')">
          <img src="https://cdn-icons-png.flaticon.com/512/6861/6861362.png" alt="delete" class="w-6 h-6 cursor-pointer" @click="handleDeleteSession(selectedSession.id)">
        </div>
        <div class="text-center mb-4 flex justify-around">
          <div class="w-1/2">
            <h3 class="font-bold text-lg mb-2">Groupes vides</h3>
            <table class="mx-auto w-3/4">
              <tbody>
                <tr v-for="group in selectedSession.groups.filter(group => group.users.length === 0)" :key="group.id">
                  <td class="px-4 py-2 text-center">{{ group.name }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="w-1/2">
            <h3 class="font-bold text-lg mb-2">Groupes crées</h3>
            <table class="mx-auto w-3/4">
              <tbody>
                <tr v-for="group in selectedSession.groups.filter(group => group.users.length > 0) || []"
                  :key="group.id" class="hover:bg-gray-100 cursor-pointer" @click="selectGroup(group)">
                  <td class="px-4 py-2 text-center">
                    {{ group.name }}
                  </td>
                  <td class="px-4 py-2 text-center">
                    {{ group.users.map(user => user.username).join(', ') }}
                  </td>
                  <td class="px-4 py-2 text-center">
                    {{ group.users.length }}/{{ selectedSession.group_size }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <hr class="my-4 border-black" />
        <div v-if="selectedGroup">
          <GroupInfo :group="selectedGroup" />
        </div>
        <div v-else>
          <h3 class="font-bold text-xl text-center mb-4">Pas de groupes sélectionné</h3>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, watch } from 'vue';
import { useSession } from '@/composables/useSession';
import GroupInfo from '@/components/dashboard/GroupInfo.vue';
import websocketService from '@/services/websocketService';

const { 
  sessions, 
  selectedSession, 
  groups, 
  selectedGroup, 
  fetchUserSessions, 
  fetchGroups, 
  handleStatusSession, 
  handleDeleteSession, 
  setupEventListeners, 
  removeEventListeners 
} = useSession();

const selectGroup = (group) => {
  selectedGroup.value = group;
};

watch(selectedSession, (newSession, oldSession) => {
  if (oldSession) {
    oldSession.groups.forEach(group => {
      console.log('Disconnecting WebSocket for group:', group.id);
      websocketService.disconnectGroup(group.id);
    });
    console.log('Disconnecting WebSocket for session:', oldSession.id);
    websocketService.disconnectSession(oldSession.id);
  }
  if (newSession) {
    newSession.groups.forEach(group => {
      console.log('Connecting WebSocket for group:', group.id);
      websocketService.connectGroup(group.id);
    });
    console.log('Connecting WebSocket for session:', newSession.id);
    websocketService.connectSessionStatus(newSession.id);
  }
}, { immediate: true });

watch(groups, (newGroups) => {
  console.log('Groups updated:', newGroups);
});

onMounted(async () => {
  await fetchUserSessions();
  setupEventListeners();

  if (sessions.value.length > 0) {
    selectedSession.value = sessions.value[0];
    await fetchGroups();
  }
});

onUnmounted(() => {
  removeEventListeners();
});
</script>
