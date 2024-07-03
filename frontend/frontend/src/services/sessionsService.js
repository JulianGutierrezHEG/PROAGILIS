import axios from 'axios';
import userService from './usersService';


const createSession = async (sessionData) => {
  try {
    const currentUser = await userService.getCurrentUser();
    sessionData.created_by = currentUser.id; 
    const response = await axios.post('api/sessions/create/', sessionData);
    return response.data;
  } catch (error) {
    console.error('Error creating session:', error.response);
    const errorMessage = error.response?.data?.detail || 'Unknown error occurred';
    throw new Error('Error creating session: ' + errorMessage);
  }
};

const startSession = async (sessionId) => {
  try {
    const response = await axios.post(`/api/sessions/${sessionId}/start/`);
    return response.data;
  } catch (error) {
    console.error('Error starting session:', error.response);
    throw new Error('Error starting session: ' + (error.response?.data?.detail || 'Unknown error occurred'));
  }
};

const stopSession = async (sessionId) => {
  try {
    const response = await axios.post(`/api/sessions/${sessionId}/stop/`);
    return response.data;
  } catch (error) {
    console.error('Error stopping session:', error.response);
    throw new Error('Error stopping session: ' + (error.response?.data?.detail || 'Unknown error occurred'));
  }
};

const getAllSessions = async () => {
  try {
    const response = await axios.get('api/sessions/');
    return response.data;
  } catch (error) {
    console.error('Error fetching sessions:', error.response);
    throw new Error('Error fetching sessions: ' + (error.response?.data?.detail || 'Unknown error occurred'));
  }
};

const getSessionDetails = async (sessionId) => {
  try {
    const response = await axios.get(`/api/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching session details:', error.response);
    throw new Error('Error fetching session details: ' + (error.response?.data?.detail || 'Unknown error occurred'));
  }
};

const getSessionsByUser = async (userId) => {
  try {
    const response = await axios.get(`api/sessions/?created_by=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sessions by user:', error.response);
    throw new Error('Error fetching sessions by user: ' + (error.response?.data?.detail || 'Unknown error occurred'));
  }
};

const deleteSession = async (sessionId) => {
  try {
    const response = await axios.delete(`api/sessions/${sessionId}/delete/`);
    return response.data;
  } catch (error) {
    console.error('Error deleting session:', error.response);
    throw new Error('Error deleting session: ' + (error.response?.data?.detail || 'Unknown error occurred'));
  }
};

const fetchSessions = async (userId) => {
  try {
    const sessions = await getSessionsByUser(userId);
    return sessions;
  } catch (error) {
    console.error('Error fetching sessions:', error);
    throw error;
  }
};

const fetchGroups = async (sessionId) => {
  try {
    const response = await axios.get(`api/sessions/${sessionId}/groups/`);
    console.log('Fetched groups:', response.data);  
    return response.data;
  } catch (error) {
    console.error('Error fetching groups:', error.response);
    throw new Error('Error fetching groups: ' + (error.response?.data?.detail || 'Unknown error occurred'));
  }
};

const joinSession = async (sessionId, groupId, password) => {
  try {
    const response = await axios.post('/api/sessions/join/', { sessionId, groupId, password });
    return response.data;
  } catch (error) {
    console.error('Error joining session:', error.response);
    throw new Error('Error joining session: ' + (error.response?.data?.detail || 'Unknown error occurred'));
  }
};

const leaveSession = async (sessionId, userId) => {
  try {
    const response = await axios.post(`/api/sessions/${sessionId}/leave/`, { userId });
    return response.data;
  } catch (error) {
    console.error('Error leaving session:', error.response);
    throw new Error('Error leaving session: ' + (error.response?.data?.detail || 'Unknown error occurred'));
  }
};

const getJoinedSession = async (userId) => {
  try {
    const response = await axios.get(`/api/sessions/joined/?userId=${userId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null; 
    } else {
      console.error('Error fetching joined session:', error.response);
      throw new Error('Error fetching joined session: ' + (error.response?.data?.detail || 'Unknown error occurred'));
    }
  }
};

const getUserSessionInfo = async (userId) => {
  try {
    const response = await axios.get(`/api/sessions/user-info/?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user session info:', error.response);
    throw new Error('Error fetching user session info: ' + (error.response?.data?.detail || 'Unknown error occurred'));
  }
};



export default {
  createSession,
  getAllSessions,
  getSessionsByUser,
  deleteSession,
  fetchSessions,
  fetchGroups,
  joinSession,
  getJoinedSession,
  getUserSessionInfo,
  leaveSession,
  getSessionDetails,
  startSession,
  stopSession,
};
