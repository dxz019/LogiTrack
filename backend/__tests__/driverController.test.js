jest.mock('../models/Driver');
jest.mock('../models/Order');
jest.mock('../config/db', () => ({
  query: jest.fn(),
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
  });

  describe('acceptOrder', () => {
    it('should accept an assigned order', async () => {
      req.params = { id: 'order-1' };
      const order = { id: 'order-1', driver_id: 'driver-1', status: 'assigned', customer_id: 'customer-1' };
      Order.findById.mockResolvedValue(order);
      Order.updateStatus.mockResolvedValue({ ...order, status: 'accepted' });
      Driver.setAvailability.mockResolvedValue({});

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
  });

  describe('deliverOrder', () => {
    it('should mark order as delivered with proof', async () => {
      req.params = { id: 'order-1' };
      req.file = { filename: 'proof.jpg' };
      const order = { id: 'order-1', driver_id: 'driver-1', status: 'in_transit', customer_id: 'customer-1' };
      Order.findById.mockResolvedValue(order);
      Order.markDelivered.mockResolvedValue({ ...order, status: 'delivered' });
      Driver.setAvailability.mockResolvedValue({});
      pool.query.mockResolvedValue({});

      await driverController.deliverOrder(req, res);

      expect(Order.markDelivered).toHaveBeenCalled();
    });
  });

  describe('rejectOrder', () => {
    it('should reject and reassess order', async () => {
      req.params = { id: 'order-1' };
      const order = { id: 'order-1', driver_id: 'driver-1', status: 'assigned', customer_id: 'customer-1' };
      Order.findById.mockResolvedValue(order);
      Order.updateStatus.mockResolvedValue({});
      pool.query.mockResolvedValue({});

      await driverController.rejectOrder(req, res);

      expect(Order.updateStatus).toHaveBeenCalledWith('order-1', 'pending');
    });
  });
});