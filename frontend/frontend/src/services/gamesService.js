import axios from 'axios';

// FONCTIONS POUR LA GESTION DES PARTIES ET LEUR APPEL API VIA AXIOS

// Gère les erreurs renvoyées par Axios
const handleAxiosError = (error) => {
  const errorMessage = error.response?.data?.detail || 'Erreur inconnue';
  throw new Error(errorMessage);
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
  }
};

// Soumet une réponse à une phase
const submitAnswer = async (groupId, answerData, user) => {
  try {
    const response = await axios.post(`/api/games/group/${groupId}/submit-answer/`, {
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
};


