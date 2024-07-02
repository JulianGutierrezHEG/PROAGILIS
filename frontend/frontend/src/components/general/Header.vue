<template>
  <header class="bg-gray-800 text-white p-4 text-center flex justify-between items-center">
    <button v-if="isAuthenticated" @click="goToHome" class="bg-white rounded-full p-2 hover:bg-gray-600 flex items-center justify-center">
      <img src="https://cdn-icons-png.flaticon.com/512/8832/8832584.png" alt="Acceuil" class="w-8 h-8">
    </button>
    <h1 class="text-2xl font-bold" :class="{ 'mx-auto': !isAuthenticated, 'ml-4': isAuthenticated }">PROAGILIS</h1>
    <button v-if="isAuthenticated" @click="handleLogout" class="bg-red-400 rounded-full p-2 hover:bg-red-600 flex items-center justify-center">
      <img src="https://cdn-icons-png.flaticon.com/512/10067/10067281.png" alt="Acceuil" class="w-8 h-8">
    </button>
  </header>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { logout } from '@/services/authService'; 

const authStore = useAuthStore();
const router = useRouter();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const handleLogout = () => {
  logout(authStore, router);
};

const goToHome = () => {
  router.push('/');
};
</script>


  
  
  