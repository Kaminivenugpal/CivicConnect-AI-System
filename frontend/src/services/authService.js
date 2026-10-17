import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    if (token) {
      localStorage.setItem('civic_jwt_token', token);
      localStorage.setItem('civic_user_data', JSON.stringify(user));
    }
    return response.data;
  },

  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('civic_jwt_token');
    localStorage.removeItem('civic_user_data');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('civic_user_data');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem('civic_jwt_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('civic_jwt_token');
  }
};
