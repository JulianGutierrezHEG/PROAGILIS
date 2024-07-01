<template>
  <div class="flex flex-col min-h-screen">
    <Header class="sticky top-0" />
    <router-view class="flex-grow" />
    <Footer class="sticky bottom-0" />
  </div>
</template>

<script setup>
import Header from '@/components/general/Header.vue';
import Footer from '@/components/general/Footer.vue';
</script>