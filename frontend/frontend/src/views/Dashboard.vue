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
import { ref, onMounted, onUnmounted, watch } from 'vue';
import sessionsService from '@/services/sessionsService';
import usersService from '@/services/usersService';
import { useAuthStore } from '@/stores/authStore';
import GroupInfo from '@/components/dashboard/GroupInfo.vue';
import EventBus from '@/services/eventBus';
import websocketService from '@/services/websocketService';

const sessions = ref([]);
const selectedSession = ref(null);
const selectedGroup = ref(null);
const authStore = useAuthStore();
const groups = ref([]);

const { connectGroup, disconnectGroup, sendMessage, connectSessionStatus, disconnectSession } = websocketService;

const fetchSessions = async (userId) => {
  try {
    console.log('Fetching sessions for user:', userId);
    sessions.value = await sessionsService.fetchSessions(userId);
    if (sessions.value.length > 0) {
      selectedSession.value = sessions.value[0];
      fetchGroups();
      connectSessionStatus(selectedSession.value.id);
    }
  } catch (error) {
    console.error('Error fetching sessions:', error);
  }
};

const fetchGroups = async () => {
  if (!selectedSession.value) return;
  try {
    console.log('Fetching groups for session:', selectedSession.value.id);
    const session = await sessionsService.getSessionDetails(selectedSession.value.id);
    selectedSession.value.groups = session.groups;
    session.groups.forEach(group => {
      connectGroup(group.id);
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
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
    selectedGroup.value = null;
    if (selectedSession.value) {
      fetchGroups();
    }
  } catch (error) {
    console.error('Error deleting session:', error);
  }
};

const handleStatusSession = async (action) => {
  if (!selectedSession.value) return;
  try {
    if (action === 'start') {
      await sessionsService.startSession(selectedSession.value.id);
      selectedSession.value.status = 'active';
      console.log(`Session ${selectedSession.value.id} started`);
      selectedSession.value.groups.forEach(group => {
        connectGroup(group.id);
      });
      sendMessage(selectedSession.value.id, { event: 'session_status_changed', status: 'active' });
    } else if (action === 'paused') {
      await sessionsService.stopSession(selectedSession.value.id);
      selectedSession.value.status = 'paused';
      console.log(`Session ${selectedSession.value.id} paused`);
      selectedSession.value.groups.forEach(group => {
        disconnectGroup(group.id);
      });
      sendMessage(selectedSession.value.id, { event: 'session_status_changed', status: 'paused' });
    }
  } catch (error) {
    console.error(`Error ${action}ing session:`, error);
  }
};

const selectGroup = (group) => {
  selectedGroup.value = group;
};

const updateGroupMembers = (data) => {
  console.log('Update group members event received:', data);
  if (!selectedSession.value || !selectedSession.value.groups) return;

  const groupIndex = selectedSession.value.groups.findIndex(g => g.id === data.group_id);
  if (groupIndex !== -1) {
    const group = selectedSession.value.groups[groupIndex];
    const userIndex = group.users.findIndex(user => user.id === data.user);

    if (data.event === 'user_joined_group') {
      if (userIndex === -1) { 
        group.users.push({ id: data.user, username: data.username });
      } else {
        group.users[userIndex] = { ...group.users[userIndex], ...data };
      }
    } else if (data.event === 'user_left_group' && userIndex !== -1) {
      group.users.splice(userIndex, 1); 
    }
    selectedSession.value.groups = [...selectedSession.value.groups];
  }
};

const updateSessionStatus = (data) => {
  console.log('Update session status event received:', data);
  if (selectedSession.value && selectedSession.value.id === data.session_id) {
    selectedSession.value.status = data.status;
  }
};

const handleSessionDeleted = (data) => {
  console.log('Session deleted event received:', data);
  if (selectedSession.value && selectedSession.value.id === data.session_id) {
    selectedSession.value = null;
    sessions.value = sessions.value.filter(session => session.id !== data.session_id);
  }
};

watch(selectedSession, (newSession, oldSession) => {
  if (oldSession) {
    oldSession.groups.forEach(group => {
      console.log('Disconnecting WebSocket for group:', group.id);
      disconnectGroup(group.id);
    });
    console.log('Disconnecting WebSocket for session:', oldSession.id);
    disconnectSession(oldSession.id);
  }
  if (newSession) {
    newSession.groups.forEach(group => {
      console.log('Connecting WebSocket for group:', group.id);
      connectGroup(group.id);
    });
    console.log('Connecting WebSocket for session:', newSession.id);
    connectSessionStatus(newSession.id);
  }
}, { immediate: true });


onMounted(async () => {
  console.log('Component mounted');
  const user = await usersService.getCurrentUser();
  if (user && user.id) {
    fetchSessions(user.id);
    EventBus.on('user_joined_group', updateGroupMembers);
    EventBus.on('user_left_group', updateGroupMembers);
    EventBus.on('session_status_changed', updateSessionStatus);
    EventBus.on('session_deleted', handleSessionDeleted);
  } else {
    console.error('User not found');
  }
});

onUnmounted(() => {
  console.log('Component unmounted');
  EventBus.off('user_joined_group', updateGroupMembers);
  EventBus.off('user_left_group', updateGroupMembers);
  EventBus.off('session_status_changed', updateSessionStatus);
  EventBus.off('session_deleted', handleSessionDeleted);
});
</script>



