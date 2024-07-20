<template>
  <div :class="['bg-white shadow-md rounded-lg p-4 mb-4', { 'bg-blue-200': isSelected }]">
    <p class="text-lg font-semibold mb-2"> Nom: {{ story.name }}</p>
    <p class="text-lg font-semibold mb-2">Description: {{ story.description }}</p>
    <p class="text-sm text-gray-500 mb-2">Valeur: {{ story.business_value || '' }}</p>
    <p class="text-gray-700">Estimation de temps: {{ formattedTimeEstimation || '' }}</p>
  </div>
</template>

<script setup>
import { defineProps, computed } from 'vue';

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

const formattedTimeEstimation = computed(() => {
  if (!props.story.time_estimation) return '';
  const totalSeconds = props.story.time_estimation;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
});
</script>
