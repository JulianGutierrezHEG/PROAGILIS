<template>
  <div v-if="isVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div class="bg-white shadow-md rounded-lg p-6 w-full max-w-lg relative">
      <button @click="closeModal" class="absolute top-2 right-2 text-gray-600 hover:text-gray-900">&times;</button>
      <component :is="activeModalComponent" />
    </div>
  </div>
</template>

<script setup>
import { shallowRef, ref, onUnmounted } from 'vue';
import EventBus from '@/services/eventBus';
import JoinSessionModalContent from '@/components/modals/JoinSessionModalContent.vue';
import CreateSessionModalContent from '@/components/modals/CreateSessionModalContent.vue';
import PhaseOneAnswer from '@/components/phasesAnswer/PhaseOneAnswer.vue';
import PhaseTwoAnswer from '@/components/phasesAnswer/PhaseTwoAnswer.vue';
import PhaseThreeAnswer from '@/components/phasesAnswer/PhaseThreeAnswer.vue';
import PhaseFourAnswer from '@/components/phasesAnswer/PhaseFourAnswer.vue';

const isVisible = ref(false);
const activeModalComponent = shallowRef(null);

const modalComponents = {
  joinSession: JoinSessionModalContent,
  createSession: CreateSessionModalContent,
  Phase1Answer: PhaseOneAnswer,
  Phase2Answer: PhaseTwoAnswer,
  Phase3Answer: PhaseThreeAnswer,
  Phase4Answer: PhaseFourAnswer
};

const openModalHandler = (event) => {
  const modalType = event.modalType;
  if (modalComponents[modalType]) {
    activeModalComponent.value = modalComponents[modalType];
    isVisible.value = true;
  }
};

const closeModalHandler = () => {
  isVisible.value = false;
  activeModalComponent.value = null;
};

EventBus.on('open-modal', openModalHandler);
EventBus.on('close-modal', closeModalHandler);

const closeModal = () => {
  EventBus.emit('close-modal');
};

onUnmounted(() => {
  EventBus.off('open-modal', openModalHandler);
  EventBus.off('close-modal', closeModalHandler);
});
</script>
