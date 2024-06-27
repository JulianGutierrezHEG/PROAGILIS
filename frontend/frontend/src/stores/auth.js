import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
  }),
  actions: {
    async login(email, password) {
      try {
        const response = await fetch('http://localhost:8000/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error:', errorData);
          return false;
        } else {
          this.isAuthenticated = true;
          return true;
        }
      } catch (error) {
        console.error('Error:', error);
        return false;
      }
    },
    async register(username, email, password, isTeacher) {
      const role = isTeacher ? 'enseignant' : 'etudiant';
      const payload = {
        username,
        email,
        password,
        role
      };

      try {
        const response = await fetch('http://localhost:8000/api/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Error:', errorData);
          return false;
        } else {
          return true;
        }
      } catch (error) {
        console.error('Error:', error);
        return false;
      }
    },
    async logout() {
      try {
        const response = await fetch('http://localhost:8000/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });

        if (!response.ok) {
          console.error('Error during logout');
          return false;
        } else {
          this.isAuthenticated = false;
          return true;
        }
      } catch (error) {
        console.error('Error:', error);
        return false;
      }
    },
    checkAuth() {
      this.isAuthenticated = true;
    }
  }
});
