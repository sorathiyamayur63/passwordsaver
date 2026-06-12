import axios from 'axios';

const api = axios.create({
  baseURL: '/api/templates',
  withCredentials: true
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || err)
);

export const templateApi = {
  getTemplates: () => api.get('/'),
  createTemplate: (data) => api.post('/', data),
  updateTemplate: (uuid, data) => api.put(`/${uuid}`, data),
  deleteTemplate: (uuid) => api.delete(`/${uuid}`)
};