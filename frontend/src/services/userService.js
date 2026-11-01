import api from './api';

export const userService = {
  getAllUsers: async (params = {}) => {
    const res = await api.get('/users', { params });
    return res.data;
  },

  updateUser: async (id, data) => {
    const res = await api.patch(`/users/${id}`, data);
    return res.data;
  },
};
