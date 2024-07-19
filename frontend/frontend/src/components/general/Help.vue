<template>
  <div class="fixed bottom-4 right-4 z-50">
    <div
      v-if="isExpanded"
      class="bg-gray-200 shadow-lg rounded-lg p-4 mb-2 w-3/4 h-4/6 overflow-y-auto transition-all duration-500 ease-out transform scale-90 opacity-0 fixed bottom-4 right-4"
      :class="{ 'scale-100 opacity-100': isExpanded }"
    >
      <h2 class="font-bold mb-2">Aide</h2>
      <div>
        <div>
          <h2>
            <button @click="toggleAccordion(1)" class="flex items-center justify-between w-full py-5 font-medium text-gray-500 border-b border-gray-200 dark:border-gray-700  gap-3">
              <span>Comment fonctionne le jeu ?</span>
              <svg :class="{ 'rotate-180': isOpen[1] }" class="w-3 h-3 transform transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"/>
              </svg>
            </button>
          </h2>
          <div v-show="isOpen[1]" class="py-5 border-b border-gray-200 dark:border-gray-700">
            <p>Le jeu se déroule en 8 phases suivant le processus de création d'un projet selon la méthodologie SCRUM (3 sprints).</p>
            <p>Demandez le mot de passe et le nom de la session à l'enseignant et rejoignez celle-ci, puis formez des groupes.</p>
            <p class="mb-2">Attendez le début de la partie.</p>
            <ul class="list-none pl-5">
              <li>Phase 1</li>
              <li>Phase 2</li>
              <li>Phase 3</li>
              <li>Phase 4</li>
              <li>Phase 5</li>
              <li>Phase 6</li>
              <li>Phase 7</li>
              <li>Phase 8</li>
            </ul>
  
          </div>
        </div>
        <div>
          <h2>
            <button @click="toggleAccordion(2)" class="flex items-center justify-between w-full py-5 font-medium text-gray-500 border-b border-gray-200 dark:border-gray-700  gap-3">
              <span>Liens et contact</span>
              <svg :class="{ 'rotate-180': isOpen[2] }" class="w-3 h-3 transform transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5 5 1 1 5"/>
              </svg>
            </button>
          </h2>
          <div v-show="isOpen[2]" class="py-5 border-b border-gray-200 dark:border-gray-700">
            <p class="mb-2 text-gray-500 dark:text-gray-400">Contacts</p>
            <ul class="list-disc pl-5">
              <li>Profs: Perrotte Sonia (sonia.perrotte@hesge.ch) et Bayat-Ricard Marianne (marianne.bayat-ricard@hesge.ch)</li>
              <li>Admin: Gutierrez Julian ( julian.gutierrez@etu.hesge.ch)</li>
              <li>Cyberlearn: <a href="https://cyberlearn.hes-so.ch/" class="text-blue-500">https://cyberlearn.hes-so.ch/</a></li>
              <li>Bachelor: Lien vers le bachelor</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    <button
      @click="toggleExpand"
      class="bg-gray-700 text-white w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg focus:outline-none transform transition-transform duration-300 ease-out"
    >
      ?
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isExpanded = ref(false);
const isOpen = ref({ 1: false, 2: false });

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const toggleAccordion = (index) => {
  isOpen.value[index] = !isOpen.value[index];
};
</script>

<style scoped>
.custom-button {
  display: block;
  margin: 0 auto;
}

.fixed.bottom-4.right-4 {
  bottom: 1rem;
  right: 1rem;
}
</style>
