import axios from 'axios';

// FONCTIONS POUR LA GESTION DES PARTIES ET LEUR APPEL API VIA AXIOS

// Gère les erreurs renvoyées par Axios
const handleAxiosError = (error) => {
  if (error.response) {
    console.error('Erreur de réponse:', error.response);
    if (error.response.status === 404) {
      console.error('Pas trouvé.');
    }
  } else if (error.request) {
    console.error('Pas de réponse reçue:', error.request);
  } else {
    console.error('Erreur:', error.message);
  }
};

// Récupère le contrôle du temps de jeu
const getGameTimeControl = async () => {
  try {
      const response = await axios.get(`/api/games/game-time-control/`);
      return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les détails d'une phase
const getPhaseDetails = async (phaseId) => {
  try {
    const response = await axios.get(`/api/games/phase/${phaseId}/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les membres d'un groupe
const getGroupMembers = async () => {
  try {
    const response = await axios.get('/api/games/group/members/');
    console.log('Group members response:', response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère la phase actuelle d'un groupe
const getGroupCurrentPhase = async (groupId) => {
  try {
    const response = await axios.get(`/api/games/group/${groupId}/current-phase/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
    return null;
  }
};

// Soumet une réponse à une phase
const submitAnswer = async (groupId,phaseId, answerData, user) => {
  try {
    const response = await axios.post(`/api/games/group/${groupId}/phase/${phaseId}/submit-answer/`, {
      answer: answerData,
      user: user,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les phases du jeu
const fetchPhases = async () => {
  try {
    const response = await axios.get('/api/games/phases/');
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère la réponse à une phase d'un groupe
const getGroupPhaseAnswer = async (groupId, phaseId) => {
  try {
    const response = await axios.get(`/api/games/group/${groupId}/phase/${phaseId}/answer/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère le statut des phases d'un groupe
const getGroupPhasesStatus = async (groupId) => {
  try {
    const response = await axios.get(`/api/games/group/${groupId}/phases-status/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les détails d'un projet pour un groupe
const fetchProjectDetails = async (groupId) => {
  try {
    const response = await axios.get(`/api/games/group/${groupId}/project-details/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Met à jour le statut d'une phase
const updatePhaseStatus = async (groupId, phaseId, status) => {
  try {
    const response = await axios.post(`/api/games/group/${groupId}/phase/${phaseId}/update-status/`, { status });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Crée un projet pour un groupe
const createProject = async (groupId, answerData) => {
  try {
    const response = await axios.post(`/api/games/group/${groupId}/create-project/`, answerData);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les user stories d'un groupe
const fetchUserStories = async (groupId, storyIds = []) => {
  try {
    const response = await axios.post(`/api/games/group/${groupId}/fetch-userstories/`, { ids: storyIds });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les user stories à découper
const fetchToCutUserStories = async (groupId) => {
  try {
    const response = await axios.get(`/api/games/fetch-userstories-to-cut/${groupId}/`);
    console.log('User stories to cut:', response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les user stories créées
const fetchCreatedUserStories  = async (groupId) => {
  try {
    const response = await axios.get(`/api/games/group/${groupId}/fetch-created-userstories/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Ajoute une user story
const addUserStory = async (storyData) => {
  try {
    const response = await axios.post(`/api/games/group/${storyData.groupId}/add-userstory/`, storyData);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Supprime une user story
const deleteUserStory = async (groupId, storyId) => {
  try {
    const response = await axios.delete(`/api/games/group/${groupId}/delete-userstory/${storyId}/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Met à jour les détails d'une user story
const updateUserStoryDetails = async (groupId, storyId, storyData) => {
  try {
    const response = await axios.put(`/api/games/group/${groupId}/update-userstory/${storyId}/`, storyData);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Met à jour les champs d'un sprint d'une user story
const updateSprintFields = async (groupId, userStoryIds, originalSprintNumber) => {
  try {
    const response = await axios.put(`/api/games/group/${groupId}/update-sprint-fields/`, {
      user_story_ids: userStoryIds,
      original_sprint_number: originalSprintNumber
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Crée un sprint pour un groupe
const createSprint = async (groupId, sprintData) => {
  try {
    const response = await axios.post(`/api/games/group/${groupId}/create-sprint/`, sprintData);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les détails d'un sprint
const getSprintDetails = async (groupId) => {
  try {
    const response = await axios.get(`/api/games/group/${groupId}/sprint-details/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les user stories d'un sprint
const getSprintUserStories = async (groupId) => {
  try {
    const response = await axios.get(`/api/games/group/${groupId}/sprint-user-stories/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Met à jour le progrès d'un sprint
const updateSprintProgress = async (groupId, sprintId) => {
  try {
    const response = await axios.post(`/api/games/group/${groupId}/update-sprint-progress/${sprintId}/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Met à jour le progrès d'une user story
const updateUserStoryProgress = async (groupId, sprintId, userStoryId) => {
  try {
    const response = await axios.post(`/api/games/group/${groupId}/update-user-story-progress/${sprintId}/${userStoryId}/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère le progrès d'un sprint
const getSprintProgress = async (groupId, sprintId) => {
  try {
    const response = await axios.get(`/api/games/group/${groupId}/sprint-progress/${sprintId}/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère le progrès des user stories d'un sprint
const getUserStoriesProgress = async (groupId, sprintId) => {
  try {
    const response = await axios.get(`/api/games/group/${groupId}/user-stories-progress/${sprintId}/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Termine une user story
const completeUserStory = async (groupId, sprintId, storyId) => {
  try {
    const response = await axios.post(`/api/games/group/${groupId}/sprint/${sprintId}/complete-user-story/${storyId}/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère un événement aléatoire
const fetchSprintRandomEvent = async (groupId) => {
  try {
    const response = await axios.get(`/api/games/group/${groupId}/fetch-random-event/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère un commentaire client aléatoire
const fetchSprintRandomClientComment = async (groupId) => {
  try {
    const response = await axios.get(`/api/games/group/${groupId}/fetch-random-client-comment/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
}

// Met à jour la réponse à un événement
const updateEventAnswer = async (groupId, eventId, answer) => {
  try {
    const response = await axios.post(`/api/games/group/${groupId}/event/${eventId}/update-answer/`, { answer });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les événements
const getEvents = async (groupId, eventIds) => {
  try {
    const response = await axios.post(`/api/games/group/${groupId}/get-events/`, { eventIds });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les événements répondus
const fetchAnsweredEvents = async (groupId) => {
  try {
    const response = await axios.get(`/api/games/group/${groupId}/fetch-answered-events/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Sauvegarde les données de la partie
const saveGameData = async (groupId) => {
  try {
    const response = await axios.post(`/api/games/save-game-data/${groupId}/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Supprime un projet
const deleteProject = async (groupId) => {
  try {
    const response = await axios.delete(`/api/games/delete-project/${groupId}/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Boucle la partier pour passer au sprint suivant
const loopGame = async (groupId) => {
  try {
    const response = await axios.post(`/api/games/loop/${groupId}/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};



export default {
  getGroupMembers,
  getGroupCurrentPhase,
  getPhaseDetails,
  submitAnswer,
  getGroupPhaseAnswer,
  getGroupPhasesStatus,
  fetchPhases,
  updatePhaseStatus,
  createProject,
  fetchUserStories,
  fetchToCutUserStories,
  addUserStory,
  deleteUserStory,
  updateUserStoryDetails,
  fetchProjectDetails,
  fetchCreatedUserStories,
  createSprint,
  getSprintDetails,
  getSprintUserStories,
  updateSprintFields,
  getGameTimeControl,
  updateSprintProgress,
  updateUserStoryProgress,
  getSprintProgress,
  getUserStoriesProgress,
  completeUserStory,
  fetchSprintRandomEvent,
  fetchSprintRandomClientComment,
  updateEventAnswer,
  getEvents,
  fetchAnsweredEvents,
  saveGameData,
  deleteProject,
  loopGame,
};


