<template>
  <div class="container mx-auto px-4 py-8 mt-4 flex-1 flex flex-col justify-center">
    <main class="text-center w-full">
      <h2 class="text-3xl font-bold mb-8">PROAGILIS: L'Aventure agile à votre prochain Sprint</h2>
      <p class="mb-12 text-gray-600 max-w-prose mx-auto">Bienvenue sur ProAgilis, la plateforme d'apprentissage de la gestion de projets Scrum.
        Ici, vous découvrirez et maîtriserez les principes de cette méthode à travers un serious game. Rejoignez une équipe existante ou attendez que votre professeur crée un projet pour commencer votre aventure agile.
        Apprenez à gérer un projet concret efficacement tout en collaborant avec vos camarades. Prêt à relever le défi ? C'est parti !
      </p>

      <div class="flex flex-col md:flex-row items-center justify-center space-y-8 md:space-y-0 md:space-x-16">
        <button
          v-if="userRole === 'etudiant'"
          @click="openModal('joinProjectModal')"
          class="relative bg-white shadow-md rounded-lg p-6 w-64 h-64 flex items-center justify-center flex-col hover:bg-gray-100"
        >
          <img src="https://cdn-icons-png.flaticon.com/512/271/271228.png" alt="Rejoindre un projet" class="w-12 h-12 mb-4">
          <span class="text-lg font-semibold">Rejoindre un projet</span>
          <hr class="absolute bottom-0 w-full border-gray-300">
        </button>

        <button
          v-if="userRole === 'enseignant'"
          @click="openModal('createProjectModal')"
          class="relative bg-white shadow-md rounded-lg p-6 w-64 h-64 flex items-center justify-center flex-col hover:bg-gray-100"
        >
          <img src="https://cdn-icons-png.flaticon.com/512/992/992700.png" alt="Nouveau projet" class="w-12 h-12 mb-4">
          <span class="text-lg font-semibold">Nouveau projet</span>
          <hr class="absolute bottom-0 w-full border-gray-300">
        </button>
      </div>
    </main>

    <!-- Join Project Modal -->
    <div v-if="showJoinProjectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white shadow-md rounded-lg p-6 w-full max-w-lg relative">
        <button @click="closeModal('joinProjectModal')" class="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
          &times;
        </button>
        <h2 class="text-2xl font-semibold mb-4 text-center">Rejoindre un Projet</h2>
        <form>
          <div class="mb-6">
            <label for="project-dropdown" class="block text-gray-700 font-medium mb-2">Projet</label>
            <select id="project-dropdown" name="project-dropdown" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
              <option>Projet 1</option>
              <option>Projet 2</option>
              <option>Projet 3</option>
            </select>
          </div>
          <div class="mb-6">
            <label for="group-dropdown" class="block text-gray-700 font-medium mb-2">Groupe</label>
            <select id="group-dropdown" name="group-dropdown" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
              <option>Groupe 1 - John Doe, Jane Doe</option>
              <option>Groupe 2 - Alice, Bob</option>
              <option>Groupe 3 - Carol, Dave</option>
            </select>
          </div>
          <div class="mb-6">
            <label for="project-password" class="block text-gray-700 font-medium mb-2">Mot de Passe du Projet</label>
            <input type="password" id="project-password" name="project-password" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
          </div>
          <div class="text-center">
            <button type="button" @click="joinProject" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 mr-4">
              Rejoindre le Projet
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Create Project Modal -->
    <div v-if="showCreateProjectModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white shadow-md rounded-lg p-6 w-full max-w-lg relative">
        <button @click="closeModal('createProjectModal')" class="absolute top-2 right-2 text-gray-600 hover:text-gray-900">
          &times;
        </button>
        <h2 class="text-2xl font-semibold mb-4 text-center">Créer un Projet</h2>
        <form>
          <div class="mb-6">
            <label for="project-name" class="block text-gray-700 font-medium mb-2">Nom du Projet</label>
            <input type="text" id="project-name" name="project-name" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 font-medium mb-2">Groupes</label>
            <div class="flex space-x-4">
              <div class="w-1/2">
                <label for="number-of-groups" class="block text-gray-700 mb-1">Nombre de Groupes</label>
                <input type="number" id="number-of-groups" name="number-of-groups" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
              </div>
              <div class="w-1/2">
                <label for="group-size" class="block text-gray-700 mb-1">Taille du Groupe</label>
                <input type="number" id="group-size" name="group-size" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
              </div>
            </div>
          </div>
          <div class="mb-6">
            <label class="block text-gray-700 font-medium mb-2">Dates</label>
            <div class="flex space-x-4">
              <div class="w-1/2">
                <label for="start-date" class="block text-gray-700 mb-1">Date de Début</label>
                <input type="date" id="start-date" name="start-date" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
              </div>
              <div class="w-1/2">
                <label for="end-date" class="block text-gray-700 mb-1">Date de Fin</label>
                <input type="date" id="end-date" name="end-date" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
              </div>
            </div>
          </div>
          <div class="mb-6">
            <label for="session-password" class="block text-gray-700 font-medium mb-2">Mot de Passe de la Session</label>
            <input type="password" id="session-password" name="session-password" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600">
          </div>
          <div class="mb-6">
            <label for="additional-notes" class="block text-gray-700 font-medium mb-2">Notes Additionnelles</label>
            <textarea id="additional-notes" name="additional-notes" rows="3" class="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600" placeholder="Ajoutez des instructions ou des notes ici..."></textarea>
          </div>
          <div class="text-center">
            <button type="button" @click="createProject" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600 mr-4">
              Créer le Projet
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  authStore.checkAuth();
});

const userRole = computed(() => authStore.userRole);

const showJoinProjectModal = ref(false);
const showCreateProjectModal = ref(false);

const openModal = (modal) => {
  if (modal === 'joinProjectModal') {
    showJoinProjectModal.value = true;
  } else if (modal === 'createProjectModal') {
    showCreateProjectModal.value = true;
  }
};

const closeModal = (modal) => {
  if (modal === 'joinProjectModal') {
    showJoinProjectModal.value = false;
  } else if (modal === 'createProjectModal') {
    showCreateProjectModal.value = false;
  }
};

const joinProject = () => {
  // Handle join project logic
  console.log('Joining project');
  closeModal('joinProjectModal');
};

const createProject = () => {
  // Handle create project logic
  console.log('Creating project');
  closeModal('createProjectModal');
};
</script>
