<template>
    <div class="fixed bottom-4 right-4 z-50">
      <div
        v-if="isExpanded"
        class="bg-gray-200 shadow-lg rounded-lg p-4 mb-2 w-3/4 h-4/6 overflow-y-auto transition-all duration-500 ease-out transform scale-90 opacity-0 fixed bottom-4 right-4"
        :class="{ 'scale-100 opacity-100': isExpanded }"
      >
        <h2 class="font-bold mb-2">Aide</h2>
        <p class="mb-4">Vous pouvez trouvez toutes les aides nécessaires ici</p>
        <ul class="list-disc pl-5">
          <li><a href="#tip1" class="text-blue-600 hover:underline">Tip 1</a></li>
          <li><a href="#tip2" class="text-blue-600 hover:underline">Tip 2</a></li>
          <li><a href="#tip3" class="text-blue-600 hover:underline">Tip 3</a></li>
        </ul>
      </div>
      <button
        @click="toggleExpand"
        class="bg-gray-700 text-white  w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg focus:outline-none transform transition-transform duration-300 ease-out"
      >
        ?
      </button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const isExpanded = ref(false);
  
  const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
  };
  </script>
  