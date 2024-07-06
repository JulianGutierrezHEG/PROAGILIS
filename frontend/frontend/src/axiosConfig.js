import axios from 'axios';

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      console.error('HTTP Error:', error.response.status, error.response.data);
    } else {
      console.error('Unknown HTTP Error:', error);
    }
    return Promise.reject(error);
  }
);

export default axios;