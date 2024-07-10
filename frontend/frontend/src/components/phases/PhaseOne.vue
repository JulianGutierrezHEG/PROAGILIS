<template>
  <div class="p-4">
    <h2 class="text-3xl font-bold mb-6 text-center">Phase 1: Création d'un Projet</h2>
    <p class="mb-6 text-center">
      Le directeur du centre commercial Startcourt veut proposer, aux boutiques qu’il héberge, un service de création de site de e-commerce. Ainsi, chaque boutique qui en fera la demande pourra avoir son propre site de vente en ligne. Il fait donc appel à votre société pour développer les sites de vente en ligne pour les boutiques qui en font la demande.
      Votre société utilisant habituellement Scrum comme méthode de gestion de projet, vous allez la mettre aussi en œuvre pour ce projet.
    </p>
    <form @submit.prevent="submitForm" class="max-w-lg mx-auto">
      <div class="mb-6">
        <label for="projectName" class="block text-gray-700 text-lg">Nom du projet</label>
        <input type="text" id="projectName" v-model="projectName" class="mt-2 block w-full p-3 border rounded-md"
               :class="{ locked: lockedElements.projectName && lockedElements.projectName !== currentUser }"
               @focus="lock('projectName')" @blur="unlock('projectName')" @input="updateProject" required />
      </div>
      <div class="mb-6" :class="{ locked: lockedElements.scrumMaster && lockedElements.scrumMaster !== currentUser }"
           @mouseover="lock('scrumMaster')" @mouseout="unlock('scrumMaster')">
        <h3 class="text-center mb-3 text-xl">Qui sera le Scrum Master?</h3>
        <div v-if="roles.scrumMaster" class="text-center">
          <p>{{ roles.scrumMaster }} sera le Scrum Master</p>
          <img src="https://cdn-icons-png.flaticon.com/512/7134/7134699.png" alt="change icon" @click="clearScrumMaster" class="w-8 h-8 mx-auto cursor-pointer" />
        </div>
        <div v-else class="flex justify-center gap-4">
          <button v-for="member in availableMembers" :key="member.id" @click="selectScrumMaster(member.username)"
                  :class="{ 'bg-blue-600 text-white': roles.scrumMaster === member.username, 'bg-gray-300': roles.scrumMaster !== member.username }"
                  class="p-3 rounded-lg text-lg transition-colors duration-150 ease-in-out">
            {{ member.username }}
          </button>
        </div>
      </div>
      <div class="mb-6" :class="{ locked: lockedElements.productOwner && lockedElements.productOwner !== currentUser }"
           @mouseover="lock('productOwner')" @mouseout="unlock('productOwner')">
        <h3 class="text-center mb-3 text-xl">Qui sera le Product Owner?</h3>
        <div v-if="roles.productOwner" class="text-center">
          <p>{{ roles.productOwner }} sera le Product Owner</p>
          <img src="https://cdn-icons-png.flaticon.com/512/7134/7134699.png" alt="change icon" @click="clearProductOwner" class="w-8 h-8 mx-auto cursor-pointer" />
        </div>
        <div v-else class="flex justify-center gap-4">
          <button v-for="member in availableMembers" :key="member.id" @click="selectProductOwner(member.username)"
                  :class="{ 'bg-blue-600 text-white': roles.productOwner === member.username, 'bg-gray-300': roles.productOwner !== member.username }"
                  class="p-3 rounded-lg text-lg transition-colors duration-150 ease-in-out">
            {{ member.username }}
          </button>
        </div>
      </div>
      <p class="text-center mb-6 text-lg">Tous les autres membres du groupe seront des développeurs.</p>
      <div class="text-center">
        <button @click="submitProjectData" class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
          Soumettre
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGame } from '@/composables/useGame';
import websocketService from '@/services/websocketService';
import EventBus from '@/services/eventBus';

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
});

const { groupMembers, lockedElements, fetchGroupMembers, setupWebSocket, cleanupWebSocket, lockElement, unlockElement, currentUser } = useGame(props.group.id);

const projectName = ref('');
const roles = ref({
  scrumMaster: '',
  productOwner: '',
  developers: []
});

const availableMembers = computed(() => {
  const assignedMembers = new Set([roles.value.scrumMaster, roles.value.productOwner, ...roles.value.developers]);
  return groupMembers.value.filter(member => !assignedMembers.has(member.username));
});

const lock = (elementId) => {
  lockElement(elementId);
};

const unlock = (elementId) => {
  unlockElement(elementId);
};

const updateProject = () => {
  websocketService.updateProjectDetails(props.group.id, projectName.value, roles.value, currentUser.value);
};

const selectScrumMaster = (username) => {
  roles.value.scrumMaster = username;
  updateProject();
};

const selectProductOwner = (username) => {
  roles.value.productOwner = username;
  updateProject();
};

const clearScrumMaster = () => {
  roles.value.scrumMaster = '';
  updateProject();
};

const clearProductOwner = () => {
  roles.value.productOwner = '';
  updateProject();
};

const submitForm = () => {
  console.log('Nom du projet:', projectName.value);
  console.log('Rôles:', roles.value);
};

const handleProjectUpdate = (data) => {
  projectName.value = data.projectName;
  roles.value = data.roles;
  console.log(`Project updated by: ${data.user}`);
};

const submitProjectData = () => {
  // Emit event to show waiting screen for all users in the group via WebSocket
  websocketService.showWaitingScreen(props.group.id);

  // Send project data to parent component
  EventBus.emit('updateProjectData', {
    projectName: projectName.value,
    roles: roles.value,
  });

  const developers = groupMembers.value.filter(
    (member) => member.username !== roles.value.scrumMaster && member.username !== roles.value.productOwner
  ).map((member) => member.username);

  console.log(`Nom du projet: ${projectName.value}\n\nRôles:\nProduct Owner: ${roles.value.productOwner || 'Personne n\'est assigné à ce rôle'}\nScrum Master: ${roles.value.scrumMaster || 'Personne n\'est assigné à ce rôle'}\nDéveloppeurs: ${developers.length ? developers.join(', ') : 'Personne n\'est assigné à ce rôle'}`);
};

onMounted(() => {
  fetchGroupMembers();
  setupWebSocket();
  EventBus.on('project_update', handleProjectUpdate);
});

onUnmounted(() => {
  cleanupWebSocket();
  EventBus.off('project_update', handleProjectUpdate);
});
</script>

<style scoped>
.locked {
  background-color: rgba(211, 211, 211, 0.5); 
  border-color: #a9a9a9; 
  pointer-events: none; 
  opacity: 0.7; 
  position: relative;
}

.locked:after {
  content: "Bloqué"; 
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: red;
  font-weight: bold;
  background: rgba(255, 255, 255, 0.7); 
  padding: 2px 6px;
  border-radius: 4px;
  z-index: 10; 
}

button:hover {
  background-color: #3b82f6; 
}

button:active, button:focus {
  background-color: #2563eb; 
  transform: scale(1); 
  outline: none; 
}

button {
  width: 100%; 
  padding: 12px 24px; 
}
</style>
