// Authentication store - manages user login state with Zustand
// Handles JWT tokens, registration, and session persistence

import { create } from 'zustand';
import api from '../services/api';
import axios from 'axios';

const useAuthStore = create((set) => ({
  // State
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,

  // Actions
  setAccessToken: (token) => set({ accessToken: token }),

  // Login - authenticate with email/password
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
      return true;
    } catch (error) {
      set({ loading: false });
      console.error('Login failed', error);
      throw error;
    }
  },

  // Register - create new account
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
      return true;
    } catch (error) {
      set({ loading: false });
      console.error('Register failed', error);
      throw error;
    }
  },

  // Logout - clear session
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore error - still logout locally
    } finally {
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  // Check auth - verify session on page load
  checkAuth: async () => {
    if (typeof window === 'undefined') {
      set({ user: null, accessToken: null, isAuthenticated: false, loading: false });
      return;
    }
    set({ loading: true });
    try {
      const res = await axios.post('/api/auth/refresh', {}, { withCredentials: true });
      const token = res.data.accessToken;
      set({ accessToken: token });
      
      const userRes = await api.get('/auth/me');
      set({ user: userRes.data.user, isAuthenticated: true, loading: false });
    } catch (error) {
      set({ user: null, accessToken: null, isAuthenticated: false, loading: false });
    }
  }
}));

// Auto-initialize auth state on module load (client-side only)
if (typeof window !== 'undefined') {
  const token = localStorage.getItem('token');
  if (!token) {
    useAuthStore.setState({ isAuthenticated: false, user: null, accessToken: null, loading: false });
  }
}

export default useAuthStore;