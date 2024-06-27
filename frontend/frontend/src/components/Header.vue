<template>
    <header class="bg-gray-800 text-white p-4 text-center flex justify-between items-center">
      <h1 class="text-2xl font-bold">PROAGILIS</h1>
      <button v-if="isAuthenticated" @click="logout" class="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
        Logout
      </button>
    </header>
  </template>
  
  <script setup>
  import { useAuthStore } from '@/stores/auth';
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const authStore = useAuthStore();
  authStore.checkAuth();
  
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  
  console.log('Is Authenticated:', isAuthenticated.value);
  
  const logout = async () => {
    await fetch('http://localhost:8000/api/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    authStore.logout();
    console.log('Logged out, Is Authenticated:', isAuthenticated.value);
    await router.push('/signin');

  };
  </script>
  
  <style scoped>
  /* Add any additional styles if needed */
  </style>
  