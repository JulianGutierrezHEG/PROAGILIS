<template>
    <div>
      <h3 class="font-bold text-xl text-center mb-4">Réponse pour la phase {{ localCurrentPhaseName }}</h3>
      <div class="flex justify-center">
        <div class="w-full max-w-2xl">
          <div class="mb-4">
            <h4 class="font-bold text-lg mb-2">Commentaires du Client</h4>
            <div class="bg-white p-4 rounded-lg shadow-md">
              <p class="text-sm text-gray-600">{{ localPhaseAnswer.clientComments || 'Pas de commentaires du client' }}</p>
            </div>
          </div>
          <div class="mb-4">
            <h4 class="font-bold text-lg mb-2">Réponse du groupe</h4>
            <div class="bg-white p-4 rounded-lg shadow-md">
              <p class="text-sm text-gray-600">{{ localPhaseAnswer.studentResponse || 'Pas de réponse de l\'étudiant' }}</p>
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
  const localPhaseAnswer = ref({ clientComments: '', studentResponse: '' });
  const { fetchGroupPhaseAnswer } = useGame(groupId.value);
  provide('phaseAnswer', localPhaseAnswer);
  
  const fetchPhaseData = async () => {
    try {
      const answerData = await fetchGroupPhaseAnswer(groupId.value, phaseId.value);
      if (answerData) {
        localCurrentPhaseName.value = answerData.phase_name;
        localPhaseAnswer.value = answerData.answer || { clientComments: '', studentResponse: '' };
      }
    } catch (error) {
      console.error('Error fetching phase data:', error);
    }
  };
  
  const handlePhaseAnswerUpdate = (data) => {
    if (data.group_id === groupId.value && data.phase_id === phaseId.value) {
      localPhaseAnswer.value = data.answer || { clientComments: '', studentResponse: '' };
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