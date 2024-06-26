<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 class="text-2xl font-bold mb-6 text-center">Bienvenue</h2>
        <p class="text-center">{{ message }}</p>

        <router-link to="/signin" class="block text-center mt-6 underline" @click="logout">Se Déconnecter</router-link>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { ref } from 'vue';
import { useRouter } from 'vue-router'


const router = useRouter();
const message = ref('Vous n\'êtes pas connecté(e) !');

onMounted(async () => {
    const response = await fetch('http://localhost:8000/api/user', {
        headers: { 'Content-Type': 'application/json'},
          credentials: 'include'
    });

    const content = await response.json();

    if (response.ok) {
        message.value = `Bienvenue ${content.name} !`;
    }
});

const logout = async () => {
    await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        credentials: 'include'
    });
};
</script>