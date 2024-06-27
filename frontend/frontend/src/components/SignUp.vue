<template>
  <div class="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
    <h2 class="text-3xl font-bold mb-6 text-center">S'enregistrer</h2>
    <form @submit.prevent="signUp">
      <div class="mb-4">
        <label for="name" class="block text-gray-700">Nom</label>
        <input v-model="data.name" type="text" id="name" class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
      </div>
      <div class="mb-4">
        <label for="email" class="block text-gray-700">Email</label>
        <input v-model="data.email" type="email" id="email" class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
      </div>
      <div class="mb-6">
        <label for="password" class="block text-gray-700">Mot de passe</label>
        <input v-model="data.password" type="password" id="password" class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
      </div>
      <button type="submit" class="w-full py-2 px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">Enregistrer</button>
    </form>
    <p class="mt-4 text-center">Déjà un compte? <router-link to="/signin" class="text-indigo-500 hover:underline">Se connecter</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const data = ref({
  name: '',
  email: '',
  password: ''
});

const signUp = async () => {
  try {
    const response = await fetch('http://127.0.0.1:8000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
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
