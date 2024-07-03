import axios from 'axios';

const updateGroupPhase = async (groupId, newPhaseName) => {
  try {
    const response = await axios.post(`/api/games/group/${groupId}/update_phase/`, { new_phase_name: newPhaseName });
    return response.data;
  } catch (error) {
    console.error('Error updating group phase:', error.response);
    throw new Error('Error updating group phase: ' + (error.response?.data?.detail || 'Unknown error occurred'));
  }
};

export default {
  updateGroupPhase,
};