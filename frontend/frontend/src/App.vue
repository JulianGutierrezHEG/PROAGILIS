<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthService } from './services/authService';

const authService = useAuthService();

onMounted(() => {
  authService.checkAuthStatus();
});
</script>
