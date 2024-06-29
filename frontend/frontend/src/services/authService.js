import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import { ref, computed } from 'vue';
import axios from 'axios';

axios.defaults.withCredentials = true;

export function useAuthService() {
  const authStore = useAuthStore();
  const router = useRouter();

  const data = ref({
    username: '',
    email: '',
    password: '',
    isTeacher: false,
  });

  const error = ref('');

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    const re = /^(?=.*[A-Z])(?=.*\d).{4,}$/;
    return re.test(password);
  };

  const signUp = async () => {
    error.value = '';

    if (!validateEmail(data.value.email)) {
      error.value = "Le format de l'adresse email est incorrect.";
      return;
    }

    if (!validatePassword(data.value.password)) {
      error.value = "Le mot de passe doit avoir au moins un chiffre, une majuscule et être long de 4 caractères.";
      return;
    }

    const role = data.value.isTeacher ? 'enseignant' : 'etudiant';
    const payload = {
      username: data.value.username,
      email: data.value.email,
      password: data.value.password,
      role,
    };

    try {
      const response = await axios.post('http://localhost:8000/api/register', payload);
      const token = response.data.jwt;
      if (token) {
        authStore.setAuthData(token, role);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await router.push('/');
      }
    } catch (errorResponse) {
      if (errorResponse.response && errorResponse.response.data) {
        const { data } = errorResponse.response;
        if (data.username) {
          error.value = "Ce nom d'utilisateur existe déjà.";
        } else if (data.email) {
          error.value = "Cette adresse email existe déjà.";
        } else {
          error.value = 'Erreur lors de l’enregistrement. Veuillez réessayer.';
        }
      } else {
        console.error('Error:', errorResponse.response ? errorResponse.response.data : errorResponse);
      }
    }
  };

  const signIn = async () => {
    error.value = '';
    try {
      const response = await axios.post('http://localhost:8000/api/login', {
        email: data.value.email,
        password: data.value.password,
      });

      if (response.data.jwt && response.data.role) {
        authStore.setAuthData(response.data.jwt, response.data.role);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.jwt}`;
        await router.push('/');
      } else {
        error.value = "L'email ou le mot de passe sont incorrect";
      }
    } catch (errorResponse) {
      if (errorResponse.response && errorResponse.response.data && errorResponse.response.status === 401) {
        error.value = "L'email ou le mot de passe sont incorrect";
      } else {
        console.error('Error:', errorResponse.response ? errorResponse.response.data : errorResponse);
      }
    }
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:8000/api/logout');
      authStore.clearAuthData();
      delete axios.defaults.headers.common['Authorization'];
      await router.push('/signin');
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const checkAuth = () => {
    const token = localStorage.getItem('jwt');
    const userRole = localStorage.getItem('userRole');
    if (token) {
      authStore.isAuthenticated = true;
      authStore.userRole = userRole;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      authStore.isAuthenticated = false;
      authStore.userRole = null;
    }
  };

  const checkAuthStatus = () => {
    const token = localStorage.getItem('jwt');
    const userRole = localStorage.getItem('userRole');

    if (!token || !userRole) {
      authStore.clearAuthData();
      router.push('/signin');
    } 
  };

  const isAuthenticated = computed(() => authStore.isAuthenticated);

  return {
    data,
    error,
    signUp,
    signIn,
    logout,
    isAuthenticated,
    checkAuth,
    checkAuthStatus,
  };
}
