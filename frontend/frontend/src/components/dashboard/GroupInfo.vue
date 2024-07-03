<template>
  <div>
    <h3 class="font-bold text-xl text-center mb-4">Infos du groupe</h3>
    <table class="mx-auto w-3/4">
      <thead>
        <tr>
          <th class="px-4 py-2 text-center">Membres</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in group.users" :key="user.id">
          <td class="px-4 py-2 text-center">{{ user.username }}</td>
        </tr>
      </tbody>
    </table>
    <div class="mt-8">
      <h3 class="font-bold text-xl text-center mb-4">Phase du groupe</h3>
      <p class="text-center">{{ group.current_phase || 'Pas de phase actuelle' }}</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
});
</script>

  