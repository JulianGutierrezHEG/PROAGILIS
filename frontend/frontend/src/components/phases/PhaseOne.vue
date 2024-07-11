<template>
  <div class="p-4 overflow-auto">
    <div v-if="waiting">
      <WaitingScreen />
    </div>
    <div v-else>
      <h2 v-if="!isLoadingPhaseDetails" class="text-3xl font-bold mb-6 text-center">{{ currentPhaseDetails.name }}</h2>
      <p v-if="!isLoadingPhaseDetails" class="mb-6 text-center">
        {{ currentPhaseDetails.description }}
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
        <button @click.prevent="submitProjectData" class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Soumettre
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useGame } from '@/composables/useGame';
import websocketService from '@/services/websocketService';
import EventBus from '@/services/eventBus';
import WaitingScreen from '@/views/WaitingScreen.vue';

const props = defineProps({
  group: {
    type: Object,
    required: true
  }
});

const { 
  groupMembers, 
  lockedElements, 
  currentUser, 
  currentPhaseDetails, 
  isLoadingPhaseDetails, 
  waiting,
  fetchGroupMembers, 
  setupWebSocket, 
  cleanupWebSocket, 
  lockElement, 
  unlockElement, 
  submitGroupAnswer,
  showWaitingScreen 
} = useGame(props.group.id);

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

const handleUserJoinedGroup = (data) => {
  console.log('User joined group:', data);
  fetchGroupMembers();
};

const handleUserLeftGroup = (data) => {
  console.log('User left group:', data);
  fetchGroupMembers();
};

const submitProjectData = async () => {
  showWaitingScreen(props.group.id, currentUser.value);

  const answerData = {
    projectName: projectName.value,
    roles: roles.value,
  };

  try {
    await submitGroupAnswer(answerData);
  } catch (error) {
    console.error('Error submitting project data:', error);
  }

  EventBus.emit('updateProjectData', answerData);

  const developers = groupMembers.value.filter(
    (member) => member.username !== roles.value.scrumMaster && member.username !== roles.value.productOwner
  ).map((member) => member.username);

  console.log(`Nom du projet: ${projectName.value}\n\nRôles:\nProduct Owner: ${roles.value.productOwner || 'Personne n\'est assigné à ce rôle'}\nScrum Master: ${roles.value.scrumMaster || 'Personne n\'est assigné à ce rôle'}\nDéveloppeurs: ${developers.length ? developers.join(', ') : 'Personne n\'est assigné à ce rôle'}`);
};

onMounted(() => {
  fetchGroupMembers();
  setupWebSocket();
  EventBus.on('project_update', handleProjectUpdate);
  EventBus.on('show_waiting_screen', () => {
    waiting.value = true;
  });
  EventBus.on('user_joined_group', handleUserJoinedGroup);
  EventBus.on('user_left_group', handleUserLeftGroup);
});

onUnmounted(() => {
  cleanupWebSocket();
  EventBus.off('project_update', handleProjectUpdate);
  EventBus.off('show_waiting_screen', () => {
    waiting.value = true;
  });
  EventBus.off('user_joined_group', handleUserJoinedGroup);
  EventBus.off('user_left_group', handleUserLeftGroup);
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
