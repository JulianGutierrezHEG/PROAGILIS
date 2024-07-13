import axios from '@/axiosConfig';
import userService from '@/services/usersService';

const handleAxiosError = (error) => {
  const errorMessage = error.response?.data?.detail || 'Unknown error occurred';
  throw new Error(errorMessage);
};

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

const deleteSession = async (sessionId) => {
  try {
    const response = await axios.delete(`api/sessions/${sessionId}/delete/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const startSession = async (sessionId) => {
  try {
    const response = await axios.post(`/api/sessions/${sessionId}/start/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const stopSession = async (sessionId) => {
  try {
    const response = await axios.post(`/api/sessions/${sessionId}/stop/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const getAllSessions = async () => {
  try {
    const response = await axios.get('api/sessions/list/');
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const getSessionDetails = async (sessionId) => {
  try {
    const response = await axios.get(`/api/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const getSessionsByUser = async (userId) => {
  try {
    const response = await axios.get(`api/sessions/?created_by=${userId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const fetchSessions = async (userId) => {
  try {
    return await getSessionsByUser(userId);
  } catch (error) {
    handleAxiosError(error);
  }
};

const fetchCreatedSessions = async () => {
  try {
    const response = await axios.get('api/sessions/created-list/');
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const fetchGroups = async (sessionId) => {
  try {
    const response = await axios.get(`api/sessions/${sessionId}/groups/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const fetchGroupDetail = async (groupId) => {
  try {
    const response = await axios.get(`/api/sessions/group/${groupId}/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const joinSession = async (sessionId, groupId, password) => {
  try {
    const response = await axios.post('/api/sessions/join/', { sessionId, groupId, password });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const leaveSession = async (sessionId, userId) => {
  try {
    const response = await axios.post(`/api/sessions/${sessionId}/leave/`, { userId });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const getJoinedSession = async (userId) => {
  try {
    const response = await axios.get(`/api/sessions/joined/?userId=${userId}`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};


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
};
