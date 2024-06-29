import { defineStore } from 'pinia';
import axios from 'axios';
import { useRouter } from 'vue-router';

axios.defaults.withCredentials = true;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    userRole: null,
  }),
  actions: {
    setAuthData(jwt, role) {
      this.isAuthenticated = true;
      this.userRole = role;
      localStorage.setItem('jwt', jwt);
      localStorage.setItem('userRole', role);
    },
    clearAuthData() {
      this.isAuthenticated = false;
      this.userRole = null;
      localStorage.removeItem('jwt');
      localStorage.removeItem('userRole');
    },
    async fetchUserRole() {
      try {
        const response = await axios.get('http://localhost:8000/api/userAuth');
        if (response.data.role) {
          this.userRole = response.data.role;
          localStorage.setItem('userRole', response.data.role);
        } else {
          console.error('Error: Unable to fetch user role');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    },
    checkAuth() {
      const token = localStorage.getItem('jwt');
      const userRole = localStorage.getItem('userRole');
      if (token) {
        this.isAuthenticated = true;
        this.userRole = userRole;
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        this.isAuthenticated = false;
        this.userRole = null;
      }
    },
    checkAuthStatus() {
      const token = localStorage.getItem('jwt');
      const userRole = localStorage.getItem('userRole');

      if (!token || !userRole) {
        this.clearAuthData();
        const router = useRouter();
        router.push('/signin');
      } else {
        this.fetchUserRole();
      }
    },
  },
});

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
