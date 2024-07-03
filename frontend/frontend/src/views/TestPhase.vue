<template>
  <div>
    <h1>Test Phase</h1>
    <p>Current Phase: {{ currentPhase }}</p>
    <button @click="moveToNextPhase" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Next Phase</button>
    <!-- Add test phase content here -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import userService from '@/services/usersService';
import sessionsService from '@/services/sessionsService';
import gameService from '@/services/gamesService';

const route = useRoute();
const router = useRouter();
const currentPhase = ref('');
const userInfo = ref(null);

const fetchCurrentPhase = async () => {
  try {
    const user = await userService.getCurrentUser();
    userInfo.value = user;
    const session = await sessionsService.getSessionDetails(route.params.sessionId);
    if (session.groups && session.groups.length > 0) {
      const group = session.groups.find(group => group.users.some(user => user.id === userInfo.value.id));
      if (group) {
        currentPhase.value = group.current_phase || 'No current phase';
      }
    }
  } catch (error) {
    console.error('Error fetching current phase:', error);
  }
};

const moveToNextPhase = async () => {
  try {
    const user = await userService.getCurrentUser();
    const session = await sessionsService.getSessionDetails(route.params.sessionId);
    const group = session.groups.find(group => group.users.some(user => user.id === user.id));
    if (group) {
      await gameService.updateGroupPhase(group.id, 'Test Phase 2');
      currentPhase.value = 'Test Phase 2';
      router.push({ name: 'TestPhase2', params: { sessionId: route.params.sessionId } });
    }
  } catch (error) {
    console.error('Error moving to next phase:', error);
  }
};

onMounted(() => {
  fetchCurrentPhase();
});
</script>
