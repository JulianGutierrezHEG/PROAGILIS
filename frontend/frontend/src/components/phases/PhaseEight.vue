<template>
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Phase 8: Rétrospective</h2>
      <p class="mb-4">
        Partagez vos réflexions sur le sprint terminé. Notez ce qui a bien fonctionné, ce qui pourrait être amélioré, et les actions à entreprendre pour le prochain sprint.
      </p>
      <div class="mb-4">
        <h3 class="text-xl font-semibold mb-2">Ce qui a bien fonctionné</h3>
        <textarea v-model="retrospective.wentWell" class="w-full p-2 border rounded-md" rows="4"></textarea>
      </div>
      <div class="mb-4">
        <h3 class="text-xl font-semibold mb-2">Ce qui pourrait être amélioré</h3>
        <textarea v-model="retrospective.couldBeImproved" class="w-full p-2 border rounded-md" rows="4"></textarea>
      </div>
      <div class="mb-4">
        <h3 class="text-xl font-semibold mb-2">Actions à entreprendre</h3>
        <textarea v-model="retrospective.actionItems" class="w-full p-2 border rounded-md" rows="4"></textarea>
      </div>

    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const retrospective = ref({
    wentWell: '',
    couldBeImproved: '',
    actionItems: ''
  });
  
  const submitRetrospective = () => {
    console.log('Rétrospective soumise:', retrospective.value);
    // Logic to submit the retrospective for validation
    alert('Rétrospective soumise pour validation');
  };
  </script>
  
  <style scoped>
  /* Add any custom styles if needed */
  </style>
  