import axios from 'axios';
//for deployee const api = axios.create({ baseURL: '/api/backup', withCredentials: true });

const api_url =
  import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${api_url}/api/backup`,
  withCredentials: true
});

api.interceptors.response.use(res => res.data, err => Promise.reject(err.response?.data || err));

export const backupApi = {
  getBackupPayload: () => api.get('/export'),
  restoreBackup: (payload) => api.post('/import', payload)
};