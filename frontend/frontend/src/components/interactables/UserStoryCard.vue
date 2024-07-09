<template>
  <div v-if="story" class="bg-white shadow-md rounded-lg p-4 mb-4">
    <h3 class="text-lg font-semibold mb-2">{{ story.name }}</h3>
    <p class="text-sm text-gray-500 mb-2">Valeur: {{ story.value }}</p>
    <p class="text-gray-700">{{ story.description }}</p>
  </div>
  <div v-else class="bg-white shadow-md rounded-lg p-4 mb-4">
    <p class="text-red-500">No story data available.</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  story: {
    type: Object,
    required: true,
    default: () => ({})
  }
});
</script>
