import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: true,

  setAccessToken: (token) => set({ accessToken: token }),

  login: async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      set({ 
        user: res.data.user, 
        accessToken: res.data.accessToken, 
        isAuthenticated: true 
      });
      return true;
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      set({ 
        user: res.data.user, 
        accessToken: res.data.accessToken, 
        isAuthenticated: true 
      });
      return true;
    } catch (error) {
      console.error('Register failed', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore error
    } finally {
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  checkAuth: async () => {
    try {
      // We can try to refresh token. If successful, get user info.
      const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
      const token = res.data.accessToken;
      
      // We can't use api here initially because we need to set the token first
      set({ accessToken: token });
      
      const userRes = await api.get('/auth/me');
      set({ user: userRes.data.user, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ user: null, accessToken: null, isAuthenticated: false, loading: false });
    }
  }
}));

import axios from 'axios'; // For the direct refresh call in checkAuth

export default useAuthStore;
