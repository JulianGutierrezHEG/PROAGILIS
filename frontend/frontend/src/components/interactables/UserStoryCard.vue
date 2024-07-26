<template>
  <div :class="['bg-white shadow-md rounded-lg p-4 mb-4']" 
       :style="{ backgroundColor: isSelected ? '#3b82f6' : 'white' }">
    <p class="text-lg font-semibold mb-2"> Nom: {{ story.name }}</p>
    <p class="text-lg font-semibold mb-2">Description: {{ story.description }}</p>
    <p class="text-sm text-gray-500 mb-2">Valeur: {{ story.business_value || '' }} , Sprint: {{ story.original_sprint_number}}</p>
    <p class="text-gray-700">Estimation de temps réel: {{ formattedRealTimeEstimation || '' }}</p>
    <p class="text-gray-700">Estimation de temps en jeu: {{ formattedGameTimeEstimation || '' }}</p>
  </div>
</template>

<script setup>
import { watch,defineProps, computed, onMounted } from 'vue';
import { useGame } from '@/composables/useGame';

const props = defineProps({
  story: {
    type: Object,
    required: true,
    default: () => ({})
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

const { gameTimeControl, fetchGameTimeControl } = useGame();

onMounted(async () => {
  await fetchGameTimeControl();
});

watch(() => props.isSelected, (newVal) => {
  console.log(`UserStoryCard: isSelected changed to ${newVal} for story ${props.story.id}`);
});

const formattedRealTimeEstimation = computed(() => {
  if (!props.story.time_estimation) return '';
  const totalSeconds = props.story.time_estimation;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${hours}h ${minutes}m`;
});

const formattedGameTimeEstimation = computed(() => {
  if (!props.story.time_estimation || !gameTimeControl.value.real_minutes || !gameTimeControl.value.game_hours) return '';
  
  const totalSeconds = props.story.time_estimation;
  const totalRealMinutes = totalSeconds / 60; 
  const gameMinutesPerRealMinute = gameTimeControl.value.game_hours / gameTimeControl.value.real_minutes;
  const totalGameHours = totalRealMinutes * gameMinutesPerRealMinute;
  const days = Math.floor(totalGameHours / 24);
  const hours = Math.floor(totalGameHours % 24);

  return `${days}j ${hours}h`;
});

</script>

