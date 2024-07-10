import axios from 'axios';

const handleAxiosError = (error) => {
  const errorMessage = error.response?.data?.detail || 'Unknown error occurred';
  throw new Error(errorMessage);
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

export default {
  getGroupMembers,
};
