import { ref, onMounted, onUnmounted } from 'vue';
import websocketService from '@/services/websocketService';
import gamesService from '@/services/gamesService';
import usersService from '@/services/usersService';
import EventBus from '@/services/eventBus';
import { useGameStore } from '@/stores/gameStore';

// COMPOSABLE POUR LES PARTIES, UTILISEE DANS LES VUES

export function useGame(groupId, group) {
  const gameStore = useGameStore();
  const groupMembers = ref([]);
  const lockedElements = ref({});
  const currentUser = ref(null);
  const currentPhase = ref(null);
  const currentPhaseDetails = ref(null);
  const currentPhaseAnswer = ref(null);
  const isLoadingPhaseDetails = ref(true);
  const waiting = ref(false);
  const phases = ref([]);
  const phasesStatus = ref([]);
  const roles = ref({
    scrumMaster: '',
    productOwner: '',
    developers: []
  });
  const smartObjectives = ref({
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    timeBound: ''
  });
  const existingUserStories = ref([]);

  // Récupère les membres du groupe
  const fetchGroupMembers = async () => {
    try {
      const members = await gamesService.getGroupMembers();
      groupMembers.value = members;
    } catch (error) {
      console.error('Erreur lors de la récupération des membres du groupe:', error);
    }
  };

  // Récupère l'utilisateur actuel
  const fetchCurrentUser = async () => {
    try {
      const user = await usersService.getCurrentUser();
      currentUser.value = user.username;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur actuel:', error);
    }
  };

  // Récupère la phase actuelle
  const fetchCurrentPhase = async () => {
    try {
      isLoadingPhaseDetails.value = true; 
      const phaseStatus = await gamesService.getGroupCurrentPhase(groupId);
      currentPhase.value = phaseStatus;
      if (phaseStatus.status === 'pending') { 
        waiting.value = true;
      } else {
        waiting.value = false;
      }
      if (phaseStatus.phase) {
        const phaseDetails = await gamesService.getPhaseDetails(phaseStatus.phase);
        currentPhaseDetails.value = phaseDetails;
      }
      console.log('Phase actuelle:', currentPhase.value);
      console.log('Détails de la phase actuelle:', currentPhaseDetails.value);
    } catch (error) {
      console.error('Erreur lors de la récupération de la phase actuelle:', error);
    } finally {
      isLoadingPhaseDetails.value = false; 
    }
  };

  // Récupère les détails d'une phase spécifique
  const fetchPhaseDetails = async (phaseId) => {
      try {
        const phaseDetails = await gamesService.getPhaseDetails(phaseId);
        return phaseDetails;
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de la phase:', error);
        return null;
      }
  };

  // Récupère les statuts des phases du groupe
  const fetchGroupPhasesStatus = async (groupId) => {
    try {
      const response = await gamesService.getGroupPhasesStatus(groupId);
      phasesStatus.value = response;
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des statuts des phases du groupe:', error);
    }
  };

  // Mise en place des websockets et des événements
  const setupWebSocket = () => {
    console.log('Mise en place du WebSocket pour le groupe:', groupId);
    websocketService.connectGroup(groupId);

    EventBus.on('lock_element', handleLockElement);
    EventBus.on('unlock_element', handleUnlockElement);
    EventBus.on('project_update', handleProjectUpdate);
    EventBus.on('smart_update', handleSmartUpdate);
    EventBus.on('user_story_created_update', handleUserStoryUpdate);
    EventBus.on('user_joined_group', handleUserJoinedGroup);
    EventBus.on('user_left_group', handleUserLeftGroup);
    EventBus.on('phase_status_update', handlePhaseStatusUpdate);
    EventBus.on('phase_answer_update', handlePhaseAnswerUpdate);
    EventBus.on('show_waiting_screen', handleShowWaitingScreen);
  };

  // Nettoyage des websockets et des événements
  const cleanupWebSocket = () => {
    console.log('Nettoyage du WebSocket pour le groupe:', groupId);
    websocketService.disconnectGroup(groupId);

    EventBus.off('lock_element', handleLockElement);
    EventBus.off('unlock_element', handleUnlockElement);
    EventBus.off('project_update', handleProjectUpdate);
    EventBus.off('smart_update', handleSmartUpdate);
    EventBus.on('user_story_created_update', handleUserStoryUpdate);
    EventBus.off('user_joined_group', handleUserJoinedGroup);
    EventBus.off('user_left_group', handleUserLeftGroup);
    EventBus.off('phase_status_update', handlePhaseStatusUpdate);
    EventBus.off('phase_answer_update', handlePhaseAnswerUpdate);
    EventBus.on('show_waiting_screen', handleShowWaitingScreen);

  };

  // Affiche l'écran d'attente
  const handleShowWaitingScreen = () => {
    waiting.value = true;
  };

  // Mis à jour du projet
  const handleProjectUpdate = (data) => {
    projectName.value = data.projectName;
    roles.value.scrumMaster = data.roles.scrumMaster;
    roles.value.productOwner = data.roles.productOwner;
    roles.value.developers = data.roles.developers;
    console.log(`Projet mis à jour par: ${data.user}`);
  };

  const handleSmartUpdate = (data) => {
    if (data.group_id === group.id && data.phase_id === currentPhaseDetails.value.id) {
      smartObjectives.value = data.smart_details;
      console.log(`SMART Objectives mis à jour par: ${data.user}`);
    }
  };

  const handleUserStoryUpdate = (data) => {
    createdUserStoryIds.value = data.userStories;
    gameStore.setCreatedUserStoryIds(data.userStories);
    console.log(`User stories updated by: ${data.user}`);
  };

  const updateCreatedUserStories = (userStories, user) => {
    websocketService.updateCreatedUserStories(groupId, userStories, user);
  };

  // Mis à jour du statut de la phase
  const handlePhaseStatusUpdate = (data) => {
      if (data.group_id === group.id && data.phase_id === currentPhaseDetails.value.id) {
        if (data.status === 'wrong') {
          waiting.value = false;
        }
      }
  };
    
  // Mis à jour de la réponse de la phase
  const handlePhaseAnswerUpdate = (data) => {
      console.log('Websocket envoie de la réponse de la phase:', data);
  };
  
  // Utilisateur rejoint le groupe
  const handleUserJoinedGroup = (data) => {
    console.log('Un utilisateur a rejoint le groupe:', data);
    fetchGroupMembers();
  };
  
  // Utilisateur quitte le groupe
  const handleUserLeftGroup = (data) => {
    console.log('Un utilisateur a quitté le groupe:', data);
    fetchGroupMembers();
  };

  // Verrouille un élément
  const handleLockElement = (data) => {
    lockedElements.value = { ...lockedElements.value, [data.element_id]: data.user };
  };

  // Déverrouille un élément
  const handleUnlockElement = (data) => {
    const updatedLockedElements = { ...lockedElements.value };
    delete updatedLockedElements[data.element_id];
    lockedElements.value = updatedLockedElements;
  };

  // Verrouille un élément (websockets)
  const lockElement = (elementId) => {
    if (currentUser.value) {
      websocketService.lockElement(groupId, elementId, currentUser.value);
    } else {
      console.error('L\'utilisateur actuel n\'est pas défini.');
    }
  };

  // Déverrouille un élément (websockets)
  const unlockElement = (elementId) => {
    if (currentUser.value) {
      websocketService.unlockElement(groupId, elementId, currentUser.value);
    } else {
      console.error('L\'utilisateur actuel n\'est pas défini.');
    }
  };

  // Soumet une réponse de groupe
  const submitGroupAnswer = async (answerData) => {
    try {
      const phaseId = currentPhaseDetails.value.id;
      await gamesService.submitAnswer(groupId,phaseId, answerData, currentUser.value);
    } catch (error) {
      console.error('Erreur lors de la soumission de la réponse du groupe:', error);
    }
  };

  // Check si besoin validation et soumet les données de la phase
  const checkValidationAndSendAnswer = async (answerData) => {
      try {
        await submitGroupAnswer(answerData);
  
        if (currentPhaseDetails.value.requires_validation) {
          websocketService.sendPhaseStatusUpdate(groupId, currentPhaseDetails.value.id, 'pending');
          websocketService.sendPhaseAnswerUpdate(groupId, currentPhaseDetails.value.id, answerData);
        } else {
          const nextPhaseId = currentPhaseDetails.value.id + 1;
          await gamesService.updatePhaseStatus(groupId, currentPhaseDetails.value.id, 'completed');
          websocketService.sendPhaseStatusUpdate(groupId, currentPhaseDetails.value.id, 'completed');
  
          await gamesService.updatePhaseStatus(groupId, nextPhaseId, 'in_progress');
          websocketService.sendPhaseStatusUpdate(groupId, nextPhaseId, 'in_progress');
  
          websocketService.sendPhaseAnswerUpdate(groupId, currentPhaseDetails.value.id, answerData);

          await gamesService.createProject(groupId, answerData);
        }
      } catch (error) {
        console.error('Erreur lors de la validation et soumission des données de la phase:', error);
      }
  };

  // Récupère les phases du jeu
  const fetchPhases = async () => {
    try {
      const response = await gamesService.fetchPhases();  
      phases.value = response;
      return phases.value;
    } catch (error) {
      console.error('Erreur lors de la récupération des phases:', error);
    }
  };

  // Récupère la réponse d'une phase d'un groupe
  const fetchGroupPhaseAnswer = async (groupId, phaseId) => {
    try {
      const response = await gamesService.getGroupPhaseAnswer(groupId, phaseId);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de la réponse de la phase du groupe:', error);
      return null;
    }
  };

  // Valide une phase
  const validatePhase = async (groupId, phaseId, isCorrect, answerData) => {
    try {
      const status = isCorrect ? 'completed' : 'wrong';
      await gamesService.updatePhaseStatus(groupId, phaseId, status);
      websocketService.sendPhaseStatusUpdate(groupId, phaseId, status);
  
      if (isCorrect) {
        if (phaseId === 1) {
          await gamesService.createProject(groupId, answerData);
        }
        const nextPhaseId = phaseId + 1;
        await gamesService.updatePhaseStatus(groupId, nextPhaseId, 'in_progress');
        websocketService.sendPhaseStatusUpdate(groupId, nextPhaseId, 'in_progress');
      } else {
        waiting.value = false;
      }
    } catch (error) {
      console.error('Erreur lors de la validation de la phase:', error);
    }
  };

  // Affiche l'écran d'attente
  const showWaitingScreen = () => {
    if (currentUser.value) {
      websocketService.showWaitingScreen(groupId, currentUser.value);
    } else {
      console.error('L\'utilisateur actuel n\'est pas défini.');
    }
  };

  // Récupère les user stories
  const fetchUserStories = async (groupId, storyIds = []) => {
    try {
      const response = await gamesService.fetchUserStories(groupId, storyIds);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des User Stories:', error);
      throw error;
    }
  };

  // Récupère les user stories à couper
  const fetchUserStoriesToCut = async (groupId) => {
    try {
      const userStories = await gamesService.fetchToCutUserStories(groupId);
      existingUserStories.value = userStories;
    } catch (error) {
      console.error('Erreur lors de la récupération des user stories à couper:', error);
    }
  };

  // Ajoute une user story
  const addUserStory = async (storyData) => {
    try {
      storyData.groupId = groupId; 
      const response = await gamesService.addUserStory(storyData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la création de la User Story:', error);
      throw error;
    }
  };

  // Supprime une user story
  const deleteUserStory = async (groupId, storyId) => {
    try {
      console.log(`Deleting user story with ID ${storyId} for group ${groupId}`); // Debugging
      const response = await gamesService.deleteUserStory(groupId, storyId);
      return response;
    } catch (error) {
      console.error('Erreur lors de la suppression de la User Story:', error);
      throw error;
    }
  };

  onMounted(() => {
    fetchCurrentUser();
    fetchCurrentPhase();
  });

  return {
    groupMembers,
    lockedElements,
    currentUser,
    currentPhase,
    currentPhaseDetails,
    currentPhaseAnswer,
    isLoadingPhaseDetails,
    waiting,
    phasesStatus,
    phases,
    existingUserStories,
    fetchGroupMembers,
    setupWebSocket,
    cleanupWebSocket,
    lockElement,
    unlockElement,
    showWaitingScreen,
    fetchCurrentPhase,
    submitGroupAnswer,
    checkValidationAndSendAnswer,
    fetchGroupPhaseAnswer,
    fetchGroupPhasesStatus,
    fetchPhases,
    fetchPhaseDetails,
    validatePhase,
    fetchUserStoriesToCut,
    addUserStory,
    deleteUserStory,
    fetchUserStories,
    updateCreatedUserStories
  };
}
