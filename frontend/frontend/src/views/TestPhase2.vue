<template>
    <div>
      <h1>Test Phase 2</h1>
      <p>Current Phase: {{ currentPhase }}</p>
      <!-- Add test phase 2 content here -->
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import userService from '@/services/usersService';
  import sessionsService from '@/services/sessionsService';
  
  const route = useRoute();
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
  
  onMounted(() => {
    fetchCurrentPhase();
  });
  </script>
  