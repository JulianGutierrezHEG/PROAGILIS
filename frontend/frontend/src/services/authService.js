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

  const signUp = async () => {
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
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error);
    }
  };

  const signIn = async () => {
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
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
      authStore.clearAuthData();
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

  const fetchUserRole = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/userAuth');
      if (response.data.role) {
        authStore.userRole = response.data.role;
        localStorage.setItem('userRole', response.data.role);
      } else {
        console.error('Error: Unable to fetch user role');
      }
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

  return {
    data,
    signUp,
    signIn,
    logout,
    isAuthenticated: computed(() => authStore.isAuthenticated),
    checkAuth,
    fetchUserRole,
  };
}
