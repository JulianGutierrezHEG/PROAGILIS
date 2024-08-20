<template>
  <div class="flex flex-col min-h-screen">
    <Header class="sticky top-0" />
    <router-view class="flex-grow" />
    <Footer class="sticky bottom-0" />
    <Help class="fixed bottom-4 right-4" />
  </div>
</template>

<script setup>
import Header from '@/components/general/Header.vue';
import Footer from '@/components/general/Footer.vue';
import Help from '@/components/general/Help.vue';
</script>

