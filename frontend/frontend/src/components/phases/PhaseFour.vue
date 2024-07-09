<template>
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Phase 4: Évaluer les User Stories</h2>
      <p class="mb-4">
        Évaluez les user stories corrigées et complétez le backlog produit avec les valeurs métiers trouvées.
      </p>
      <div class="mb-4">
        <h3 class="text-xl font-semibold mb-2">User Stories Corrigées</h3>
        <div class="overflow-y-auto" style="max-height: 700px;">
          <table class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 px-4 bg-gray-100 border-b text-left text-sm font-semibold text-gray-700">User Story</th>
                <th class="py-2 px-4 bg-gray-100 border-b text-left text-sm font-semibold text-gray-700">Valeur Métier</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(story, index) in correctedUserStories" :key="index">
                <td class="py-2 px-4 border-b">
                  <UserStoryCard :story="story" />
                </td>
                <td class="py-2 px-4 border-b">
                  <input
                    type="number"
                    v-model="story.businessValue"
                    class="mt-1 block w-full p-2 border rounded-md"
                    min="1"
                    max="100"
                  />
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
  
  const correctedUserStories = ref([
    { name: 'Consulter le catalogue', value: 'Haute', description: 'En tant que client, je veux pouvoir consulter le catalogue de produits pour choisir ce que je veux acheter.', businessValue: null },
    { name: 'Ajouter au panier', value: 'Moyenne', description: 'En tant que client, je veux ajouter des produits à mon panier pour les acheter plus tard.', businessValue: null },
    { name: 'Ajouter au panier', value: 'Moyenne', description: 'En tant que client, je veux ajouter des produits à mon panier pour les acheter plus tard.', businessValue: null },
    { name: 'Ajouter au panier', value: 'Moyenne', description: 'En tant que client, je veux ajouter des produits à mon panier pour les acheter plus tard.', businessValue: null },
    { name: 'Ajouter au panier', value: 'Moyenne', description: 'En tant que client, je veux ajouter des produits à mon panier pour les acheter plus tard.', businessValue: null },
    { name: 'Ajouter au panier', value: 'Moyenne', description: 'En tant que client, je veux ajouter des produits à mon panier pour les acheter plus tard.', businessValue: null },
    { name: 'Ajouter au panier', value: 'Moyenne', description: 'En tant que client, je veux ajouter des produits à mon panier pour les acheter plus tard.', businessValue: null }
  ]);
  </script>
  