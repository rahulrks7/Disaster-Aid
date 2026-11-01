import api from './api';

export const helpRequestService = {
  createRequest: async (data) => {
    const res = await api.post('/help-requests', data);
    return res.data;
  },

  getAllRequests: async (params = {}) => {
    const res = await api.get('/help-requests', { params });
    return res.data;
  },

  getMyRequests: async () => {
    const res = await api.get('/help-requests/my-requests');
    return res.data;
  },

  getRequestById: async (id) => {
    const res = await api.get(`/help-requests/${id}`);
    return res.data;
  },

  updateRequestStatus: async (id, payload) => {
    const res = await api.patch(`/help-requests/${id}/status`, payload);
    return res.data;
  },

  updateRequest: async (id, payload) => {
    const res = await api.patch(`/help-requests/${id}`, payload);
    return res.data;
  },
};
