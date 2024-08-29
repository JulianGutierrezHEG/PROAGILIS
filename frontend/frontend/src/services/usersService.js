import axios from 'axios';

// utilisation de djoser: Permet de récupérer les informations de l'utilisateur connecté
const getCurrentUser = async () => {
  try {
    const response = await axios.get('/api/users/auth/users/me/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur connecté: ', error.response?.data?.detail || error.message);
    throw new Error('Erreur lors de la récupération de l\'utilisateur connecté');
  }
};

export default {
  getCurrentUser,
};