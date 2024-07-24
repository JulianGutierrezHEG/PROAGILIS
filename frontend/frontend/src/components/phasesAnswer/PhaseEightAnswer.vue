<template>
    <div>
      <h3 class="font-bold text-xl text-center mb-4">Réponse pour la phase {{ localCurrentPhaseName }}</h3>
      <div class="flex justify-center">
        <div class="w-full max-w-4xl">
          <div class="mb-6">
            <h4 class="font-bold text-lg mb-2">Ce qui a bien fonctionné</h4>
            <div class="bg-white p-4 rounded-lg shadow-md">
              <p class="text-sm text-gray-600">{{ localPhaseAnswer.wentWell }}</p>
            </div>
          </div>
          <div class="mb-6">
            <h4 class="font-bold text-lg mb-2">Ce qui pourrait être amélioré</h4>
            <div class="bg-white p-4 rounded-lg shadow-md">
              <p class="text-sm text-gray-600">{{ localPhaseAnswer.couldBeImproved }}</p>
            </div>
          </div>
          <div class="mb-6">
            <h4 class="font-bold text-lg mb-2">Actions à entreprendre</h4>
            <div class="bg-white p-4 rounded-lg shadow-md">
              <p class="text-sm text-gray-600">{{ localPhaseAnswer.actionItems }}</p>
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
  const localPhaseAnswer = ref({ wentWell: '', couldBeImproved: '', actionItems: '' });
  const { fetchGroupPhaseAnswer } = useGame(groupId.value);
  provide('phaseAnswer', localPhaseAnswer);
  
  const fetchPhaseData = async () => {
    try {
      const answerData = await fetchGroupPhaseAnswer(groupId.value, phaseId.value);
      if (answerData) {
        localCurrentPhaseName.value = answerData.phase_name;
        localPhaseAnswer.value = answerData.answer || { wentWell: '', couldBeImproved: '', actionItems: '' };
      }
    } catch (error) {
      console.error('Error fetching phase data:', error);
    }
  };
  
  const handlePhaseAnswerUpdate = (data) => {
    if (data.group_id === groupId.value && data.phase_id === phaseId.value) {
      localPhaseAnswer.value = data.answer || { wentWell: '', couldBeImproved: '', actionItems: '' };
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
  