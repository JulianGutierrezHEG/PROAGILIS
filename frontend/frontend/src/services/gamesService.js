import axios from 'axios';

const handleAxiosError = (error) => {
  const errorMessage = error.response?.data?.detail || 'Unknown error occurred';
  throw new Error(errorMessage);
};

const getPhaseDetails = async (phaseId) => {
  try {
    const response = await axios.get(`/api/games/phase/${phaseId}/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const getGroupMembers = async () => {
  try {
    const response = await axios.get('/api/games/group/members/');
    console.log('Group members response:', response.data);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const getGroupCurrentPhase = async (groupId) => {
  try {
    const response = await axios.get(`/api/games/group/${groupId}/current-phase/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const submitAnswer = async (groupId, answerData, user) => {
  try {
    const response = await axios.post(`/api/games/group/${groupId}/submit-answer/`, {
      answer: answerData,
      user: user,
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const getGroupCurrentPhaseAnswer = async (groupId) => {
  try {
    const response = await axios.get(`/api/games/group/${groupId}/current-phase/answer/`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

export default {
  getGroupMembers,
  getGroupCurrentPhase,
  getPhaseDetails,
  submitAnswer,
  getGroupCurrentPhaseAnswer,
};


