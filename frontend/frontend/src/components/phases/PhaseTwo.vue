<template>
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Phase 2: Définir des objectifs SMART</h2>
      <p class="mb-4">
        Définissez les objectifs SMART pour votre projet.
      </p>
      <form>
        <div class="mb-4">
          <label for="specific" class="block text-gray-700">Spécifique</label>
          <textarea id="specific" v-model="smartObjectives.specific" class="mt-1 block w-full p-2 border rounded-md" rows="3" required></textarea>
        </div>
        <div class="mb-4">
          <label for="measurable" class="block text-gray-700">Mesurable</label>
          <textarea id="measurable" v-model="smartObjectives.measurable" class="mt-1 block w-full p-2 border rounded-md" rows="3" required></textarea>
        </div>
        <div class="mb-4">
          <label for="achievable" class="block text-gray-700">Atteignable</label>
          <textarea id="achievable" v-model="smartObjectives.achievable" class="mt-1 block w-full p-2 border rounded-md" rows="3" required></textarea>
        </div>
        <div class="mb-4">
          <label for="relevant" class="block text-gray-700">Pertinent</label>
          <textarea id="relevant" v-model="smartObjectives.relevant" class="mt-1 block w-full p-2 border rounded-md" rows="3" required></textarea>
        </div>
        <div class="mb-4">
          <label for="timeBound" class="block text-gray-700">Délimité dans le temps</label>
          <textarea id="timeBound" v-model="smartObjectives.timeBound" class="mt-1 block w-full p-2 border rounded-md" rows="3" required></textarea>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const smartObjectives = ref({
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    timeBound: ''
  });
  
  const submitForm = () => {
    // Logic to handle form submission
    console.log('SMART Objectives:', smartObjectives.value);
  };
  </script>
  