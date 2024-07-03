<template>
  <div class="w-4/5 max-h-screen overflow-hidden bg-gray-200 shadow-lg rounded-lg p-2 mx-auto my-8">
    <ToastComponent v-if="toastMessage" :message="toastMessage" />
    <div class="flex justify-between items-center">
      <div>
        <p v-if="userInfo">
          {{ userInfo.username }} ({{ userInfo.groupname }})
        </p>
      </div>
      <div>
        <p>
          Status: 
          <span v-if="sessionStatus === 'not_started'">En attente du début du jeu par l'enseignant(e)</span>
          <span v-if="sessionStatus === 'active'">La session est en cours</span>
          <span v-if="sessionStatus === 'paused'">La session est en pause</span>
        </p>
      </div>
      <div>
        <button @click="leaveSession" class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
          Quitter la session
        </button>
      </div>
    </div>
    <hr class="my-4 border-black" />
    <div>
      <TestPhase v-if="sessionStatus === 'active'" />
      <WaitingScreen v-else />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import userService from '@/services/usersService';
import sessionsService from '@/services/sessionsService';
import ToastComponent from '@/components/toasts/Toast.vue';
import TestPhase from '@/views/TestPhase.vue';
import WaitingScreen from '@/views/WaitingScreen.vue';

const userInfo = ref(null);
const sessionStatus = ref('not_started');
const toastMessage = ref('');
const currentPhase = ref('');
const router = useRouter();

const fetchUserSessionInfo = async () => {
  try {
    const user = await userService.getCurrentUser();
    console.log('Fetched user:', user);
    userInfo.value = user;
    const info = await sessionsService.getUserSessionInfo(user.id);
    console.log('Fetched user session info:', info);
    userInfo.value = { ...userInfo.value, ...info };
    if (info && info.session_id) {
      fetchSessionStatus(info.session_id);
      setInterval(() => fetchSessionStatus(info.session_id), 5000); // Polling every 5 seconds
    }
  } catch (error) {
    console.error('Error fetching user session info:', error);
  }
};

const fetchSessionStatus = async (sessionId) => {
  try {
    const session = await sessionsService.getSessionDetails(sessionId);
    sessionStatus.value = session.status;
    if (session.groups && session.groups.length > 0) {
      const group = session.groups.find(group => group.users.some(user => user.id === userInfo.value.id));
      if (group) {
        currentPhase.value = group.current_phase || 'No current phase';
        console.log(`Current phase for group ${group.name}: ${group.current_phase}`);
      }
    }
  } catch (error) {
    console.error('Error fetching session status:', error);
  }
};

const leaveSession = async () => {
  try {
    if (userInfo.value && userInfo.value.session_id) {
      console.log('Leaving session with:', {
        session_id: userInfo.value.session_id,
        user_id: userInfo.value.user_id
      });
      await sessionsService.leaveSession(userInfo.value.session_id, userInfo.value.user_id);
      router.push('/');
    }
  } catch (error) {
    console.error('Error leaving session:', error);
  }
};

watch(sessionStatus, (newStatus) => {
  // Handle any other necessary side effects when session status changes
});

onMounted(() => {
  fetchUserSessionInfo();
});
</script>
