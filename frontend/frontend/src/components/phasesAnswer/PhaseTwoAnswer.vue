<template>
  <div>
    <h3 class="font-bold text-xl text-center mb-4">Réponse pour la phase {{ localCurrentPhaseName }}</h3>
    <div class="flex justify-center">
      <table class="table-auto border-collapse border border-gray-300 w-full max-w-2xl">
        <thead>
          <tr>
            <th class="border bg-slate-400 border-gray-300 px-4 py-2 text-center">S</th>
            <th class="border bg-slate-400 border-gray-300 px-4 py-2 text-center">M</th>
            <th class="border bg-slate-400 border-gray-300 px-4 py-2 text-center">A</th>
            <th class="border bg-slate-400 border-gray-300 px-4 py-2 text-center">R</th>
            <th class="border bg-slate-400 border-gray-300 px-4 py-2 text-center">T</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 px-4 py-2 text-center">{{ localPhaseAnswer.specific }}</td>
            <td class="border border-gray-300 px-4 py-2 text-center">{{ localPhaseAnswer.measurable }}</td>
            <td class="border border-gray-300 px-4 py-2 text-center">{{ localPhaseAnswer.achievable }}</td>
            <td class="border border-gray-300 px-4 py-2 text-center">{{ localPhaseAnswer.relevant }}</td>
            <td class="border border-gray-300 px-4 py-2 text-center">{{ localPhaseAnswer.timeBound }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="phaseNeedsValidation">
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
