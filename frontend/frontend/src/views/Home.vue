<template>
  <div class="flex flex-col justify-center items-center">
    <main class="text-center w-full">
      <h2 class="text-3xl font-bold mb-4">PROAGILIS: L'Aventure agile à votre prochain Sprint</h2>
      <p class="mb-8 text-gray-600 max-w-prose mx-auto">Bienvenue sur ProAgilis, la plateforme d'apprentissage de la gestion de projets Scrum.
        Ici, vous découvrirez et maîtriserez les principes de cette méthode à travers un serious game. Rejoignez une équipe existante ou attendez que votre professeur crée un projet pour commencer votre aventure agile.
        Apprenez à gérer un projet concret efficacement tout en collaborant avec vos camarades. Prêt à relever le défi ? C'est parti !
      </p>
      <BtnHomeChoice />
    </main>
  </div>
</template>

<script setup>
import BtnHomeChoice from '@/components/interactables/BtnHomeChoice.vue';

</script>

