import api from './api';

export const alertService = {
  getActiveAlerts: async () => {
    const res = await api.get('/alerts/active');
    return res.data;
  },

  getAllAlerts: async (params = {}) => {
    const res = await api.get('/alerts', { params });
    return res.data;
  },

  createAlert: async (data) => {
    const res = await api.post('/alerts', data);
    return res.data;
  },

  updateAlert: async (id, data) => {
    const res = await api.patch(`/alerts/${id}`, data);
    return res.data;
  },

  deactivateAlert: async (id) => {
    const res = await api.patch(`/alerts/${id}/deactivate`);
    return res.data;
  },

  deleteAlert: async (id) => {
    const res = await api.delete(`/alerts/${id}`);
    return res.data;
  },
};
