import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
  }),
  actions: {
    login() {
      this.isAuthenticated = true;
      console.log('Logged in, Is Authenticated:', this.isAuthenticated);
    },
    logout() {
      this.isAuthenticated = false;
      localStorage.removeItem('jwt');
      console.log('Logged out, Is Authenticated:', this.isAuthenticated);
    },
    checkAuth() {
      const token = localStorage.getItem('jwt');
      this.isAuthenticated = !!token;
      console.log('Check Auth, Is Authenticated:', this.isAuthenticated);
    }
  }
});
