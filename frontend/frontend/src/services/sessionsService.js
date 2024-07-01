import axios from 'axios';
import userService from './usersService';

const createSession = async (sessionData) => {
  try {
    const currentUser = await userService.getCurrentUser();
    sessionData.created_by = currentUser.id; 
    console.log('Sending session data:', sessionData);
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

export default {
  createSession,
  getAllSessions,
};
