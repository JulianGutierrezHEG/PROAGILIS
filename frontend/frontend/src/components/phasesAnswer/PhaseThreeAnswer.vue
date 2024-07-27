<template>
  <div>
    <h3 class="font-bold text-xl text-center mb-4">Réponse pour la phase {{ localCurrentPhaseName }}</h3>
    <div class="flex justify-center">
      <div class="max-w-2xl w-full">
        <div class="overflow-y-auto" style="max-height: 300px;">
          <div v-for="(story, index) in localPhaseAnswer.userStories" :key="index" class="mb-4">
            <UserStoryCard :story="story" />
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
import UserStoryCard from '@/components/interactables/UserStoryCard.vue';

const groupId = inject('groupId');
const phaseId = inject('phaseId');
const phaseNeedsValidation = inject('phaseNeedsValidation');

const localCurrentPhaseName = ref('');
const localPhaseAnswer = ref({ userStories: [] });
const { fetchGroupPhaseAnswer, fetchUserStories } = useGame(groupId.value);
provide('phaseAnswer', localPhaseAnswer);

const fetchPhaseData = async () => {
  try {
    const answerData = await fetchGroupPhaseAnswer(groupId.value, phaseId.value);
    if (answerData) {
      localCurrentPhaseName.value = answerData.phase_name;
      if (answerData.answer && answerData.answer.userStories) {
        const response = await fetchUserStories(groupId.value, answerData.answer.userStories);
        localPhaseAnswer.value.userStories = response;
      }
    }
  } catch (error) {
    console.error('Error fetching phase data:', error);
  }
};

const handlePhaseAnswerUpdate = async (data) => {
  if (data.group_id === groupId.value && data.phase_id === phaseId.value) {
    if (data.answer && data.answer.userStories) {
      const response = await fetchUserStories(groupId.value, data.answer.userStories);
      localPhaseAnswer.value.userStories = response;
    } else {
      localPhaseAnswer.value.userStories = [];
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
