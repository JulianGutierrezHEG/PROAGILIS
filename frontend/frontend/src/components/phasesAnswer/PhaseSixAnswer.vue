<template>
  <div>
    <h3 class="font-bold text-xl text-center mb-4">Réponse pour la phase {{ localCurrentPhaseName }}</h3>
    <div class="flex justify-center">
      <div class="w-full max-w-4xl">
        <div>
          <h4 class="font-bold text-lg mb-2">Événements Répondus</h4>
          <div class="overflow-y-auto max-h-96 bg-gray-100 p-4 rounded-lg">
            <table class="w-full table-auto">
              <thead>
                <tr>
                  <th class="px-4 py-2">Événement</th>
                  <th class="px-4 py-2">Réponse</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="localPhaseAnswer.answeredEvents.length === 0">
                  <td colspan="2" class="text-gray-500 text-center">Aucun événement n'a été répondu pour cette phase.</td>
                </tr>
                <tr v-for="(event, index) in localPhaseAnswer.answeredEvents" :key="index">
                  <td class="border px-4 py-2">{{ event.description }}</td>
                  <td class="border px-4 py-2">{{ event.answer }}</td>
                </tr>
              </tbody>
            </table>
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
const localPhaseAnswer = ref({ answeredEvents: [] });
const { fetchGroupPhaseAnswer, fetchEvents } = useGame(groupId.value);
provide('phaseAnswer', localPhaseAnswer);

const handlePhaseAnswerUpdate = async (data) => {
  console.debug('Received phase answer update:', data);
  if (data.group_id === groupId.value && data.phase_id === phaseId.value) {
    const { answeredEvents } = data.answer || {};
    if (answeredEvents) {
      console.debug('Fetching events for answered events:', answeredEvents);
      const events = await fetchEvents(groupId.value, answeredEvents);
      if (events && events.length) {
        localPhaseAnswer.value.answeredEvents = events;
        console.debug('Updated answered events:', localPhaseAnswer.value.answeredEvents);
      }
    }
  }
};

const fetchPhaseData = async () => {
  try {
    const answerData = await fetchGroupPhaseAnswer(groupId.value, phaseId.value);
    if (answerData) {
      localCurrentPhaseName.value = answerData.phase_name;
      const { answeredEvents } = answerData.answer || {};
      if (answeredEvents) {
        localPhaseAnswer.value.answeredEvents = await fetchEvents(groupId.value, answeredEvents);
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
