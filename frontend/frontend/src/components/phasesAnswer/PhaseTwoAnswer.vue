<template>
    <div>
      <h3 class="font-bold text-xl text-center mb-4">Réponse pour la phase </h3>
      <div class="flex justify-center">
        <table class="table-auto border-collapse border border-gray-300 w-full max-w-2xl">
          <thead>
            <tr>
              <th class="border bg-slate-400 border-gray-300 px-4 py-2 text-center">S</th>
              <th class="border bg-slate-400 border-gray-300 px-4 py-2 text-center">M</th>
              <th class="border bg-slate-400 border-gray-300 px-4 py-2 text-center">A</th>
              <th class="border bg-slate-400 border-gray-300 px-4 py-2 text-center">R</th>
              <th class="border bg-slate-400 border-gray-300 px-4 py-2 text-center">t</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="border border-gray-300 px-4 py-2 text-center"></td>
              <td class="border border-gray-300 px-4 py-2 text-center"></td>
              <td class="border border-gray-300 px-4 py-2 text-center"></td>
              <td class="border border-gray-300 px-4 py-2 text-center"></td>
              <td class="border border-gray-300 px-4 py-2 text-center"></td>
            </tr>
          </tbody>
        </table>
      </div>
        <ValidationButtons />
    </div>
  </template>
  
  <script setup>
  import { inject } from 'vue';
  import ValidationButtons from '@/components/interactables/ValidationButtons.vue';
  
  </script>