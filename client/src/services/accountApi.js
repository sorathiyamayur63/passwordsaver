import axios from 'axios';

//for deployee  const api = axios.create({ baseURL: '/api/account', withCredentials: true });
const api_url =
  import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${api_url}/api/account`,
  withCredentials: true
});


api.interceptors.response.use(res => res.data, err => Promise.reject(err.response?.data || err));

export const accountApi = {
  getProfile: () => api.get('/profile'),
  updateUsername: (data) => api.put('/username', data),
  deleteAccount: (data) => api.delete('/', { data }),
  // Trigger file download correctly
  exportData: () => {
   // window.open('/api/account/export', '_blank');
   window.open(`${api_url}/api/account/export`, '_blank');
  }
};