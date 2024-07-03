<template>
  <div class="flex items-center justify-center w-full">
     <div class="w-full max-w-2xl p-8 rounded-lg shadow-md">
      <h2 class="text-3xl font-bold mb-6 text-center">Se connecter</h2>
      <form @submit.prevent="handleSignIn">
        <div class="mb-4">
          <label for="email" class="block text-gray-700">Adresse Email</label>
          <input v-model="email" type="email" id="email" class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-900" required />
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700">Mot de Passe</label>
          <input v-model="password" type="password" id="password" class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-900" required />
        </div>
        <div v-if="error" class="mb-4 text-red-600">{{ error }}</div>
        <button type="submit" class="w-full py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-600">Connexion</button>
      </form>
      <p class="mt-4 text-center">Pas de compte? <router-link to="/signup" class="text-indigo-600 hover:underline">S'enregistrer</router-link></p>
     </div>
 </div>
 </template>
 

<script setup>
import { reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { signIn } from '@/services/authService';

const state = reactive({
  email: '',
  password: '',
  error: ''
});

const router = useRouter();
const authStore = useAuthStore();

const handleSignIn = async () => {
  const formData = {
    email: state.email,
    password: state.password,
  };

  try {
    const { access, refresh, role } = await signIn(formData);

    authStore.setAccess(access);
    authStore.setRefresh(refresh);
    authStore.setUserRole(role);

    router.push('/');
  } catch (signInError) {
    state.error = 'Email ou mot de passe incorrect';
  }
};

const { email, password, error } = toRefs(state);
</script>