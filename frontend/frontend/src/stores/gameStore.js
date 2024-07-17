import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', () => {
  const createdUserStoryIds = ref([]);
  const initialUserStoriesFetched = ref(false);
  const userStoriesToCut = ref([]);

  function initializeStore() {
    const storedCreatedUserStoryIds = sessionStorage.getItem('createdUserStoryIds');
    if (storedCreatedUserStoryIds) {
      createdUserStoryIds.value = JSON.parse(storedCreatedUserStoryIds);
    }
    const storedInitialUserStoriesFetched = sessionStorage.getItem('initialUserStoriesFetched');
    if (storedInitialUserStoriesFetched) {
      initialUserStoriesFetched.value = JSON.parse(storedInitialUserStoriesFetched);
    }
    const storedUserStoriesToCut = sessionStorage.getItem('userStoriesToCut');
    if (storedUserStoriesToCut) {
      userStoriesToCut.value = JSON.parse(storedUserStoriesToCut);
    }
  }

  function addCreatedUserStoryId(id) {
    createdUserStoryIds.value.push(id);
    sessionStorage.setItem('createdUserStoryIds', JSON.stringify(createdUserStoryIds.value));
  }

  function clearCreatedUserStoryIds() {
    createdUserStoryIds.value = [];
    sessionStorage.removeItem('createdUserStoryIds');
  }

  function setInitialUserStoriesFetched(value) {
    initialUserStoriesFetched.value = value;
    sessionStorage.setItem('initialUserStoriesFetched', JSON.stringify(value));
  }

  function setUserStoriesToCut(stories) {
    userStoriesToCut.value = stories;
    sessionStorage.setItem('userStoriesToCut', JSON.stringify(stories));
  }

  return {
    createdUserStoryIds,
    initialUserStoriesFetched,
    userStoriesToCut,
    initializeStore,
    addCreatedUserStoryId,
    clearCreatedUserStoryIds,
    setInitialUserStoriesFetched,
    setUserStoriesToCut,
  };
});
