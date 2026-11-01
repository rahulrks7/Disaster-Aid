import api from './api';

export const shelterService = {
  getAllShelters: async (params = {}) => {
    const res = await api.get('/shelters', { params });
    return res.data;
  },

  getShelterById: async (id) => {
    const res = await api.get(`/shelters/${id}`);
    return res.data;
  },

  createShelter: async (data) => {
    const res = await api.post('/shelters', data);
    return res.data;
  },

  updateShelter: async (id, data) => {
    const res = await api.patch(`/shelters/${id}`, data);
    return res.data;
  },

  deleteShelter: async (id) => {
    const res = await api.delete(`/shelters/${id}`);
    return res.data;
  },
};
