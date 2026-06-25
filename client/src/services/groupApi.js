import axios from 'axios';

const api_url = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${api_url}/api/groups`,
  withCredentials: true
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || err)
);

export const groupApi = {
  // Groups
  getGroups: () => api.get('/'),
  createGroup: (data) => api.post('/', data),
  updateGroup: (uuid, data) => api.put(`/${uuid}`, data),
  deleteGroup: (uuid) => api.delete(`/${uuid}`),
  reorderGroups: (orderings) => api.put('/reorder', { orderings }),

  // People
  getPeople: (groupUuid) => api.get(`/${groupUuid}/people`),
  createPerson: (groupUuid, data) => api.post(`/${groupUuid}/people`, data),
  getPerson: (groupUuid, uuid) => api.get(`/${groupUuid}/people/${uuid}`),
  updatePerson: (groupUuid, uuid, data) => api.put(`/${groupUuid}/people/${uuid}`, data),
  deletePerson: (groupUuid, uuid) => api.delete(`/${groupUuid}/people/${uuid}`),
  reorderPeople: (groupUuid, orderings) => api.put(`/${groupUuid}/people/reorder`, { orderings }),
  toggleFavPerson: (groupUuid, uuid) => api.post(`/${groupUuid}/people/${uuid}/favorite`, {}),
};
