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
      <form class="max-w-lg mx-auto">
        <div class="mb-6">
          <label for="projectName" class="block text-gray-700 text-lg">Nom du projet</label>
          <input type="text" id="projectName" v-model="projectName" class="mt-2 block w-full p-3 border rounded-md"
                 :class="{ locked: lockedElements.projectName && lockedElements.projectName !== currentUser }"
                 @focus="lock('projectName')" @blur="unlock('projectName')" @input="updateProjectName" required />
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
                    class="p-3 rounded-lg text-lg transition-colors duration-150 ease-in-out custom-button">
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
                    class="p-3 rounded-lg text-lg transition-colors duration-150 ease-in-out custom-button">
              {{ member.username }}
            </button>
          </div>
        </div>
        <p class="text-center mb-6 text-lg">Tous les autres membres du groupe seront des développeurs.</p>
        <button @click.prevent="submitProjectData" 
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 custom-button mb-10">
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
  setupEvents,
  cleanupEvents,
  lockElement,
  unlockElement,
  checkValidationAndSendAnswer,
  fetchCurrentPhase,
  setPhaseHandler
} = useGame(props.group.id, props.group);

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

const updateProjectName = () => {
  websocketService.updateInterface(props.group.id, { field: 'projectName', value: projectName.value });
};

const selectScrumMaster = (username) => {
  roles.value.scrumMaster = username;
  websocketService.updateInterface(props.group.id, { field: 'roles', value: roles.value });
};

const selectProductOwner = (username) => {
  roles.value.productOwner = username;
  websocketService.updateInterface(props.group.id, { field: 'roles', value: roles.value });
};

const clearScrumMaster = () => {
  roles.value.scrumMaster = '';
  websocketService.updateInterface(props.group.id, { field: 'roles', value: roles.value });
};

const clearProductOwner = () => {
  roles.value.productOwner = '';
  websocketService.updateInterface(props.group.id, { field: 'roles', value: roles.value });
};


const submitProjectData = async () => {
  if (!roles.value.scrumMaster && !roles.value.productOwner) {
    roles.value.developers = groupMembers.value.map(member => member.username);
  } else {
    roles.value.developers = groupMembers.value.filter(
      (member) => member.username !== roles.value.scrumMaster && member.username !== roles.value.productOwner
    ).map((member) => member.username);
  }

  const answerData = {
    projectName: projectName.value,
    roles: roles.value,
  };
  await checkValidationAndSendAnswer(answerData);
};

const handlePhaseInterfaceChange = (data) => {
  if (data.field === 'projectName') {
    projectName.value = data.value;
  } else if (data.field === 'roles') {
    roles.value = { ...data.value };
  }
};

onMounted(async () => {
  await fetchCurrentPhase();
  fetchGroupMembers();
  setupEvents();
  setPhaseHandler(handlePhaseInterfaceChange);
});

onUnmounted(() => {
  cleanupEvents();
  setPhaseHandler(null); 
});
</script>
