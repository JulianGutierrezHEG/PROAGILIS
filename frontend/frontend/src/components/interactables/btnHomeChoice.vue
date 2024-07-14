<template>
  <div class="flex justify-center items-center w-full">
    <button 
      v-if="role === 'etudiant' && !joinedSession" 
      @click="openJoinModal" 
      class="relative bg-white shadow-md rounded-lg p-6 w-64 h-64 flex items-center justify-center flex-col hover:bg-gray-100"
    >
      <img src="https://cdn-icons-png.flaticon.com/512/271/271228.png" alt="Rejoindre un projet" class="w-12 h-12 mb-4">
      <span class="text-lg font-semibold">Rejoindre une session</span>
      <hr class="absolute bottom-0 w-full border-gray-300">
    </button>
    <button 
      v-if="role === 'etudiant' && joinedSession" 
      @click="goToGameSession" 
      class="relative bg-white shadow-md rounded-lg p-6 w-64 h-64 flex items-center justify-center flex-col hover:bg-gray-100"
    >
      <img src="https://cdn-icons-png.flaticon.com/512/271/271228.png" alt="Rejoindre la session" class="w-12 h-12 mb-4">
      <span class="text-lg font-semibold">Rejoindre la session</span>
      <hr class="absolute bottom-0 w-full border-gray-300">
    </button>
    <button 
      v-if="role === 'enseignant'" 
      @click="openCreateModal" 
      class="relative bg-white shadow-md rounded-lg p-6 w-64 h-64 flex items-center justify-center flex-col hover:bg-gray-100"
    >
      <img src="https://cdn-icons-png.flaticon.com/512/992/992700.png" alt="Nouvelle session" class="w-12 h-12 mb-4">
      <span class="text-lg font-semibold">Nouvelle session</span>
      <hr class="absolute bottom-0 w-full border-gray-300">
    </button>
    <button 
      v-if="role === 'enseignant'" 
      @click="goToDashboard" 
      class="ml-10 relative bg-white shadow-md rounded-lg p-6 w-64 h-64 flex items-center justify-center flex-col hover:bg-gray-100"
    >
      <img src="https://cdn-icons-png.flaticon.com/512/9828/9828648.png" alt="Accéder au tableau de bord" class="w-12 h-12 mb-4">
      <span class="text-lg font-semibold">Tableau de bord</span>
      <hr class="absolute bottom-0 w-full border-gray-300">
    </button>
  </div>
  <Modal />
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useSession } from '@/composables/useSession';
import EventBus from '@/services/eventBus';
import Modal from '@/components/modals/Modal.vue';

const authStore = useAuthStore();
const role = computed(() => authStore.role);
const router = useRouter();
const { joinedSession, fetchJoinedSession } = useSession();

const openJoinModal = () => {
  EventBus.emit('open-modal', { modalType: 'joinSession' });
};

const openCreateModal = () => {
  EventBus.emit('open-modal', { modalType: 'createSession' });
};

const goToDashboard = () => {
  router.push('/dashboard');
};

const goToGameSession = () => {
  if (joinedSession.value) {
    router.push(`/game/${joinedSession.value.id}`);
  }
};

onMounted(() => {
  if (role.value === 'etudiant') {
    fetchJoinedSession();
  }
});
</script>
