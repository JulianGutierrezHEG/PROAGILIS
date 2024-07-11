<template>
  <div>
    <h3 class="font-bold text-xl text-center mb-4">Infos du groupe</h3>
    <div class="mt-8">
      <h3 class="font-bold text-xl text-center mb-4">Phase du groupe</h3>
      <p class="text-center">{{ currentPhaseName || 'Pas de phase actuelle' }}</p>
      <div v-if="phaseAnswer">
        <h3 class="font-bold text-xl text-center mb-4">Réponse pour la phase {{ currentPhaseName }} :</h3>
        <p class="text-center">Nom du projet: {{ phaseAnswer.projectName }}</p>
        <p class="text-center">Rôles:</p>
        <p class="text-center">Product Owner: {{ phaseAnswer.roles.productOwner }}</p>
        <p class="text-center">Scrum Master: {{ phaseAnswer.roles.scrumMaster }}</p>
        <p class="text-center">Développeurs: {{ phaseAnswer.roles.developers.join(', ') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGame } from '@/composables/useGame';

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
});

const { fetchGroupCurrentPhaseAnswer } = useGame(props.group.id);

const currentPhaseName = ref(null);
const phaseAnswer = ref(null);

onMounted(async () => {
  const answerData = await fetchGroupCurrentPhaseAnswer(props.group.id);
  if (answerData) {
    currentPhaseName.value = answerData.phase_name;
    phaseAnswer.value = answerData.answer;
  }
});
</script>
