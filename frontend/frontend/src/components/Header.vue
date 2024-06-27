<template>
  <header class="bg-gray-800 text-white p-4 text-center flex justify-between items-center">
    <h1 class="text-2xl font-bold">PROAGILIS</h1>
    <button v-if="isAuthenticated" @click="logout" class="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
      Se déconnecter
    </button>
  </header>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

onMounted(() => {
  authStore.checkAuth();
});

const isAuthenticated = computed(() => authStore.isAuthenticated);

const logout = async () => {
  const success = await authStore.logout();
  if (success) {
    await router.push('/signin');
  }
};
</script>

  
  
  