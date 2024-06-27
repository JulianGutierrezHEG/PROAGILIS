<template>
  <div class="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
    <h2 class="text-3xl font-bold mb-6 text-center">Se connecter</h2>
    <form @submit.prevent="signIn">
      <div class="mb-4">
        <label for="email" class="block text-gray-700">Adresse Email</label>
        <input v-model="data.email" type="email" id="email" class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-900" required />
      </div>
      <div class="mb-6">
        <label for="password" class="block text-gray-700">Mot de Passe</label>
        <input v-model="data.password" type="password" id="password" class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-900" required />
      </div>
      <button type="submit" class="w-full py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-600">Connexion</button>
    </form>
    <p class="mt-4 text-center">Pas de compte? <router-link to="/signup" class="text-indigo-600 hover:underline">S'enregistrer</router-link></p>
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
  const success = await authStore.login(data.value.email, data.value.password);
  if (success) {
    router.push('/');
  } else {
    console.error('Login failed');
  }
};
</script>
