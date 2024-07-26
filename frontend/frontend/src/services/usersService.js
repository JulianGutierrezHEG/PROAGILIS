import axios from 'axios';

// utilisation de djoser: Permet de récupérer les informations de l'utilisateur connecté
const getCurrentUser = async () => {
  try {
    const response = await axios.get('/api/users/auth/users/me/');
    return response.data;
  } catch (error) {
    console.error('Error fetching current user:', error.response);
    throw new Error('Error fetching current user: ' + (error.response?.data?.detail || 'Unknown error occurred'));
  }
};

export default {
  getCurrentUser,
};