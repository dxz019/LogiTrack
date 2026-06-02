jest.mock('../models/Driver');
jest.mock('../models/Order');
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));
jest.mock('../queues/notificationQueue', () => ({
  add: jest.fn().mockResolvedValue({}),
}));
jest.mock('../services/assignmentEngine', () => ({
  assignDriver: jest.fn().mockResolvedValue({}),
}));

const driverController = require('../controllers/driverController');
const Driver = require('../models/Driver');
const Order = require('../models/Order');
const pool = require('../config/db');

describe('DriverController', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { userId: 'driver-1' },
      app: { get: jest.fn() },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    req.app.get.mockReturnValue({
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    });
    jest.clearAllMocks();
  });

  describe('getMyOrders', () => {
    it('should return driver orders via direct query', async () => {
      const mockOrders = [
        { id: 'order-1', driver_id: 'driver-1', status: 'accepted', customer_name: 'John' },
      ];
      pool.query.mockResolvedValue({ rows: mockOrders });

      await driverController.getMyOrders(req, res);

      expect(pool.query).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ orders: mockOrders });
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));

      await driverController.getMyOrders(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateStatus', () => {
    it('should update driver online status', async () => {
      req.body = { isOnline: true };
      const driver = { id: 'driver-1', is_online: true, is_available: true };
      Driver.setOnline.mockResolvedValue(driver);

      await driverController.updateStatus(req, res);

      expect(Driver.setOnline).toHaveBeenCalledWith('driver-1', true);
      expect(res.json).toHaveBeenCalledWith({ driver });
    });

    it('should update driver availability', async () => {
      req.body = { isAvailable: true };
      const driver = { id: 'driver-1', is_available: true };
      Driver.setAvailability.mockResolvedValue(driver);

      await driverController.updateStatus(req, res);

      expect(Driver.setAvailability).toHaveBeenCalledWith('driver-1', true);
    });

    it('should set driver unavailable when going offline', async () => {
      req.body = { isOnline: false };
      const driver = { id: 'driver-1', is_online: false, is_available: false };
      Driver.setOnline.mockResolvedValue(driver);
      Driver.setAvailability.mockResolvedValue(driver);

      await driverController.updateStatus(req, res);

      expect(Driver.setOnline).toHaveBeenCalledWith('driver-1', false);
      expect(Driver.setAvailability).toHaveBeenCalledWith('driver-1', false);
    });
  });

  describe('acceptOrder', () => {
    it('should accept an assigned order', async () => {
      req.params = { id: 'order-1' };
      const order = { id: 'order-1', driver_id: 'driver-1', status: 'assigned', customer_id: 'customer-1' };
      Order.findById.mockResolvedValue(order);
      Order.updateStatus.mockResolvedValue({ ...order, status: 'accepted' });
      Driver.setAvailability.mockResolvedValue({});
      Driver.getDriverWithLocation.mockResolvedValue({
        name: 'Driver Name',
        phone: '1234567890',
        vehicle_type: 'car',
        rating: 4.8,
      });

      await driverController.acceptOrder(req, res);

      expect(Order.updateStatus).toHaveBeenCalledWith('order-1', 'accepted');
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 403 if order not assigned to driver', async () => {
      req.params = { id: 'order-1' };
      const order = { id: 'order-1', driver_id: 'other-driver', status: 'assigned' };
      Order.findById.mockResolvedValue(order);

      await driverController.acceptOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 if order not found', async () => {
      req.params = { id: 'order-1' };
      Order.findById.mockResolvedValue(null);

      await driverController.acceptOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('pickupOrder', () => {
    it('should mark order as picked up', async () => {
      req.params = { id: 'order-1' };
      const order = { id: 'order-1', driver_id: 'driver-1', status: 'accepted', customer_id: 'customer-1' };
      Order.findById.mockResolvedValue(order);
      Order.markPickedUp.mockResolvedValue({ ...order, status: 'picked_up' });

      await driverController.pickupOrder(req, res);

      expect(Order.markPickedUp).toHaveBeenCalledWith('order-1');
    });

    it('should return 400 if order status is not accepted', async () => {
      req.params = { id: 'order-1' };
      const order = { id: 'order-1', driver_id: 'driver-1', status: 'pending', customer_id: 'customer-1' };
      Order.findById.mockResolvedValue(order);

      await driverController.pickupOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('deliverOrder', () => {
    it('should mark order as delivered with proof', async () => {
      req.params = { id: 'order-1' };
      req.file = { filename: 'proof.jpg' };
      const order = { id: 'order-1', driver_id: 'driver-1', status: 'in_transit', customer_id: 'customer-1' };
      Order.findById.mockResolvedValue(order);
      Order.markDelivered.mockResolvedValue({ ...order, status: 'delivered' });
      Driver.setAvailability.mockResolvedValue({});

      await driverController.deliverOrder(req, res);

      expect(Order.markDelivered).toHaveBeenCalled();
    });

    it('should increment driver total deliveries on delivery', async () => {
      req.params = { id: 'order-1' };
      req.file = { filename: 'proof.jpg' };
      const order = { id: 'order-1', driver_id: 'driver-1', status: 'picked_up', customer_id: 'customer-1' };
      Order.findById.mockResolvedValue(order);
      Order.markDelivered.mockResolvedValue({ ...order, status: 'delivered' });
      Driver.setAvailability.mockResolvedValue({});

      await driverController.deliverOrder(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE drivers'),
        ['driver-1']
      );
    });
  });

  describe('rejectOrder', () => {
    it('should reject and reset order to pending', async () => {
      req.params = { id: 'order-1' };
      const order = { id: 'order-1', driver_id: 'driver-1', status: 'assigned', customer_id: 'customer-1' };
      Order.findById.mockResolvedValue(order);
      Order.updateStatus.mockResolvedValue({ ...order, status: 'pending' });

      await driverController.rejectOrder(req, res);

      expect(Order.updateStatus).toHaveBeenCalledWith('order-1', 'pending');
      expect(res.json).toHaveBeenCalled();
    });

    it('should clear driver_id on rejection', async () => {
      req.params = { id: 'order-1' };
      const order = { id: 'order-1', driver_id: 'driver-1', status: 'assigned', customer_id: 'customer-1' };
      Order.findById.mockResolvedValue(order);
      Order.updateStatus.mockResolvedValue({ ...order, status: 'pending' });

      await driverController.rejectOrder(req, res);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE orders'),
        ['order-1']
      );
    });
  });
});
