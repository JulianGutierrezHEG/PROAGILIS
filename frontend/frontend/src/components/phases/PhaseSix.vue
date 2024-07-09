<template>
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">Phase 6: Sprint</h2>
      <p class="mb-4">
        Gérez les tâches de votre sprint en les déplaçant sur la timeline. Réagissez aux événements aléatoires qui peuvent affecter vos tâches.
      </p>
      <p class="mb-4">
        Sprint 1 sur 3
      </p>
      <div class="mb-4">
        <h3 class="text-xl font-semibold mb-2">Timeline du Sprint</h3>
        <div class="relative mb-4">
          <div class="flex justify-between mb-1">
            <span class="text-base font-medium text-blue-700 dark:text-black">Progression Globale</span>
            <span class="text-sm font-medium text-blue-700 dark:text-black">{{ formatTime(globalProgress) }}</span>
          </div>
          <div class="w-full h-6 bg-gray-200 rounded-full dark:bg-gray-700">
            <div class="h-6 bg-green-500 rounded-full dark:bg-green-500" :style="{ width: globalProgressPercent + '%' }"></div>
          </div>
        </div>
        <div class="mb-4">
          <h3 class="text-xl font-semibold mb-2">User Stories</h3>
          <div class="overflow-y-auto max-h-96">
            <div v-for="(story, index) in sprintTasks" :key="index" class="mb-4">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">{{ story.description }} ({{ story.timeEstimate }}h)</span>
                <span class="text-xs text-gray-600">({{ story.timeEstimate }} min en réalité)</span>
              </div>
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium">{{ formatTime(story.progressTime) }}</span>
              </div>
              <div class="w-full h-6 bg-gray-200 rounded-full dark:bg-gray-700">
                <div class="h-6 bg-green-800 rounded-full dark:bg-green-500" :style="{ width: story.progress + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="mt-4 flex justify-between">
          <button @click="startSprint" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
            Démarrer le Sprint
          </button>
          <button @click="simulateEvent" class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">
            Simuler un Événement
          </button>
        </div>
        <div class="mt-4">
          <h3 class="text-xl font-semibold mb-2">Journal des événements</h3>
          <div class="overflow-y-auto max-h-48 bg-gray-100 p-4 rounded-lg">
            <div v-for="(event, index) in eventLog" :key="index" class="mb-2">
              <span class="text-sm">{{ event }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const sprintDuration = 14 * 24; // Two weeks in hours
  const sprintDurationRealTime = 14 * 24 * 60; // Two weeks in minutes (real-time)
  const sprintTasks = ref([
    { description: 'Consulter le catalogue', timeEstimate: 8, progress: 0, progressTime: 0, status: 'À faire' },
    { description: 'Ajouter au panier', timeEstimate: 5, progress: 0, progressTime: 0, status: 'À faire' },
    { description: 'Gérer les paiements', timeEstimate: 10, progress: 0, progressTime: 0, status: 'À faire' }
  ]);
  
  const globalProgress = ref(0); // in minutes (real-time)
  const globalProgressPercent = ref(0);
  const eventLog = ref([]);
  let sprintInterval;
  
  const formatTime = (time) => {
    const days = Math.floor(time / 1440); // 1440 minutes in a day
    const hours = Math.floor((time % 1440) / 60);
    const minutes = Math.floor(time % 60);
    if (days > 0) return `${days}j ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };
  
  const startSprint = () => {
    clearInterval(sprintInterval);
    globalProgress.value = 0;
    globalProgressPercent.value = 0;
    eventLog.value = [];
    sprintTasks.value.forEach(task => {
      task.progress = 0;
      task.progressTime = 0;
    });
  
    sprintInterval = setInterval(() => {
      if (globalProgress.value < sprintDurationRealTime) {
        globalProgress.value += 1; // 1 minute increments in real-time
        globalProgressPercent.value = (globalProgress.value / sprintDurationRealTime) * 100;
  
        sprintTasks.value.forEach(task => {
          if (task.progressTime < task.timeEstimate * 60) {
            task.progressTime += 1; // Increase by 1 minute in real-time
            task.progress = (task.progressTime / (task.timeEstimate * 60)) * 100;
            if (task.progressTime >= task.timeEstimate * 60) task.status = 'Terminé';
          }
        });
      } else {
        clearInterval(sprintInterval);
      }
    }, 1000); // Adjust interval as needed
  };
  
  const simulateEvent = () => {
    const eventType = Math.floor(Math.random() * 3); // 0: block, 1: add time, 2: remove time
    const taskIndex = Math.floor(Math.random() * sprintTasks.value.length);
    const task = sprintTasks.value[taskIndex];
  
    let eventMessage = '';
  
    if (eventType === 0) {
      // Block task
      task.status = 'Bloqué';
      clearInterval(sprintInterval); // Pause the sprint
      eventMessage = `Tâche "${task.description}" bloquée.`;
    } else if (eventType === 1) {
      // Add time
      task.timeEstimate += 2; // Add 2 hours as an example
      task.progressTime = Math.min(task.progressTime, task.timeEstimate * 60);
      task.progress = (task.progressTime / (task.timeEstimate * 60)) * 100; // Adjust progress
      task.status = 'En cours';
      eventMessage = `2 heures ajoutées à la tâche "${task.description}".`;
    } else if (eventType === 2) {
      // Remove time
      task.timeEstimate = Math.max(task.timeEstimate - 2, 0); // Remove 2 hours as an example
      task.progressTime = Math.min(task.progressTime, task.timeEstimate * 60);
      task.progress = (task.progressTime / (task.timeEstimate * 60)) * 100; // Adjust progress
      task.status = 'En cours';
      eventMessage = `2 heures retirées de la tâche "${task.description}".`;
    }
  
    eventLog.value.push(eventMessage);
  };
  </script>
  
  <style scoped>
  /* Add any custom styles if needed */
  </style>
  