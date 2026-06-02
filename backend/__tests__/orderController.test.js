jest.mock('../models/Order');
jest.mock('../services/mapsService');
jest.mock('../config/db', () => ({
  query: jest.fn(),
}));

const orderController = require('../controllers/orderController');
const Order = require('../models/Order');
const MapsService = require('../services/mapsService');

describe('OrderController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      user: { userId: 'customer-1', role: 'customer' },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create a new order successfully', async () => {
      req.body = {
        pickupAddress: '123 Main St',
        deliveryAddress: '456 Oak Ave',
        packageDescription: 'Fragile package',
        priority: 'express',
      };

      MapsService.geocode
        .mockResolvedValueOnce({ lat: 40.7128, lng: -74.006 })
        .mockResolvedValueOnce({ lat: 40.7306, lng: -73.9352 });
      MapsService.getDirections.mockResolvedValue({
        distance: 10.5,
        duration: 30,
        polyline: 'encoded-polyline',
      });

      const newOrder = {
        id: 'order-1',
        customer_id: 'customer-1',
        pickup_address: '123 Main St',
        delivery_address: '456 Oak Ave',
        status: 'pending',
      };
      Order.create.mockResolvedValue(newOrder);
      Order.updateDistanceDuration.mockResolvedValue({ ...newOrder, estimated_distance: 10.5, estimated_duration: 30 });
      Order.findById.mockResolvedValue({ ...newOrder, estimated_distance: 10.5, estimated_duration: 30 });

      await orderController.createOrder(req, res);

      expect(MapsService.geocode).toHaveBeenCalledTimes(2);
      expect(MapsService.getDirections).toHaveBeenCalled();
      expect(Order.create).toHaveBeenCalledWith({
        customerId: 'customer-1',
        pickupAddress: '123 Main St',
        pickupLat: 40.7128,
        pickupLng: -74.006,
        deliveryAddress: '456 Oak Ave',
        deliveryLat: 40.7306,
        deliveryLng: -73.9352,
        packageDescription: 'Fragile package',
        priority: 'express',
        notes: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

it('should return 500 on geocoding failure', async () => {
       req.body = {
         pickupAddress: 'Invalid Address',
         deliveryAddress: '456 Oak Ave',
       };

       MapsService.geocode.mockRejectedValueOnce(new Error('Geocoding failed'));

       await orderController.createOrder(req, res);

       expect(res.status).toHaveBeenCalledWith(500);
       expect(res.json).toHaveBeenCalledWith({
         message: 'Internal server error',
         code: 'INTERNAL_ERROR',
       });
     });

     it('should use provided coordinates without geocoding', async () => {
       req.body = {
         pickupAddress: '123 Main St',
         deliveryAddress: '456 Oak Ave',
         pickupLat: 40.7128,
         pickupLng: -74.006,
         deliveryLat: 40.7306,
         deliveryLng: -73.9352,
       };

       MapsService.getDirections.mockResolvedValue({
         distance: 10.5,
         duration: 30,
         polyline: 'encoded-polyline',
       });

       const newOrder = {
         id: 'order-1',
         customer_id: 'customer-1',
         pickup_address: '123 Main St',
         delivery_address: '456 Oak Ave',
         status: 'pending',
       };
       Order.create.mockResolvedValue(newOrder);
       Order.updateDistanceDuration.mockResolvedValue({ ...newOrder, estimated_distance: 10.5, estimated_duration: 30, route_polyline: 'encoded-polyline' });
       Order.findById.mockResolvedValue({ ...newOrder, estimated_distance: 10.5, estimated_duration: 30 });

       await orderController.createOrder(req, res);

       expect(MapsService.geocode).not.toHaveBeenCalled();
       expect(MapsService.getDirections).toHaveBeenCalled();
       expect(res.status).toHaveBeenCalledWith(201);
     });
  });

  describe('getOrders', () => {
    it('should return orders for customer', async () => {
      const orders = [
        { id: 'order-1', customer_id: 'customer-1', status: 'pending' },
        { id: 'order-2', customer_id: 'customer-1', status: 'delivered' },
      ];
      Order.findByCustomerId.mockResolvedValue(orders);

      await orderController.getOrders(req, res);

      expect(Order.findByCustomerId).toHaveBeenCalledWith('customer-1');
      expect(res.json).toHaveBeenCalledWith({ orders });
    });

    it('should return all orders for admin', async () => {
      req.user = { userId: 'admin-1', role: 'admin' };
      const orders = [
        { id: 'order-1', customer_id: 'customer-1' },
        { id: 'order-2', customer_id: 'customer-2' },
      ];
      Order.findAll.mockResolvedValue(orders);

      await orderController.getOrders(req, res);

      expect(Order.findAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ orders });
    });
  });

  describe('getOrderById', () => {
    it('should return order for owner customer', async () => {
      req.params = { id: 'order-1' };
      const order = { id: 'order-1', customer_id: 'customer-1', status: 'pending' };
      Order.findById.mockResolvedValue(order);

      await orderController.getOrderById(req, res);

      expect(Order.findById).toHaveBeenCalledWith('order-1');
      expect(res.json).toHaveBeenCalledWith({ order });
    });

    it('should return 403 for customer accessing other order', async () => {
      req.params = { id: 'order-1' };
      const order = { id: 'order-1', customer_id: 'other-customer', status: 'pending' };
      Order.findById.mockResolvedValue(order);

      await orderController.getOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    });

    it('should return 404 for non-existent order', async () => {
      req.params = { id: 'nonexistent' };
      Order.findById.mockResolvedValue(null);

      await orderController.getOrderById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Order not found',
        code: 'ORDER_NOT_FOUND',
      });
    });
  });

  describe('cancelOrder', () => {
    it('should cancel order by owner', async () => {
      req.params = { id: 'order-1' };
      const order = { id: 'order-1', customer_id: 'customer-1', status: 'pending' };
      Order.findById.mockResolvedValue(order);
      Order.cancelOrder.mockResolvedValue({ ...order, status: 'cancelled' });

      await orderController.cancelOrder(req, res);

      expect(Order.cancelOrder).toHaveBeenCalledWith('order-1');
      expect(res.json).toHaveBeenCalledWith({ order: expect.objectContaining({ status: 'cancelled' }) });
    });

    it('should return 403 for non-owner', async () => {
      req.params = { id: 'order-1' };
      const order = { id: 'order-1', customer_id: 'other-customer', status: 'pending' };
      Order.findById.mockResolvedValue(order);

      await orderController.cancelOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
