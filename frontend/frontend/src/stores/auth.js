import { defineStore } from 'pinia';
import axios from 'axios';

axios.defaults.withCredentials = true;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    userRole: null,
  }),
  actions: {
    async login(email, password) {
      try {
        const response = await axios.post('http://localhost:8000/api/login', {
          email,
          password,
        });

        if (response.data.jwt && response.data.role) {
          this.isAuthenticated = true;
          this.userRole = response.data.role;
          localStorage.setItem('jwt', response.data.jwt);
          localStorage.setItem('userRole', response.data.role);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.jwt}`;
          return true; 
        } else {
          return false; 
        }
      } catch (error) {
        console.error('Error:', error);
        this.isAuthenticated = false;
        this.userRole = null;
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
      console.log('Sending registration data:', payload); // Log the payload
      try {
        const response = await axios.post('http://localhost:8000/api/register', payload);

        console.log('Register response:', response.data);
        const token = response.data.jwt;
        if (token) {
          this.isAuthenticated = true;
          this.userRole = role;
          localStorage.setItem('jwt', token);
          localStorage.setItem('userRole', role);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          return true;
        } else {
          return false;
        }
      } catch (error) {
        console.error('Error:', error.response ? error.response.data : error);
        return false;
      }
    },
    async logout() {
      try {
        await axios.post('http://localhost:8000/api/logout');
        this.isAuthenticated = false;
        this.userRole = null;
        localStorage.removeItem('jwt');
        localStorage.removeItem('userRole');
        delete axios.defaults.headers.common['Authorization'];
        return true;
      } catch (error) {
        console.error('Error:', error);
        return false;
      }
    },
    async fetchUserRole() {
      try {
        const response = await axios.get('http://localhost:8000/api/user');
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
  },
});
