<template>
  <div class="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
    <h2 class="text-3xl font-bold mb-6 text-center">Se connecter</h2>
    <form @submit.prevent="signIn">
      <div class="mb-4">
        <label for="email" class="block text-gray-700">Adresse Email</label>
        <input v-model="data.email" type="email" id="email" class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
      </div>
      <div class="mb-6">
        <label for="password" class="block text-gray-700">Mot de Passe</label>
        <input v-model="data.password" type="password" id="password" class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
      </div>
      <button type="submit" class="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Connexion</button>
    </form>
    <p class="mt-4 text-center">Pas de compte? <router-link to="/signup" class="text-indigo-500 hover:underline">S'enregistrer</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const data = ref({
  email: '',
  password: ''
});

const signIn = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data.value)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error:', errorData);
    } else {
      const responseData = await response.json();
      console.log('Success:', responseData);
      localStorage.setItem('jwt', responseData.token);
      authStore.login();
      await router.push('/');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
