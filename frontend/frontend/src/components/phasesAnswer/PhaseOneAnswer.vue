<template>
  <div>
    <h3 class="font-bold text-xl text-center mb-4">Réponse pour la phase {{ localCurrentPhaseName }}</h3>
    <div class="flex justify-center overflow-y-auto max-h-96">
      <table class="table-auto border-collapse border border-gray-300 w-full max-w-2xl">
        <thead>
          <tr>
            <th class="border bg-slate-400 border-gray-300 px-4 py-2 text-center">Nom du projet</th>
            <th class="border bg-slate-400 border-gray-300 px-4 py-2 text-center">Product Owner</th>
            <th class="border bg-slate-400 border-gray-300 px-4 py-2 text-center">Scrum Master</th>
            <th class="border bg-slate-400 border-gray-300 px-4 py-2 text-center">Développeurs</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-gray-300 px-4 py-2 text-center">{{ localPhaseAnswer.projectName }}</td>
            <td class="border border-gray-300 px-4 py-2 text-center">{{ localPhaseAnswer.roles.productOwner }}</td>
            <td class="border border-gray-300 px-4 py-2 text-center">{{ localPhaseAnswer.roles.scrumMaster }}</td>
            <td class="border border-gray-300 px-4 py-2 text-center">{{ localPhaseAnswer.roles.developers.join(', ') }}</td>
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
const localPhaseAnswer = ref({ projectName: '', roles: { productOwner: '', scrumMaster: '', developers: [] } });
const { fetchGroupPhaseAnswer } = useGame(groupId.value);
provide('phaseAnswer', localPhaseAnswer);

const fetchPhaseData = async () => {
  try {
    const answerData = await fetchGroupPhaseAnswer(groupId.value, phaseId.value);
    if (answerData) {
      localCurrentPhaseName.value = answerData.phase_name;
      localPhaseAnswer.value = answerData.answer || { projectName: '', roles: { productOwner: '', scrumMaster: '', developers: [] } };
    }
  } catch (error) {
    console.error('Error fetching phase data:', error);
  }
};

const handlePhaseAnswerUpdate = (data) => {
  if (data.group_id === groupId.value && data.phase_id === phaseId.value) {
    localPhaseAnswer.value = data.answer || { projectName: '', roles: { productOwner: '', scrumMaster: '', developers: [] } };
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
