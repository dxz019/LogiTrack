// Order controller - handles order creation and retrieval
// All routes protected with JWT authentication and role-based access

const Order = require('../models/Order');
const MapsService = require('../services/mapsService');

class OrderController {
  // Create new order - geocodes addresses, calculates route
  static async createOrder(req, res) {
    try {
      const {
        pickupAddress, deliveryAddress, packageDescription, priority = 'normal', notes,
        pickupLat, pickupLng, deliveryLat, deliveryLng
      } = req.body;

      const { userId } = req.user; // Set by auth middleware

      // Use provided coordinates or geocode addresses
      let pickupLocation, deliveryLocation;
      if (pickupLat && pickupLng) {
        pickupLocation = { lat: pickupLat, lng: pickupLng };
      } else {
        pickupLocation = await MapsService.geocode(pickupAddress);
      }
      if (deliveryLat && deliveryLng) {
        deliveryLocation = { lat: deliveryLat, lng: deliveryLng };
      } else {
        deliveryLocation = await MapsService.geocode(deliveryAddress);
      }

      // Get directions for distance/duration
      const { distance, duration, polyline } = await MapsService.getDirections(
        pickupLocation.lat, pickupLocation.lng,
        deliveryLocation.lat, deliveryLocation.lng
      );

      // Create order in database
      const order = await Order.create({
        customerId: userId, pickupAddress, pickupLat: pickupLocation.lat,
        pickupLng: pickupLocation.lng, deliveryAddress,
        deliveryLat: deliveryLocation.lat, deliveryLng: deliveryLocation.lng,
        packageDescription, priority, notes
      });

      // Update with calculated values
      await Order.updateDistanceDuration(order.id, distance, duration, polyline);
      const updatedOrder = await Order.findById(order.id);

      res.status(201).json({ order: updatedOrder });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  // Get orders - customers see own orders, admins see all
  static async getOrders(req, res) {
    try {
      const { userId, role } = req.user;
      let orders;
      if (role === 'admin') {
        orders = await Order.findAll();
      } else {
        orders = await Order.findByCustomerId(userId);
      }
      res.json({ orders });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  // Get single order by ID with authorization check
  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });
      }

      // Authorization checks
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

  // Cancel order - customer or admin only
  static async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const { userId, role } = req.user;

      const order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });
      }

      // Authorization check
      if (role === 'customer' && order.customer_id !== userId) {
        return res.status(403).json({ message: 'Insufficient permissions', code: 'INSUFFICIENT_PERMISSIONS' });
      }

      const updatedOrder = await Order.cancelOrder(id);
      res.json({ order: updatedOrder });
    } catch (error) {
      console.error('Error cancelling order:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
}

module.exports = OrderController;