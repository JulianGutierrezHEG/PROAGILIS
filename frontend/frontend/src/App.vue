<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onBeforeMount, onMounted, onUnmounted } from 'vue';
import { initializeAuth, watchAuthentication, getAccessAndUpdate } from '@/services/authService';

onBeforeMount(initializeAuth);

onMounted(() => {
  watchAuthentication();
  getAccessAndUpdate(); 
});

</script>