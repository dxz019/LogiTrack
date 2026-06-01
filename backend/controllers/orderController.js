const Order = require('../models/Order');
const MapsService = require('../services/mapsService');

class OrderController {
  /**
   * Create a new order
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createOrder(req, res) {
    try {
      const {
        pickupAddress,
        deliveryAddress,
        packageDescription,
        priority = 'normal',
        notes,
      } = req.body;

      const { userId } = req.user; // from auth middleware

      // Geocode pickup and delivery addresses
      const pickupLocation = await MapsService.geocode(pickupAddress);
      const deliveryLocation = await MapsService.geocode(deliveryAddress);

      // Get directions (distance and duration)
      const { distance, duration } = await MapsService.getDirections(
        pickupLocation.lat,
        pickupLocation.lng,
        deliveryLocation.lat,
        deliveryLocation.lng
      );

      // Create order
      const order = await Order.create({
        customerId: userId,
        pickupAddress,
        pickupLat: pickupLocation.lat,
        pickupLng: pickupLocation.lng,
        deliveryAddress,
        deliveryLat: deliveryLocation.lat,
        deliveryLng: deliveryLocation.lng,
        packageDescription,
        priority,
        notes,
      });

      // Update order with distance and duration
      await Order.updateDistanceDuration(order.id, distance, duration);

      // Fetch the updated order to return
      const updatedOrder = await Order.findById(order.id);

      res.status(201).json({ order: updatedOrder });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  /**
   * Get all orders for the current user (customer) or all orders (admin)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getOrders(req, res) {
    try {
      const { userId, role } = req.user;
      let orders;
      if (role === 'admin') {
        // Admin can see all orders
        const result = await Order.findAll(); // We need to add this method to Order model
        orders = result;
      } else {
        // Customer sees their own orders
        orders = await Order.findByCustomerId(userId);
      }
      res.json({ orders });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  /**
   * Get order by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });
      }

      // Authorization: customer can only see their own orders, admin can see any, driver can see if assigned
      if (role === 'customer' && order.customer_id !== userId) {
        return res.status(403).json({ message: 'Insufficient permissions', code: 'INSUFFICIENT_PERMISSIONS' });
      }
      if (role === 'driver' && order.driver_id && order.driver_id !== userId) {
        return res.status(403).json({ message: 'Insufficient permissions', code: 'INSUFFICIENT_PERMISSIONS' });
      }

      res.json({ order });
    } catch (error) {
      console.error('Error fetching order by ID:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  /**
   * Cancel order (only by customer who owns it or admin)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });
      }

      // Authorization
      if (role === 'customer' && order.customer_id !== userId) {
        return res.status(403).json({ message: 'Insufficient permissions', code: 'INSUFFICIENT_PERMISSIONS' });
      }
      if (role === 'admin') {
        // admin can cancel any order
      }
      // Note: driver cannot cancel order via this endpoint (they have reject)

      const updatedOrder = await Order.cancelOrder(id);
      res.json({ order: updatedOrder });
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
}

module.exports = OrderController;