import axios from '@/axiosConfig';
import websocketService from './websocketService';
import userService from '@/services/usersService';

// FONCTIONS POUR LA GESTION DES SESSIONS ET LEUR APPEL API VIA AXIOS

// Gère les erreurs renvoyées par Axios
const handleAxiosError = (error) => {
  const errorMessage = error.response?.data?.detail || 'Erreur inconnue';
  throw new Error(errorMessage);
};

// Crée une session
const createSession = async (sessionData) => {
  try {
    const currentUser = await userService.getCurrentUser();
    sessionData.created_by = currentUser.id; 
    const response = await axios.post('api/sessions/create/', sessionData);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Supprime une session
const deleteSession = async (sessionId) => {
  try {
    const response = await axios.delete(`api/sessions/${sessionId}/delete/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Démarre une session
const startSession = async (sessionId) => {
  try {
    const response = await axios.post(`/api/sessions/${sessionId}/start/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Arrête une session
const stopSession = async (sessionId) => {
  try {
    const response = await axios.post(`/api/sessions/${sessionId}/stop/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère toutes les sessions
const getAllSessions = async () => {
  try {
    const response = await axios.get('api/sessions/list/');
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les détails d'une session
const getSessionDetails = async (sessionId) => {
  try {
    const response = await axios.get(`/api/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les sessions créées par un utilisateur
const getSessionsByUser = async (userId) => {
  try {
    const response = await axios.get(`api/sessions/?created_by=${userId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les sessions d'un utilisateur
const fetchSessions = async (userId) => {
  try {
    return await getSessionsByUser(userId);
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les sessions créées par un utilisateur
const fetchCreatedSessions = async () => {
  try {
    const response = await axios.get('api/sessions/created-list/');
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les groupes d'une session
const fetchGroups = async (sessionId) => {
  try {
    const response = await axios.get(`api/sessions/${sessionId}/groups/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Récupère les détails d'un groupe
const fetchGroupDetail = async (groupId) => {
  try {
    const response = await axios.get(`/api/sessions/group/${groupId}/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Rejoint une session
const joinSession = async (sessionId, groupId, password) => {
  try {
    const response = await axios.post('/api/sessions/join/', { sessionId, groupId, password });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

// Quitte une session
const leaveSession = async (sessionId, userId) => {
  try {
    const response = await axios.post(`/api/sessions/${sessionId}/leave/`, { userId });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

//Enlève un groupe d'une session
const ejectGroupFromSession = async (groupId) => {
  try {
    const response = await axios.post(`/api/sessions/remove-from-session/${groupId}/`);
    return response.data;
  } catch (error) {
    console.error('Error ejecting group from session:', error);
    handleAxiosError(error);
  }
};

// Récupère les sessions rejointes par un utilisateur
const getJoinedSession = async (userId) => {
  try {
    const response = await axios.get(`/api/sessions/joined/?userId=${userId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};


// Récupère les informations d'une session pour un utilisateur
const getUserSessionInfo = async (userId) => {
  try {
    const response = await axios.get(`/api/sessions/user-info/?userId=${userId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};


export default {
  createSession,
  getAllSessions,
  getSessionsByUser,
  deleteSession,
  fetchSessions,
  fetchCreatedSessions,
  fetchGroups,
  fetchGroupDetail,
  joinSession,
  getJoinedSession,
  getUserSessionInfo,
  leaveSession,
  getSessionDetails,
  startSession,
  stopSession,
  ejectGroupFromSession
};
