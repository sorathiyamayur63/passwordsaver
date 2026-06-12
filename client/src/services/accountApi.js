import axios from 'axios';

const api = axios.create({ baseURL: '/api/account', withCredentials: true });

api.interceptors.response.use(res => res.data, err => Promise.reject(err.response?.data || err));

export const accountApi = {
  getProfile: () => api.get('/profile'),
  updateUsername: (data) => api.put('/username', data),
  deleteAccount: (data) => api.delete('/', { data }),
  // Trigger file download correctly
  exportData: () => {
    window.open('/api/account/export', '_blank');
  }
};