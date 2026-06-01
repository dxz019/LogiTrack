import { create } from 'zustand';
import api from '../services/api';

const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get('/orders');
      set({ orders: res.data.orders, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  getOrderById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/orders/${id}`);
      set({ currentOrder: res.data.order, loading: false });
      return res.data.order;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  placeOrder: async (orderData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/orders', orderData);
      set((state) => ({ 
        orders: [res.data.order, ...state.orders],
        currentOrder: res.data.order,
        loading: false 
      }));
      return res.data.order;
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  cancelOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put(`/orders/${id}/cancel`);
      set((state) => ({
        orders: state.orders.map(o => o.id === id ? res.data.order : o),
        currentOrder: state.currentOrder?.id === id ? res.data.order : state.currentOrder,
        loading: false
      }));
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));

export default useOrderStore;
