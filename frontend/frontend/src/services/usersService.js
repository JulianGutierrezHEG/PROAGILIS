import axios from 'axios';

const getCurrentUser = async () => {
  try {
    const response = await axios.get('/api/users/auth/users/me/');
    console.log('Current user:', response.data); 
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error.response);
    throw new Error('Error fetching current user: ' + (error.response?.data?.detail || 'Unknown error occurred'));
  }
};

export default {
  getCurrentUser,
};