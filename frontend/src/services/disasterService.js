import api from './api';

export const disasterService = {
  createReport: async (formData) => {
    // Check if multipart formData (with file attachments) or plain object
    const isFormData = formData instanceof FormData;
    const config = isFormData
      ? { headers: { 'Content-Type': 'multipart/form-data' } }
      : {};
    const res = await api.post('/disasters', formData, config);
    return res.data;
  },

  getAllReports: async (params = {}) => {
    const res = await api.get('/disasters', { params });
    return res.data;
  },

  getPublicMapReports: async (params = {}) => {
    const res = await api.get('/disasters/map', { params });
    return res.data;
  },

  getMyReports: async () => {
    const res = await api.get('/disasters/my-reports');
    return res.data;
  },

  getReportById: async (id) => {
    const res = await api.get(`/disasters/${id}`);
    return res.data;
  },

  verifyReport: async (id, payload) => {
    const res = await api.patch(`/disasters/${id}/verify`, payload);
    return res.data;
  },

  updateReportStatus: async (id, payload) => {
    const res = await api.patch(`/disasters/${id}/status`, payload);
    return res.data;
  },

  updateReport: async (id, payload) => {
    const res = await api.patch(`/disasters/${id}`, payload);
    return res.data;
  },
};
