import { create } from 'zustand';
import axios from 'axios';
import api from '../services/api';

const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: true,

  setAccessToken: (token) => set({ accessToken: token }),

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      set({ 
        user: res.data.user, 
        accessToken: res.data.accessToken, 
        isAuthenticated: true,
        loading: false
      });
      return res.data.user;
    } catch (error) {
      set({ loading: false });
      console.error('Login failed', error);
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const res = await api.post('/auth/register', userData);
      set({ 
        user: res.data.user, 
        accessToken: res.data.accessToken, 
        isAuthenticated: true,
        loading: false
      });
      return res.data.user;
    } catch (error) {
      set({ loading: false });
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
      set({ user: null, accessToken: null, isAuthenticated: false, loading: false });
    }
  },

  checkAuth: async () => {
    set({ loading: true });
    try {
      const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
      const token = res.data.accessToken;
      
      set({ accessToken: token, loading: false });
      
      const userRes = await api.get('/auth/me');
      set({ user: userRes.data.user, isAuthenticated: true });
    } catch (error) {
      set({ user: null, accessToken: null, isAuthenticated: false, loading: false });
    }
  }
}));

export default useAuthStore;