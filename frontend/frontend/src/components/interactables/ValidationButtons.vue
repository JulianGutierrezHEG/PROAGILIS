<template>
  <div class="flex justify-center space-x-4 mt-4">
    <button @click="handleValidation(true)" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
      Réponse correcte
    </button>
    <button @click="handleValidation(false)" class="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
      Réponse incorrecte
    </button>
  </div>
</template>

<script setup>
import { inject } from 'vue';
import EventBus from '@/services/eventBus';  
import websocketService from '@/services/websocketService';
import { useGame } from '@/composables/useGame';

const phaseId = inject('phaseId');
const groupId = inject('groupId');
const phaseAnswer = inject('phaseAnswer');
const { validatePhase } = useGame(groupId.value);

const handleValidation = async (isCorrect) => {
  const answerData = phaseAnswer.value;
  console.log('Validation:', answerData);
  await validatePhase(groupId.value, phaseId.value, isCorrect, answerData);
  websocketService.sendPhaseAnswerUpdate(groupId.value, phaseId.value, answerData);
  EventBus.emit('close-modal'); 
};
</script>
