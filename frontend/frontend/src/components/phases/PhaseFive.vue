<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-bold">Phase 5: Sprint Planning</h2>
      <a href="https://trello.com" target="_blank" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
        Ouvrir Trello
      </a>
    </div>
    <p class="mb-4">
      Créez un backlog de sprint avec les user stories choisies et décomposez-les en tâches avec une estimation de temps. (1H en jeu = 1min en réalité)
    </p>
    <div class="mb-4">
      <h3 class="text-xl font-semibold mb-2">User Stories Sélectionnées</h3>
      <div class="overflow-y-auto max-h-96">
        <table class="min-w-full bg-white">
          <thead>
            <tr>
              <th class="py-2 px-4 bg-gray-100 border-b text-left text-sm font-semibold text-gray-700">User Story</th>
              <th class="py-2 px-4 bg-gray-100 border-b text-left text-sm font-semibold text-gray-700">Tâches</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(story, index) in selectedUserStories" :key="index">
              <td class="py-2 px-4 border-b">
                <UserStoryCard :story="story" />
              </td>
              <td class="py-2 px-4 border-b">
                <div v-for="(task, taskIndex) in story.tasks" :key="taskIndex" class="mb-2">
                  <div class="flex items-center">
                    <input
                      type="text"
                      v-model="task.description"
                      class="mt-1 block w-full p-2 border rounded-md"
                      placeholder="Description de la tâche"
                    />
                    <input
                      type="number"
                      v-model="task.timeEstimate"
                      class="mt-1 ml-2 block p-2 border rounded-md"
                      placeholder="Temps (h)"
                      min="1"
                    />
                    <button @click="removeTask(index, taskIndex)" class="ml-2 bg-red-500 text-white px-2 py-1 rounded-md hover:bg-red-600">
                      Supprimer
                    </button>
                  </div>
                </div>
                <button @click="addTask(index)" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
                  Ajouter une tâche
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import UserStoryCard from '@/components/interactables/UserStoryCard.vue';

const selectedUserStories = ref([
  { 
    name: 'Consulter le catalogue', 
    value: 'Haute', 
    description: 'En tant que client, je veux pouvoir consulter le catalogue de produits pour choisir ce que je veux acheter.', 
    tasks: [
      { description: '', timeEstimate: null }
    ]
  },
  { 
    name: 'Ajouter au panier', 
    value: 'Moyenne', 
    description: 'En tant que client, je veux ajouter des produits à mon panier pour les acheter plus tard.', 
    tasks: [
      { description: '', timeEstimate: null }
    ]
  }
]);

const addTask = (index) => {
  selectedUserStories.value[index].tasks.push({ description: '', timeEstimate: null });
};

const removeTask = (storyIndex, taskIndex) => {
  selectedUserStories.value[storyIndex].tasks.splice(taskIndex, 1);
};
</script>

