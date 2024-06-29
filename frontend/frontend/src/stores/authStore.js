import { defineStore } from 'pinia';
import axios from 'axios';

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
