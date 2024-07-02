<template>
    <div class="w-4/5 max-h-screen overflow-hidden bg-gray-200 shadow-lg rounded-lg p-2 mx-auto my-8">
      <h1 class="text-6xl font-bold text-center">Début du jeu</h1>
      <p class="text-center mt-8" v-if="userInfo">
        Bonjour {{ userInfo.username }}, tu fais partie du groupe {{ userInfo.groupname }} de la session {{ userInfo.sessionname }}. En attente du début du jeu par l'enseignant(e)
      </p>
      <div class="text-center mt-8">
        <button @click="leaveSession" class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
          Quitter la session
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import userService from '@/services/usersService';
  import sessionsService from '@/services/sessionsService';
  import { useAuthStore } from '@/stores/authStore';
  
  const userInfo = ref(null);
  const authStore = useAuthStore();
  const router = useRouter();
  
  const fetchUserSessionInfo = async () => {
    try {
      const user = await userService.getCurrentUser();
      console.log('Fetched user:', user);
      const info = await sessionsService.getUserSessionInfo(user.id);
      console.log('Fetched user session info:', info);
      userInfo.value = info;
    } catch (error) {
      console.error('Error fetching user session info:', error);
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
  
  onMounted(() => {
    fetchUserSessionInfo();
  });
  </script>
  