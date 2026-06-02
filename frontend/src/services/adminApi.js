import api from './api';

export const adminApi = {
  getOrders: (params = {}) => api.get('/admin/orders', { params }),
  getDrivers: () => api.get('/admin/drivers'),
  getDriverProfile: (id) => api.get(`/admin/drivers/${id}/profile`),
  updateDriverProfile: (id, payload) => api.put(`/admin/drivers/${id}/profile`, payload),
  getStats: () => api.get('/admin/stats'),
};

export default adminApi;
