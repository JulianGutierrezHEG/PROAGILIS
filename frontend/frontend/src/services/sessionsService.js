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

const getAllSessions = async () => {
  try {
    const response = await axios.get('api/sessions/');
    return response.data;
  } catch (error) {
    console.error('Error fetching sessions:', error.response);
    throw new Error('Error fetching sessions: ' + (error.response?.data?.detail || 'Unknown error occurred'));
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


  const  fetchSessions = async (userId) =>{
    try {
      const sessions = await getSessionsByUser(userId);
      return sessions;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  };


export default {
  createSession,
  getAllSessions,
  getSessionsByUser,
  deleteSession,
  fetchSessions,
};
