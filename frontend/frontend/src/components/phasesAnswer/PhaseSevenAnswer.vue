<template>
  <div>
    <h3 class="font-bold text-xl text-center mb-4">Réponse pour la phase {{ localCurrentPhaseName }}</h3>
    <div class="flex justify-center">
      <div class="w-full max-w-2xl">
        <div class="mb-4">
          <h4 class="font-bold text-lg mb-2">Commentaires du Client</h4>
          <div class="bg-white p-4 rounded-lg shadow-md">
            <p class="text-sm text-gray-600">{{ localPhaseAnswer.clientComment?.description || 'Pas de commentaires du client' }}</p>
          </div>
        </div>
        <div class="mb-4">
          <h4 class="font-bold text-lg mb-2">Réponse du groupe</h4>
          <div class="bg-white p-4 rounded-lg shadow-md">
            <p class="text-sm text-gray-600">{{ localPhaseAnswer.clientComment?.answer || 'Pas de réponse' }}</p>
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
const localPhaseAnswer = ref({ clientComment: null });
const { fetchGroupPhaseAnswer, fetchEvents } = useGame(groupId.value);
provide('phaseAnswer', localPhaseAnswer);

const fetchPhaseData = async () => {
  try {
    const answerData = await fetchGroupPhaseAnswer(groupId.value, phaseId.value);
    if (answerData) {
      localCurrentPhaseName.value = answerData.phase_name;
      const { clientCommentId } = answerData.answer || {};
      if (clientCommentId) {
        const events = await fetchEvents(groupId.value, [clientCommentId]);
        if (events.length > 0) {
          localPhaseAnswer.value.clientComment = events[0];
        }
      }
    }
  } catch (error) {
    console.error('Error fetching phase data:', error);
  }
};

const handlePhaseAnswerUpdate = async (data) => {
  if (data.group_id === groupId.value && data.phase_id === phaseId.value) {
    const { clientCommentId } = data.answer || {};
    if (clientCommentId) {
      const events = await fetchEvents(groupId.value, [clientCommentId]);
      if (events.length > 0) {
        localPhaseAnswer.value.clientComment = events[0];
      }
    }
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