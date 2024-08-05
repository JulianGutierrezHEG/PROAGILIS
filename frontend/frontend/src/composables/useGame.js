import { ref, onMounted } from 'vue';
import websocketService from '@/services/websocketService';
import gamesService from '@/services/gamesService';
import usersService from '@/services/usersService';
import EventBus from '@/services/eventBus';
import sessionsService from '@/services/sessionsService';
import { useRouter } from 'vue-router';


// COMPOSABLE POUR LES PARTIES, UTILISEE DANS LES VUES

export function useGame(groupId, group) {
  const router = useRouter();
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
  const phaseSpecificHandlers = ref({});
  const existingUserStories = ref([]);
  const backlog = ref([]);
  const currentSprintDetails = ref({});
  const sprintUserStories = ref([]);
  const gameTimeControl = ref({}); 
  const currentSprintProgress = ref(null);
  const isSprintRunning = ref(false);
  const eventLog = ref([]);
  const clientComment = ref([]);
  const answeredEvents = ref(null);
  const phaseDisplay = ref(null);
  const eventEffectText = ref('');


  // Récupère le contrôle du temps de jeu
  const fetchGameTimeControl = async () => {
    try {
        const response = await gamesService.getGameTimeControl();
        gameTimeControl.value = response;
    } catch (error) {
        console.error('Erreur lors de la récupération du contrôle du temps de jeu:', error);
    }
};

  // Récupère un événement aléatoire pour le sprint
  const fetchSprintRandomEvent = async (groupId) => {
    try {
      const data = await gamesService.fetchSprintRandomEvent(groupId);
      eventLog.value.push({ ...data, answer: "" });
    } catch (error) {
      console.error("Erreur lors de la récupération de l'événement:", error);
    }
  };

  // Récupère un commentaire client aléatoire pour le sprint
  const fetchSprintRandomClientComment = async (groupId) => {
    try {
      const data = await gamesService.fetchSprintRandomClientComment(groupId);
      clientComment.value = data;
    } catch (error) {
      console.error("Erreur lors de la récupération du commentaire clien:", error);
    }
  };

  // Met à jour la réponse de l'événement
  const updateEventAnswer = async (groupId, eventId, answer) => {
    try {
      await gamesService.updateEventAnswer(groupId, eventId, answer);
      const updatedEventLog = eventLog.value.map(e => 
        e.id === eventId ? { ...e, answer } : e
      );
      eventLog.value = updatedEventLog;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réponse de l\'événement:', error);
    }
  };

  // Récupère les événements
  const fetchEvents = async (groupId, eventIds) => {
    try {
      const data = await gamesService.getEvents(groupId, eventIds);
      return data;
    } catch (error) {
      console.error('Erreur lors de la récupération des événements:', error);
    }
  };

  

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

  // Récupère les événements répondus
  const fetchAnsweredEvents = async (groupId) => {
    try {
      const data = await gamesService.fetchAnsweredEvents(groupId);
      answeredEvents.value = data;
      console.log('Evénements répondus:', answeredEvents.value);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        answeredEvents.value = []; 
        console.log("Pas d'événements trouvés");
      } else {
        console.error("Erreur lors de la récupération des événements répondus:", error);
      }
    }
  };

  // Récupère l'affichage de la phase
  const fetchPhaseDisplay = async () => {
    try {
      const data = await gamesService.fetchPhaseDisplay(groupId);
      phaseDisplay.value = data;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'affichage de la phase:', error);
    }
  };

  // Récupère la phase actuelle
  const fetchCurrentPhase = async () => {
    try {
      isLoadingPhaseDetails.value = true; 
      const phaseStatus = await gamesService.getGroupCurrentPhase(groupId);
      currentPhase.value = phaseStatus.phase;
      if (!phaseStatus) {
        console.log('Phase status is null or undefined.');
        return;
      }
  

      if (phaseStatus.phase) {
        const phaseDetails = await gamesService.getPhaseDetails(phaseStatus.phase);
        currentPhaseDetails.value = phaseDetails;
      }
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

  // Récupère les détails du projet pour un groupe
  const fetchProjectDetails = async (groupId) => {
    try {
      const projectDetails = await gamesService.fetchProjectDetails(groupId);
      return projectDetails;
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
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
  
  // Mis à jour du statut de la phase
  const handlePhaseStatusUpdate = (data) => {
      if (data.group_id === group.id && data.phase_id === currentPhase.value) {
        if (data.status === 'wrong') {
          waiting.value = false;
        }
      }
  };

  // Mis à jour de la réponse de la phase
  const handlePhaseAnswerUpdate = (data) => {
      console.log('Websocket envoie de la réponse de la phase:', data);
  };

  // Affiche l'écran d'attente
  const handleShowWaitingScreen = () => {
      waiting.value = true;
  };

  // Groupe éjecté de la session
  const handleGroupEjection = (data) => {
      console.log('Groupe éjecté de la session:', data);
      router.push('/'); 
  };

  // Mise en place des gestionnaires de phase
  const setPhaseHandler = (handler) => {
    phaseSpecificHandlers.value.interfacechange = handler;
  };
  
  // Changement d'interface
  const handleInterfaceChange = (data) => {
    const handler = phaseSpecificHandlers.value.interfacechange;
    if (handler) {
      handler(data);
    }
  };


  // Mise en place des websockets et des événements
  const setupEvents = () => {
    EventBus.on('lock_element', handleLockElement);
    EventBus.on('unlock_element', handleUnlockElement);
    EventBus.on('user_joined_group', handleUserJoinedGroup);
    EventBus.on('user_left_group', handleUserLeftGroup);
    EventBus.on('phase_status_update', handlePhaseStatusUpdate);
    EventBus.on('phase_answer_update', handlePhaseAnswerUpdate);
    EventBus.on('show_waiting_screen', handleShowWaitingScreen);
    EventBus.on('group_ejected_from_session', handleGroupEjection);
    EventBus.on('interfacechange', handleInterfaceChange);
  };

  // Nettoyage des websockets et des événements
  const cleanupEvents = () => {
    EventBus.off('lock_element', handleLockElement);
    EventBus.off('unlock_element', handleUnlockElement);
    EventBus.off('user_joined_group', handleUserJoinedGroup);
    EventBus.off('user_left_group', handleUserLeftGroup);
    EventBus.off('phase_status_update', handlePhaseStatusUpdate);
    EventBus.off('phase_answer_update', handlePhaseAnswerUpdate);
    EventBus.off('show_waiting_screen', handleShowWaitingScreen);
    EventBus.off('group_ejected_from_session', handleGroupEjection);
    EventBus.off('interfacechange', handleInterfaceChange);
  };

  // Met à jour les user stories créées
  const updateCreatedUserStories = (userStories, user) => {
    websocketService.updateCreatedUserStories(groupId, userStories, user);
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
      handleShowWaitingScreen();
      showWaitingScreen();
      console.log('Waiting', waiting.value);
      try {
        await submitGroupAnswer(answerData);
        if (currentPhaseDetails.value.requires_validation) {
          websocketService.sendPhaseStatusUpdate(groupId, currentPhase.value, 'pending');
          websocketService.sendPhaseAnswerUpdate(groupId, currentPhase.value, answerData);
        } else {
          const nextPhaseId = currentPhase.value + 1;
          await gamesService.updatePhaseStatus(groupId, currentPhase.value, 'completed');
          websocketService.sendPhaseStatusUpdate(groupId, currentPhase.value, 'completed');
  
          await gamesService.updatePhaseStatus(groupId, nextPhaseId, 'in_progress');
          websocketService.sendPhaseStatusUpdate(groupId, nextPhaseId, 'in_progress');
  
          websocketService.sendPhaseAnswerUpdate(groupId, currentPhase.value, answerData);
          if(nextPhaseId===2){
            await gamesService.createProject(groupId, answerData);
          } 
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
        if (phaseId === 5) {
          const userStoryIds = answerData.userStories; 
          await gamesService.updateSprintFields(groupId, userStoryIds);
        }
  
        if (phaseId === 8) {
          const savedGameData = await gamesService.saveGameData(groupId);
  
          await gamesService.deleteProject(groupId);
  
          await gamesService.loopGame(groupId);
  
          await gamesService.updatePhaseStatus(groupId, phaseId, 'completed');
          websocketService.sendPhaseStatusUpdate(groupId, phaseId, 'completed');
  
          await gamesService.updatePhaseStatus(groupId, phaseId, 'not_started');
          websocketService.sendPhaseStatusUpdate(groupId, phaseId, 'not_started');
  
          websocketService.sendPhaseStatusUpdate(groupId, 4, 'not_started');
          await gamesService.updatePhaseStatus(groupId, 4, 'not_started');
  
          websocketService.sendPhaseStatusUpdate(groupId, 5, 'not_started');
          await gamesService.updatePhaseStatus(groupId, 5, 'not_started');
  
          websocketService.sendPhaseStatusUpdate(groupId, 6, 'not_started');
          await gamesService.updatePhaseStatus(groupId, 6, 'not_started');
  
          websocketService.sendPhaseStatusUpdate(groupId, 7, 'not_started');
          await gamesService.updatePhaseStatus(groupId, 7, 'not_started');
  
          if (savedGameData.current_sprint === 3) {
            if (savedGameData.current_sprint === 3) {
              alert(`Fin du jeu pour le groupe ${groupId}`);
              websocketService.sendMessage(groupId, {
                event: 'group_ejected_from_session',
                group_id: groupId
              });
              await sessionsService.ejectGroupFromSession(groupId);
              await gamesService.deleteProject(groupId);
              await gamesService.deleteSavedData(groupId);
            } 
          } else {
            websocketService.sendPhaseStatusUpdate(groupId, 3, 'in_progress');
            await gamesService.updatePhaseStatus(groupId, 3, 'in_progress');
          }
        } else {
          const nextPhaseId = phaseId + 1;
          await gamesService.updatePhaseStatus(groupId, nextPhaseId, 'in_progress');
          websocketService.sendPhaseStatusUpdate(groupId, nextPhaseId, 'in_progress');
        }
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
      const ids = storyIds.map(story => typeof story === 'object' ? story.id : story);
      const response = await gamesService.fetchUserStories(groupId, ids);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des User Stories:', error);
      throw error;
    }
    
  };

  // Récupère le backlog
  const fetchBacklog = async (groupId) => {
    const response = await gamesService.fetchUserStories(groupId);
    const filteredBacklog = response.filter(story => !story.is_completed);
    backlog.value = filteredBacklog;
    return filteredBacklog;
  };

  // Récupère les user stories à couper
  const fetchUserStoriesToCut = async (groupId) => {
    try {
      const userStories = await gamesService.fetchToCutUserStories(groupId);
      return userStories;
    } catch (error) {
      console.error('Erreur lors de la récupération des user stories à couper:', error);
    }
  };

  // Récupère les user stories créées
  const fetchCreatedUserStories = async () => {
    try {
      const response = await gamesService.fetchCreatedUserStories(groupId);
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des user stories créées:', error);
      throw error;
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

  // Met à jour les détails d'une user story
  const updateUserStoryDetails = async (storyId, storyData) => {
    try {
      const response = await gamesService.updateUserStoryDetails(groupId, storyId, storyData);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des détails de la User Story:', error);
      throw error;
    }
  };

  // Récupère les détails du sprint actuel
  const fetchSprintDetails = async (groupId) => {
    try {
      const data = await gamesService.getSprintDetails(groupId);
      currentSprintDetails.value = data;
    } catch (error) {
      console.error('Erreur lors de la récupération des détails du sprint:', error);
    }
  };

  // Récupère les user stories du sprint
  const fetchSprintUserStories = async (groupId) => {
    try {
      const data = await gamesService.getSprintUserStories(groupId);
      sprintUserStories.value = data;
    } catch (error) {
      console.error('Erreur lors de la récupération des user stories du sprint:', error);
    }
  };

  // Commence un sprint
  const startSprint = async (groupId, sprintId) => {
    try {
      currentSprintProgress.value = 0;
      isSprintRunning.value = true;
      await updateSprintProgress(groupId, sprintId);
      for (const story of sprintUserStories.value) {
        if (!story.is_completed) {
          await updateUserStoryProgress(groupId, sprintId, story.id);
        }
      }
    } catch (error) {
      console.error('Erreur lors du démarrage du sprint:', error);
    }
  };

  // Met à jour la progression du sprint
  const updateSprintProgress = async (groupId, sprintId) => {
    try {
      const response = await gamesService.updateSprintProgress(groupId, sprintId);
      return response;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression du sprint:', error);
    }
  };

  // Met à jour la progression de la user story
  const updateUserStoryProgress = async (groupId, sprintId, userStoryId) => {
    try {
      await gamesService.updateUserStoryProgress(groupId, sprintId, userStoryId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la progression de la user story:', error);
    }
  };
  
  // Récupère la progression du sprint
  const fetchSprintProgress = async (groupId, sprintId) => {
    try {
      const response = await gamesService.getSprintProgress(groupId, sprintId);
      currentSprintProgress.value = response;
    } catch (error) {
      console.error('Erreur lors de la récupération de la progression du sprint:', error);
    }
  };

  // Récupère la progression des user stories
  const fetchUserStoriesProgress = async (groupId, sprintId) => {
    try {
      const response = await gamesService.getUserStoriesProgress(groupId, sprintId);
      sprintUserStories.value = response;
    } catch (error) {
      console.error('Error fetching user stories progress:', error);
    }
  };

  // Applique l'effet de l'événement
  const applyEventEffect = async (groupId, eventId) => {
    try {
      const response = await gamesService.applyEventEffect(groupId, eventId);
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'application de l\'effet de l\'événement:', error);
      throw error;
    }
  };

  // Termine une user story
  const completeUserStory = async (groupId, sprintId, storyId) => {
    await gamesService.completeUserStory(groupId, sprintId, storyId);
    await fetchUserStoriesProgress(groupId, sprintId);
  };

  // Récupère les user stories complétées
  const fetchCompletedUserStories = async (groupId) => {
    await fetchSprintUserStories(groupId);
    return sprintUserStories.value.filter(story => story.is_completed);
  };

  // Récupère les user stories incomplètes d'un sprint
  const fetchIncompleteUserStories = async (groupId) => {
    await fetchSprintUserStories(groupId);
    return sprintUserStories.value.filter(story => !story.is_completed);
  };

  onMounted(() => {
    fetchCurrentUser();
  });

  return {
    gameTimeControl,
    eventLog,
    answeredEvents,
    clientComment,
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
    backlog,
    currentSprintDetails,
    sprintUserStories,
    currentSprintProgress,
    isSprintRunning,
    phaseDisplay,
    eventEffectText,
    fetchGameTimeControl,
    fetchGroupMembers,
    setupEvents,
    cleanupEvents,
    lockElement,
    unlockElement,
    showWaitingScreen,
    fetchCurrentPhase,
    submitGroupAnswer,
    checkValidationAndSendAnswer,
    fetchGroupPhaseAnswer,
    fetchGroupPhasesStatus,
    fetchProjectDetails,
    fetchPhases,
    fetchPhaseDetails,
    validatePhase,
    fetchUserStoriesToCut,
    fetchCreatedUserStories,
    addUserStory,
    deleteUserStory,
    fetchUserStories,
    updateCreatedUserStories,
    updateUserStoryDetails,
    fetchSprintDetails,
    fetchSprintUserStories,
    startSprint,
    updateSprintProgress,
    updateUserStoryProgress,
    fetchSprintProgress,
    fetchUserStoriesProgress,
    applyEventEffect,
    completeUserStory,
    fetchCompletedUserStories,
    fetchIncompleteUserStories,
    fetchSprintRandomEvent,
    updateEventAnswer,
    fetchEvents,
    fetchAnsweredEvents,
    fetchSprintRandomClientComment,
    fetchBacklog,
    fetchPhaseDisplay,
    setPhaseHandler
  };
}
