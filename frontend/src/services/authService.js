import api from './api';

export const authService = {
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('disasteraid_token', res.data.token);
      localStorage.setItem('disasteraid_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.token) {
      localStorage.setItem('disasteraid_token', res.data.token);
      localStorage.setItem('disasteraid_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.patch('/auth/profile', profileData);
    if (res.data.user) {
      localStorage.setItem('disasteraid_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('disasteraid_token');
    localStorage.removeItem('disasteraid_user');
  },
};
