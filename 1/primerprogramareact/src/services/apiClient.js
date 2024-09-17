import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://api-qe5e.onrender.com',  // URL de tu API desplegada
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
