import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const access = ref('');
  const refresh = ref('');
  const isAuthenticated = computed(() => !!access.value);
  const role = ref('');

  // Initialise le store avec les valeurs stockées dans le sessionStorage
  function initializeStore() {
    const storedAccess = sessionStorage.getItem('access');
    const storedRefresh = sessionStorage.getItem('refresh');
    const storedRole = sessionStorage.getItem('role');
    if (storedAccess) {
      access.value = storedAccess;
      refresh.value = storedRefresh;
      role.value = storedRole;
    } else {
      access.value = '';
      refresh.value = '';
      role.value = '';
    }
  }

  function setAccess(newAccess) {
    access.value = newAccess;
  }

  function setRefresh(newRefresh) {
    refresh.value = newRefresh;
  }

  function removeAccess() {
    access.value = '';
    refresh.value = '';
  }

  function setUserRole(newRole) {
    role.value = newRole;
    sessionStorage.setItem('role', newRole);
  }

  return { access, refresh, isAuthenticated,role, initializeStore, setAccess, setRefresh, removeAccess,setUserRole };
});