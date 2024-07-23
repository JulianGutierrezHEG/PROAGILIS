<template>
    <div>
      <h3 class="font-bold text-xl text-center mb-4">Réponse pour la phase {{ localCurrentPhaseName }}</h3>
      <div class="flex justify-center">
        <div class="w-full max-w-4xl">
          <div>
            <h4 class="font-bold text-lg mb-2">User Stories Complétées</h4>
            <div class="overflow-y-auto max-h-96">
              <div v-if="localPhaseAnswer.completedUserStories.length === 0" class="text-gray-500">
                Aucune User Story n'a été complétée pour ce sprint.
              </div>
              <div v-for="(story, index) in localPhaseAnswer.completedUserStories" :key="index" class="mb-4">
                <UserStoryCard :story="story" />
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
  import UserStoryCard from '@/components/interactables/UserStoryCard.vue';
  
  const groupId = inject('groupId');
  const phaseId = inject('phaseId');
  const phaseNeedsValidation = inject('phaseNeedsValidation');
  
  const localCurrentPhaseName = ref('');
  const localPhaseAnswer = ref({ completedUserStories: [] });
  const { fetchGroupPhaseAnswer, fetchUserStories } = useGame(groupId.value);
  provide('phaseAnswer', localPhaseAnswer);
  
  const handlePhaseAnswerUpdate = async (data) => {
    if (data.group_id === groupId.value && data.phase_id === phaseId.value) {
      const { completedUserStories } = data.answer || {};
      if (completedUserStories) {
        localPhaseAnswer.value.completedUserStories = await fetchUserStories(groupId.value, completedUserStories);
      }
    }
  };
  
  const fetchPhaseData = async () => {
    try {
      const answerData = await fetchGroupPhaseAnswer(groupId.value, phaseId.value);
      if (answerData) {
        localCurrentPhaseName.value = answerData.phase_name;
        const { completedUserStories } = answerData.answer || {};
        if (completedUserStories) {
          localPhaseAnswer.value.completedUserStories = await fetchUserStories(groupId.value, completedUserStories);
        }
      }
    } catch (error) {
      console.error('Error fetching phase data:', error);
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