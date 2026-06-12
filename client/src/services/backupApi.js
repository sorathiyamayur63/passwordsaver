import axios from 'axios';
const api = axios.create({ baseURL: '/api/backup', withCredentials: true });
api.interceptors.response.use(res => res.data, err => Promise.reject(err.response?.data || err));

export const backupApi = {
  getBackupPayload: () => api.get('/export'),
  restoreBackup: (payload) => api.post('/import', payload)
};