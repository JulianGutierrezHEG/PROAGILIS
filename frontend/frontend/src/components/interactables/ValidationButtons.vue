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
  import gamesService from '@/services/gamesService';
  import websocketService from '@/services/websocketService';
  import { useGame } from '@/composables/useGame';
  
  const phaseId = inject('phaseId');
  const groupId = inject('groupId');
  const phaseAnswer = inject('phaseAnswer');
  const { validatePhase } = useGame(groupId.value);
  
  const handleValidation = async (isCorrect) => {
    const answerData = phaseAnswer.value;
    await validatePhase(groupId.value, phaseId.value, isCorrect, answerData);
  
    if (isCorrect) {
      try {
        const nextPhaseId = phaseId.value + 1;
        await gamesService.updatePhaseStatus(groupId.value, nextPhaseId, 'in_progress');
        websocketService.sendPhaseStatusUpdate(groupId.value, phaseId.value, 'completed');
        websocketService.sendPhaseStatusUpdate(groupId.value, nextPhaseId, 'in_progress');
      } catch (error) {
        console.error('Erreur lors de la validation ou passage à la phase suivante:', error);
      }
    }
    websocketService.sendPhaseAnswerUpdate(groupId.value, phaseId.value, answerData);
  };
  </script>
  