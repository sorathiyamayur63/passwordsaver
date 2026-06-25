import axios from 'axios';

// Create a dedicated client that securely forwards HttpOnly cookies
//for deployee const api = axios.create({baseURL: '/api', withCredentials: true });

const api_url =
  import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${api_url}/api`,
  withCredentials: true
});

api.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err.response?.data || err)
);

export const vaultApi = {
  // Vault Items
  getVaultItems: (params) => api.get('/vault', { params }),
  getVaultItem: (uuid) => api.get(`/vault/${uuid}`),
  createVaultItem: (data) => api.post('/vault', data),
  updateVaultItem: (uuid, data) => api.put(`/vault/${uuid}`, data),
  bulkUpdateVaultItems: (items) => api.post('/vault/bulk-update', { items }),
  deleteVaultItem: (uuid) => api.delete(`/vault/${uuid}`),
  permanentDeleteVaultItem: (uuid) => api.delete(`/vault/${uuid}/permanent`),
  restoreVaultItem: (uuid) => api.post(`/vault/${uuid}/restore`, {}),
  //toggleFavorite: (uuid) => api.post(`/vault/${uuid}/favorite`),  and ", {}" change in 22,24 25
    toggleFavorite: (uuid) => api.post(`/vault/${uuid}/favorite`, {}),
  duplicateVaultItem: (uuid) => api.post(`/vault/${uuid}/duplicate`, {}),
  getRecentItems: () => api.get('/vault/recent'),
  getTrashItems: (params) => api.get('/vault/trash', { params }),
  emptyTrash: () => api.post('/vault/trash/empty', {}),

  // Categories
  getCategories: () => api.get('/categories'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (uuid, data) => api.put(`/categories/${uuid}`, data),
  deleteCategory: (uuid) => api.delete(`/categories/${uuid}`),
  reorderCategories: (orderings) => api.put('/categories/reorder', { orderings })
};