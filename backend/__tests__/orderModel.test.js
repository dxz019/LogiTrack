jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

const { Pool } = require('pg');
const pool = require('../config/db');

describe('Order Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should find an order by ID', async () => {
      const mockOrder = {
        id: 'order-1',
        customer_id: 'customer-1',
        pickup_location: 'POINT(-74.006 40.7128)',
        delivery_location: 'POINT(-73.9352 40.7306)',
      };
      pool.query.mockResolvedValue({ rows: [mockOrder] });

      const Order = require('../models/Order');
      const result = await Order.findById('order-1');

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    it('should return undefined for non-existent order', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const Order = require('../models/Order');
      const result = await Order.findById('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('findByCustomerId', () => {
    it('should find orders by customer ID', async () => {
      const mockOrders = [
        { id: 'order-1', customer_id: 'customer-1' },
        { id: 'order-2', customer_id: 'customer-1' },
      ];
      pool.query.mockResolvedValue({ rows: mockOrders });

      const Order = require('../models/Order');
      const result = await Order.findByCustomerId('customer-1');

      expect(pool.query).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const updatedOrder = { id: 'order-1', status: 'delivered' };
      pool.query.mockResolvedValue({ rows: [updatedOrder] });

      const Order = require('../models/Order');
      const result = await Order.updateStatus('order-1', 'delivered');

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE orders'),
        ['delivered', 'order-1']
      );
    });
  });
});