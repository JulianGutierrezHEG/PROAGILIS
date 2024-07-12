<template>
  <div class="p-4 overflow-auto">
    <div v-if="waiting">
      <WaitingScreen />
    </div>
    <div v-else>
      <h2 v-if="!isLoadingPhaseDetails" class="text-3xl font-bold mb-6 text-center">{{ currentPhaseDetails.name }}</h2>
      <p v-if="!isLoadingPhaseDetails" class="mb-6 text-center">
        {{ currentPhaseDetails.description }}
      </p>
      <form @submit.prevent="submitForm" class="max-w-lg mx-auto">
        <div class="mb-6">
          <label for="specific" class="block text-gray-700 text-lg">Spécifique</label>
          <textarea id="specific" v-model="smartObjectives.specific" class="mt-1 block w-full p-2 border rounded-md" rows="3" required></textarea>
        </div>
        <div class="mb-6">
          <label for="measurable" class="block text-gray-700 text-lg">Mesurable</label>
          <textarea id="measurable" v-model="smartObjectives.measurable" class="mt-1 block w-full p-2 border rounded-md" rows="3" required></textarea>
        </div>
        <div class="mb-6">
          <label for="achievable" class="block text-gray-700 text-lg">Atteignable</label>
          <textarea id="achievable" v-model="smartObjectives.achievable" class="mt-1 block w-full p-2 border rounded-md" rows="3" required></textarea>
        </div>
        <div class="mb-6">
          <label for="relevant" class="block text-gray-700 text-lg">Pertinent</label>
          <textarea id="relevant" v-model="smartObjectives.relevant" class="mt-1 block w-full p-2 border rounded-md" rows="3" required></textarea>
        </div>
        <div class="mb-6">
          <label for="timeBound" class="block text-gray-700 text-lg">Délimité dans le temps</label>
          <textarea id="timeBound" v-model="smartObjectives.timeBound" class="mt-1 block w-full p-2 border rounded-md" rows="3" required></textarea>
        </div>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Soumettre
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref,onMounted } from 'vue';
import { useGame } from '@/composables/useGame';
import WaitingScreen from '@/views/WaitingScreen.vue';

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
});

const { 
  currentPhaseDetails, 
  isLoadingPhaseDetails, 
  waiting, 
  fetchCurrentPhase 
} = useGame(props.group.id);

const smartObjectives = ref({
  specific: '',
  measurable: '',
  achievable: '',
  relevant: '',
  timeBound: ''
});

const submitForm = () => {
  // Logic to handle form submission
  console.log('SMART Objectives:', smartObjectives.value);
};

onMounted(async () => {
  await fetchCurrentPhase();
});
</script>
