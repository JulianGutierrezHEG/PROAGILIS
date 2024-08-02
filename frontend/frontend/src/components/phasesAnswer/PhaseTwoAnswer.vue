<template>
  <div class="p-4">
    <h3 class="font-bold text-xl text-center mb-4">Réponse pour la phase {{ localCurrentPhaseName }}</h3>
    <div class="overflow-y-auto max-h-screen p-4">
      <div class="flex justify-center">
        <div class="w-full max-w-2xl">
          <div class="mb-4">
            <h4 class="font-bold text-lg mb-2">Spécifique</h4>
            <div class="bg-white p-4 rounded-lg shadow-md">
              <p class="text-sm text-gray-600">{{ localPhaseAnswer.specific || 'Pas de réponse' }}</p>
            </div>
          </div>
          <div class="mb-4">
            <h4 class="font-bold text-lg mb-2">Mesurable</h4>
            <div class="bg-white p-4 rounded-lg shadow-md">
              <p class="text-sm text-gray-600">{{ localPhaseAnswer.measurable || 'Pas de réponse' }}</p>
            </div>
          </div>
          <div class="mb-4">
            <h4 class="font-bold text-lg mb-2">Atteignable</h4>
            <div class="bg-white p-4 rounded-lg shadow-md">
              <p class="text-sm text-gray-600">{{ localPhaseAnswer.achievable || 'Pas de réponse' }}</p>
            </div>
          </div>
          <div class="mb-4">
            <h4 class="font-bold text-lg mb-2">Pertinent</h4>
            <div class="bg-white p-4 rounded-lg shadow-md">
              <p class="text-sm text-gray-600">{{ localPhaseAnswer.relevant || 'Pas de réponse' }}</p>
            </div>
          </div>
          <div class="mb-4">
            <h4 class="font-bold text-lg mb-2">Délimité dans le temps</h4>
            <div class="bg-white p-4 rounded-lg shadow-md">
              <p class="text-sm text-gray-600">{{ localPhaseAnswer.timeBound || 'Pas de réponse' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="phaseNeedsValidation" class="flex justify-center mt-4">
      <ValidationButtons />
    </div>
  </div>
</template>

<script setup>
import { ref, inject, onMounted, provide, onUnmounted } from 'vue';
import ValidationButtons from '@/components/interactables/ValidationButtons.vue';
import { useGame } from '@/composables/useGame';
import EventBus from '@/services/eventBus';

const groupId = inject('groupId');
const phaseId = inject('phaseId');
const phaseNeedsValidation = inject('phaseNeedsValidation');

const localCurrentPhaseName = ref('');
const localPhaseAnswer = ref({ specific: '', measurable: '', achievable: '', relevant: '', timeBound: '' });
const { fetchGroupPhaseAnswer } = useGame(groupId.value);
provide('phaseAnswer', localPhaseAnswer);

const fetchPhaseData = async () => {
  try {
    const answerData = await fetchGroupPhaseAnswer(groupId.value, phaseId.value);
    if (answerData) {
      localCurrentPhaseName.value = answerData.phase_name;
      localPhaseAnswer.value = answerData.answer || { specific: '', measurable: '', achievable: '', relevant: '', timeBound: '' };
    }
  } catch (error) {
    console.error('Error fetching phase data:', error);
  }
};

const handlePhaseAnswerUpdate = (data) => {
  if (data.group_id === groupId.value && data.phase_id === phaseId.value) {
    localPhaseAnswer.value = data.answer || { specific: '', measurable: '', achievable: '', relevant: '', timeBound: '' };
  }
};

onMounted(() => {
  fetchPhaseData();
  EventBus.on('phase_answer_update', handlePhaseAnswerUpdate);
});

onUnmounted(() => {
  EventBus.off('phase_answer_update', handlePhaseAnswerUpdate);
});
</script>

<style scoped>
.overflow-y-auto {
  max-height: 50vh;
  overflow-y: auto;
}
</style>
