import api from './api';

export const resourceService = {
  getAllResources: async (params = {}) => {
    const res = await api.get('/resources', { params });
    return res.data;
  },

  createResource: async (data) => {
    const res = await api.post('/resources', data);
    return res.data;
  },

  updateResource: async (id, data) => {
    const res = await api.patch(`/resources/${id}`, data);
    return res.data;
  },

  recordTransaction: async (id, data) => {
    const res = await api.post(`/resources/${id}/transactions`, data);
    return res.data;
  },

  getResourceTransactions: async (id) => {
    const res = await api.get(`/resources/${id}/transactions`);
    return res.data;
  },
};
