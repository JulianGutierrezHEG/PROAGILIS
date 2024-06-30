<template>
  <div class="container mx-auto px-4 py-8 mt-4 flex-1 flex flex-col justify-center">
    <main class="text-center w-full">
      <h2 class="text-3xl font-bold mb-8">PROAGILIS: L'Aventure agile à votre prochain Sprint</h2>
      <p class="mb-12 text-gray-600 max-w-prose mx-auto">Bienvenue sur ProAgilis, la plateforme d'apprentissage de la gestion de projets Scrum.
        Ici, vous découvrirez et maîtriserez les principes de cette méthode à travers un serious game. Rejoignez une équipe existante ou attendez que votre professeur crée un projet pour commencer votre aventure agile.
        Apprenez à gérer un projet concret efficacement tout en collaborant avec vos camarades. Prêt à relever le défi ? C'est parti !
      </p>
      <span v-if="userRole === 'etudiant'">Vous êtes un étudiant</span>
      <span v-else-if="userRole === 'enseignant'">Vous êtes un enseignant</span>
    </main>
    </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/authStore'; 
const authStore = useAuthStore();
const userRole = authStore.role;
</script>
