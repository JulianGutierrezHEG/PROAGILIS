<template>
    <div class="flex flex-col min-h-screen">
      <Header />
      <main class="flex-grow flex items-center justify-center">
        <router-view />
      </main>
      <footer class="bg-gray-800 text-white p-4 text-center">
        PROAGILIS - Julian Gutierrez Artels - Bachelor 2024
      </footer>
    </div>
  </template>
  
<script setup>
import Header from '@/components/Header.vue'
</script>