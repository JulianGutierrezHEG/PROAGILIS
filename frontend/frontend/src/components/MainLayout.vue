<template>
  <div class="flex flex-col min-h-screen">
    <Header />
    <main class="flex-grow flex items-center justify-center">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
</script>
