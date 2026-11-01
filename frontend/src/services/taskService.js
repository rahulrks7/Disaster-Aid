import api from './api';

export const taskService = {
  createTask: async (data) => {
    const res = await api.post('/tasks', data);
    return res.data;
  },

  getAllTasks: async (params = {}) => {
    const res = await api.get('/tasks', { params });
    return res.data;
  },

  getAvailableTasks: async () => {
    const res = await api.get('/tasks/available');
    return res.data;
  },

  getMyTasks: async () => {
    const res = await api.get('/tasks/my-tasks');
    return res.data;
  },

  getTaskById: async (id) => {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  },

  assignVolunteers: async (id, volunteerIds) => {
    const res = await api.patch(`/tasks/${id}/assign`, { volunteerIds });
    return res.data;
  },

  acceptTask: async (id) => {
    const res = await api.patch(`/tasks/${id}/accept`);
    return res.data;
  },

  updateTaskStatus: async (id, payload) => {
    const res = await api.patch(`/tasks/${id}/status`, payload);
    return res.data;
  },
};
