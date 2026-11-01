import api from './api';

export const volunteerService = {
  getAllVolunteers: async (params = {}) => {
    const res = await api.get('/volunteers', { params });
    return res.data;
  },

  getMyProfile: async () => {
    const res = await api.get('/volunteers/me');
    return res.data;
  },

  updateMyProfile: async (data) => {
    const res = await api.patch('/volunteers/me', data);
    return res.data;
  },

  getVolunteerById: async (id) => {
    const res = await api.get(`/volunteers/${id}`);
    return res.data;
  },

  updateVolunteerStatus: async (id, status) => {
    const res = await api.patch(`/volunteers/${id}/status`, { status });
    return res.data;
  },
};
