import { create } from 'zustand';
import api from '../services/api';

const useDriverStore = create((set) => ({
  assignedOrders: [],
  driverStatus: {
    isOnline: false,
    isAvailable: false,
  },
  loading: false,
  error: null,

  fetchMyOrders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/drivers/me/orders');
      set({ assignedOrders: res.data.orders, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  updateStatus: async (statusData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put('/drivers/me/status', statusData);
      set({ 
        driverStatus: {
          isOnline: res.data.driver.is_online,
          isAvailable: res.data.driver.is_available,
        }, 
        loading: false 
      });
      return res.data.driver;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  acceptOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/drivers/orders/${orderId}/accept`);
      // Update local state by changing status of the order in the list if it exists
      set((state) => ({
        assignedOrders: state.assignedOrders.map(o => o.id === orderId ? { ...o, status: 'accepted' } : o),
        loading: false
      }));
      return res.data.order;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  pickupOrder: async (orderId) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/drivers/orders/${orderId}/pickup`);
      set((state) => ({
        assignedOrders: state.assignedOrders.map(o => o.id === orderId ? { ...o, status: 'picked_up' } : o),
        loading: false
      }));
      return res.data.order;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deliverOrder: async (orderId, proofPhoto) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      if (proofPhoto) {
        formData.append('proofPhoto', proofPhoto);
      }
      
      const res = await api.put(`/drivers/orders/${orderId}/deliver`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set((state) => ({
        assignedOrders: state.assignedOrders.map(o => o.id === orderId ? { ...o, status: 'delivered' } : o),
        loading: false
      }));
      return res.data.order;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));

export default useDriverStore;
