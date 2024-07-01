<template>
  <header class="bg-gray-800 text-white p-4 text-center flex justify-between items-center">
    <h1 @click="goToHome" class="text-2xl font-bold cursor-pointer">PROAGILIS</h1>
    <button v-if="isAuthenticated" @click="handleLogout" class="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
      Se déconnecter
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


  
  
  