import axios from 'axios';

//for deployee const api = axios.create({ baseURL: '/api/devices', withCredentials: true });

const api_url =
  import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${api_url}/api/devices`,
  withCredentials: true
});

api.interceptors.response.use(res => res.data, err => Promise.reject(err.response?.data || err));

export const deviceApi = {
  getDevices: () => api.get('/'),
  revokeDevice: (uuid) => api.delete(`/${uuid}`),
  deleteDeviceHistory: (uuid) => api.delete(`/history/${uuid}`),
  getLoginHistory: () => api.get('/login-history')

  
};