<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const checkAuthStatus = () => {
  const token = localStorage.getItem('jwt');
  const userRole = localStorage.getItem('userRole');

  if (!token || !userRole) {
    authStore.logout();
    router.push('/signin');
  } else {
    authStore.fetchUserRole();
  }
};

onMounted(() => {
  checkAuthStatus();
});
</script>
