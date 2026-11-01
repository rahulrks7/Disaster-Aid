import api from './api';

export const dashboardService = {
  getAdminSummary: async () => {
    const res = await api.get('/dashboard/summary');
    return res.data;
  },

  getAdminAnalytics: async () => {
    const res = await api.get('/dashboard/analytics');
    return res.data;
  },

  getCitizenSummary: async () => {
    const res = await api.get('/dashboard/citizen');
    return res.data;
  },

  getVolunteerSummary: async () => {
    const res = await api.get('/dashboard/volunteer');
    return res.data;
  },
};
