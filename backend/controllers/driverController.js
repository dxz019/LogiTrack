// Driver controller - manages driver status, orders, and delivery actions
// All routes require driver role authentication

const Driver = require('../models/Driver');
const Order = require('../models/Order');
const pool = require('../config/db');
const notificationQueue = require('../queues/notificationQueue');
const AssignmentEngine = require('../services/assignmentEngine');
const logger = require('../config/logger');

class DriverController {
  // Get assigned orders for current driver
  static async getMyOrders(req, res) {
    try {
      const driverId = req.user.userId;
      const result = await pool.query(
        `SELECT o.*, ST_X(o.pickup_location) as pickup_lng, ST_Y(o.pickup_location) as pickup_lat,
                ST_X(o.delivery_location) as delivery_lng, ST_Y(o.delivery_location) as delivery_lat,
                u.name as customer_name, u.phone as customer_phone
         FROM orders o JOIN users u ON o.customer_id = u.id
         WHERE o.driver_id = $1 ORDER BY o.created_at DESC`,
        [driverId]
      );
      res.json({ orders: result.rows });
    } catch (error) {
      logger.error('Error fetching driver orders:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  // Update driver online/availability status
  static async updateStatus(req, res) {
    try {
      const driverId = req.user.userId;
      const { isOnline, isAvailable } = req.body;
      let driver;
      if (typeof isOnline === 'boolean') {
        driver = await Driver.setOnline(driverId, isOnline);
        if (!isOnline) await Driver.setAvailability(driverId, false);
      }
      if (typeof isAvailable === 'boolean') {
        driver = await Driver.setAvailability(driverId, isAvailable);
      }
      if (!driver) driver = await Driver.findByUserId(driverId);
      const io = req.app.get('io');
      if (io) {
        io.to('admin').emit('admin:driver_status', { driverId, isOnline: driver.is_online, isAvailable: driver.is_available });
      }
      res.json({ driver });
    } catch (error) {
      logger.error('Error updating driver status:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  // Update driver location (fallback method)
  static async updateLocation(req, res) {
    try {
      const driverId = req.user.userId;
      const { lat, lng } = req.body;
      const driver = await Driver.updateLocation(driverId, lat, lng);
      res.json({ driver });
    } catch (error) {
      logger.error('Error updating driver location:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  // Accept assigned order
  static async acceptOrder(req, res) {
    try {
      const driverId = req.user.userId;
      const orderId = req.params.id;

      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });
      if (order.driver_id !== driverId) return res.status(403).json({ message: 'This order is not assigned to you', code: 'FORBIDDEN' });
      if (order.status !== 'assigned') return res.status(400).json({ message: `Cannot accept order with status: ${order.status}`, code: 'INVALID_STATUS' });

      const updated = await Order.updateStatus(orderId, 'accepted');
      await Driver.setAvailability(driverId, false);

      await notificationQueue.add('send-notification', {
        userId: order.customer_id, orderId, type: 'driver_assigned',
        title: 'Driver Assigned', message: 'Your driver is on the way to pick up your package.'
      });

      const io = req.app.get('io');
      if (io) {
        const driverInfo = await Driver.getDriverWithLocation(driverId);
        io.to(`order:${orderId}`).emit('order:driver_assigned', { orderId, driver: { name: driverInfo.name, phone: driverInfo.phone, vehicle: driverInfo.vehicle_type, rating: driverInfo.rating } });
        io.to(`order:${orderId}`).emit('order:status_update', { orderId, status: 'accepted', timestamp: new Date().toISOString() });
      }

      res.json({ order: updated });
    } catch (error) {
      logger.error('Error accepting order:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  // Mark order as picked up
  static async pickupOrder(req, res) {
    try {
      const driverId = req.user.userId;
      const orderId = req.params.id;

      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });
      if (order.driver_id !== driverId) return res.status(403).json({ message: 'This order is not assigned to you', code: 'FORBIDDEN' });
      if (order.status !== 'accepted') return res.status(400).json({ message: `Cannot pick up order with status: ${order.status}`, code: 'INVALID_STATUS' });

      const updated = await Order.markPickedUp(orderId);

      await notificationQueue.add('send-notification', {
        userId: order.customer_id, orderId, type: 'order_picked_up',
        title: 'Package Picked Up', message: 'Your package has been picked up and is on its way.'
      });

      req.app.get('io')?.to(`order:${orderId}`).emit('order:status_update', { orderId, status: 'picked_up', timestamp: new Date().toISOString() });
      res.json({ order: updated });
    } catch (error) {
      logger.error('Error marking pickup:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  // Mark order as delivered with proof photo
  static async deliverOrder(req, res) {
    try {
      const driverId = req.user.userId;
      const orderId = req.params.id;

      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });
      if (order.driver_id !== driverId) return res.status(403).json({ message: 'This order is not assigned to you', code: 'FORBIDDEN' });
      if (!['picked_up', 'in_transit'].includes(order.status)) return res.status(400).json({ message: `Cannot deliver order with status: ${order.status}`, code: 'INVALID_STATUS' });

      const proofUrl = req.file ? `/uploads/${req.file.filename}` : null;
      const updated = await Order.markDelivered(orderId, proofUrl);
      await Driver.setAvailability(driverId, true);
      await pool.query(`UPDATE drivers SET total_deliveries = total_deliveries + 1, updated_at = NOW() WHERE id = $1`, [driverId]);

      await notificationQueue.add('send-notification', {
        userId: order.customer_id, orderId, type: 'order_delivered',
        title: 'Order Delivered!', message: 'Your package has been delivered. Please rate your driver.'
      });

      req.app.get('io')?.to(`order:${orderId}`).emit('order:delivered', { orderId, proofUrl, deliveredAt: new Date().toISOString() });
      req.app.get('io')?.to(`order:${orderId}`).emit('order:status_update', { orderId, status: 'delivered', timestamp: new Date().toISOString() });
      res.json({ order: updated });
    } catch (error) {
      logger.error('Error delivering order:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  // Reject order assignment - triggers reassignment
  static async rejectOrder(req, res) {
    try {
      const driverId = req.user.userId;
      const orderId = req.params.id;

      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });
      if (order.driver_id !== driverId) return res.status(403).json({ message: 'This order is not assigned to you', code: 'FORBIDDEN' });
      if (order.status !== 'assigned') return res.status(400).json({ message: `Cannot reject order with status: ${order.status}`, code: 'INVALID_STATUS' });

      await Order.updateStatus(orderId, 'pending');
      await pool.query(`UPDATE orders SET driver_id = NULL, updated_at = NOW() WHERE id = $1`, [orderId]);
      await pool.query(`UPDATE drivers SET acceptance_rate = GREATEST(0, acceptance_rate - 2), updated_at = NOW() WHERE id = $1`, [driverId]);

      await notificationQueue.add('send-notification', {
        userId: order.customer_id, orderId, type: 'assignment_timeout',
        title: 'Finding New Driver', message: 'We are finding a new driver for your order.'
      });

      try { await AssignmentEngine.assignDriver(orderId); } catch (e) { logger.warn('Reassignment failed:', e.message); }
      res.json({ message: 'Order rejected, reassigning.' });
    } catch (error) {
      logger.error('Error rejecting order:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
}

module.exports = DriverController;
