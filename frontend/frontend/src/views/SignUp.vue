<template>
  <div class="w-full max-w-lg bg-white p-8 rounded-lg shadow-md">
    <h2 class="text-3xl font-bold mb-6 text-center">S'enregistrer</h2>
    <form @submit.prevent="handleSignUp">
      <div class="mb-4">
        <label for="username" class="block text-gray-700">Nom d'utilisateur</label>
        <input v-model="username" type="text" id="username" class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-900" required />
      </div>
      <div class="mb-4">
        <label for="email" class="block text-gray-700">Adresse Email</label>
        <input v-model="email" type="email" id="email" class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-900" required />
      </div>
      <div class="mb-6">
        <label for="password" class="block text-gray-700">Mot de Passe</label>
        <input v-model="password" type="password" id="password" class="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" required />
      </div>
      <div class="mb-6 flex items-center">
        <input v-model="isTeacher" type="checkbox" id="isTeacher" class="mr-2" />
        <label for="isTeacher" class="text-gray-700">Je suis un enseignant</label>
      </div>
      <div v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</div>
      <button type="submit" class="w-full py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-600">Enregistrer</button>
    </form>
    <p class="mt-4 text-center">Déjà un compte? <router-link to="/signin" class="text-indigo-500 hover:underline">Se connecter</router-link></p>
  </div>
</template>

<script setup>
import { reactive, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { signUp } from '@/services/authService';

const state = reactive({
  username: '',
  email: '',
  password: '',
  isTeacher: false,
  error: ''
});

const router = useRouter();

const handleSignUp = async () => {
  const formData = {
    username: state.username,
    email: state.email,
    password: state.password,
    role: state.isTeacher ? 'enseignant' : 'etudiant',
  };

  try {
    await signUp(formData);
    router.push('/signin');
  } catch (err) {
    state.error = err.message;
  }
};

const { username, email, password, isTeacher, error } = toRefs(state);
</script>