import { watch } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

// Initialise le store d'authentification avec les valeurs stockées dans le localStorage
export function initializeAuth() {
  const authStore = useAuthStore();
  authStore.initializeStore();
  updateAuthorizationHeader();
}

// Surveille l'authentification et supprime l'intervalle de rafraîchissement si l'utilisateur n'est plus authentifié
export function watchAuthentication() {
  const authStore = useAuthStore();
  let refreshInterval = null; 

  const startInterval = () => {
    if (refreshInterval === null) {
      refreshInterval = setInterval(getAccessAndUpdate, 59000); 
    }
  };

  const stopInterval = () => {
    if (refreshInterval !== null) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  return watch(() => authStore.isAuthenticated, (newValue) => {
    if (newValue) {
      startInterval(); 
    } else {
      stopInterval(); 
    }
  }, { immediate: true });
}

// Met à jour le header d'autorisation avec le token JWT
export function updateAuthorizationHeader() {
  const authStore = useAuthStore();
  const access = authStore.access;
  axios.defaults.headers.common['Authorization'] = access ? `JWT ${access}` : '';
}

// Récupère un nouveau token d'accès et met à jour le store d'authentification
export function getAccessAndUpdate() {
  const authStore = useAuthStore();
  console.log('Getting new access token...');
  if (!authStore.isAuthenticated) {
    console.log('User is not authenticated, skipping token refresh.');
    return;
  }

  const accessData = {
    refresh: localStorage.getItem('refresh')
  };

  axios.post('/api/users/auth/jwt/refresh/', accessData)
    .then(response => {
      const access = response.data.access;
      authStore.setAccess(access);
      localStorage.setItem('access', access);
      updateAuthorizationHeader();
    }).catch(error => {
      console.log(error);
    });
}

// Enregistre un nouvel utilisateur
export const signUp = async (formData) => {
  try {
    const response = await axios.post('/api/users/auth/users/', formData);
    return response; 
  } catch (err) {
    throw err; 
  }
};

// Connecte un utilisateur
export const signIn = async (formData) => {
  try {
    const response = await axios.post('/api/users/auth/jwt/create/', formData);
    const { access, refresh } = response.data;
    axios.defaults.headers.common['Authorization'] = "JWT " + access;
    localStorage.setItem('access', access);
    localStorage.setItem('refresh', refresh);

    const userDetailsResponse = await axios.get('/api/users/auth/users/me/', {
      headers: { Authorization: `JWT ${access}` },
    });

    return {
      access,
      refresh,
      role: userDetailsResponse.data.role,
    };
  } catch (errorResponse) {
    throw errorResponse.response?.data?.detail || 'Erreur durant la connexion';
  }
};

// Déconnecte un utilisateur
export const logout = (authStore, router) => {
  authStore.removeAccess();
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('role');
  router.push('/signin');
};