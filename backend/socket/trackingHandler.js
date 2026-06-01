// Socket.io handler for tracking events (GPS pings, etc.)
const pool = require('../config/db');
const Order = require('../models/Order');
const ETAService = require('../services/etaService');
const notifyService = require('../services/notifyService');

module.exports = function (io, socket) {
  // Join order tracking room
  socket.on('customer:track_order', async ({ orderId }) => {
    try {
      // Verify that the user is allowed to track this order (customer or admin)
      const order = await Order.findById(orderId);
      if (!order) {
        return socket.emit('error', { message: 'Order not found' });
      }
      // Authorization: customer can track their own orders, admin can track any
      if (socket.userRole === 'customer' && order.customer_id !== socket.userId) {
        return socket.emit('error', { message: 'Unauthorized' });
      }
      if (socket.userRole === 'admin') {
        // admin can track any order
      }
      socket.join(`order:${orderId}`);
      console.log(`Socket ${socket.id} joined order room: ${orderId}`);
    } catch (error) {
      console.error('Error in tracking order:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });

  // Driver location update
  socket.on('driver:location_update', async ({ orderId, lat, lng, speed, heading }) => {
    try {
      // Verify that the driver is assigned to the order
      const order = await Order.findById(orderId);
      if (!order) {
        return socket.emit('error', { message: 'Order not found' });
      }
      if (order.driver_id !== socket.userId) {
        return socket.emit('error', { message: 'Unauthorized: Not assigned to this order' });
      }
      if (socket.userRole !== 'driver') {
        return socket.emit('error', { message: 'Unauthorized: Not a driver' });
      }

      // Save to tracking_logs
      await pool.query(
        `INSERT INTO tracking_logs (order_id, driver_id, location, speed, heading)
         VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326), $5, $6)`,
        [orderId, socket.userId, lat, lng, speed, heading]
      );

      // Update driver's current location in drivers table
      await pool.query(
        `UPDATE drivers SET current_location = ST_SetSRID(ST_MakePoint($2, $1), 4326), updated_at = NOW() WHERE id = $1`,
        [socket.userId, lng, lat]
      );

      // Recalculate ETA
      const { eta, distance, duration } = await ETAService.calculateETA(
        lat, lng,
        order.delivery_lat, order.delivery_lng,
        order.priority
      );

      // Update order ETA in database
      await Order.updateETA(orderId, eta);

      // Emit to the order room (customer and driver)
      io.to(`order:${orderId}`).emit('order:location_update', {
        orderId,
        lat,
        lng,
        eta,
        distanceRemaining: distance, // in km
      });

      // If the driver is very close, we can emit an out_for_delivery notification
      // We'll let the notification queue handle this based on status changes
      // For now, we just emit the location update
    } catch (error) {
      console.error('Error in driver location update:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Tracking socket disconnected:', socket.id);
  });
};