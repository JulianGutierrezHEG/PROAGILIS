<!-- src/components/MainLayout.vue -->
<template>
    <div>
      <header>
        <nav>
          <router-link to="/">Home</router-link>
          <router-link to="/other">Other</router-link>
        </nav>
      </header>
      <main>
        <router-view />
      </main>
      <footer>
        <p>© 2023 Your Company</p>
      </footer>
    </div>
  </template>
  
  <script>
  export default {
    name: 'MainLayout',
  };
  </script>
  