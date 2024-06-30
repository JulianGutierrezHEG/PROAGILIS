<template>
    <div class="flex justify-center items-center w-full">
      <button v-if="role === 'etudiant'" @click="openJoinModal" class="relative bg-white shadow-md rounded-lg p-6 w-64 h-64 flex items-center justify-center flex-col hover:bg-gray-100">
        <img src="https://cdn-icons-png.flaticon.com/512/271/271228.png" alt="Rejoindre un projet" class="w-12 h-12 mb-4">
        <span class="text-lg font-semibold">Rejoindre une session</span>
        <hr class="absolute bottom-0 w-full border-gray-300">
      </button>
      <button v-if="role === 'enseignant'" @click="openCreateModal" class="relative bg-white shadow-md rounded-lg p-6 w-64 h-64 flex items-center justify-center flex-col hover:bg-gray-100">
        <img src="https://cdn-icons-png.flaticon.com/512/992/992700.png" alt="Nouveau projet" class="w-12 h-12 mb-4">
        <span class="text-lg font-semibold">Nouvelle session</span>
        <hr class="absolute bottom-0 w-full border-gray-300">
      </button>
    </div>
    <Modal />
  </template>
  
  <script setup>
  import Modal from '@/components/modals/Modal.vue';
  import { computed } from 'vue';
  import { useAuthStore } from '@/stores/authStore';
  import EventBus from '@/services/eventBus';
  
  const authStore = useAuthStore();
  const role = computed(() => authStore.role);
  
  const openJoinModal = () => {
    EventBus.emit('open-modal', { modalType: 'joinSession' });
  };
  
  const openCreateModal = () => {
    EventBus.emit('open-modal', { modalType: 'createSession' });
  };
  </script>
  