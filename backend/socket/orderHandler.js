// Socket.io handler for order events
const pool = require('../config/db');
const Order = require('../models/Order');
const Driver = require('../models/Driver');
const Notification = require('../models/Notification');
const notifyService = require('../services/notifyService');

module.exports = function (io, socket) {
  // Driver accepts an order
  socket.on('driver:accept_order', async ({ orderId }) => {
    try {
      // Verify the order exists and is in assigned status
      const order = await Order.findById(orderId);
      if (!order) {
        return socket.emit('error', { message: 'Order not found' });
      }
      if (order.status !== 'assigned') {
        return socket.emit('error', { message: 'Order is not assigned' });
      }
      if (order.driver_id !== socket.userId) {
        return socket.emit('error', { message: 'Not assigned to this order' });
      }
      if (socket.userRole !== 'driver') {
        return socket.emit('error', { message: 'Unauthorized: Not a driver' });
      }

      // Update order status to accepted
      const updatedOrder = await Order.updateStatus(orderId, 'accepted');

      // Emit to the order room (customer and driver)
      io.to(`order:${orderId}`).emit('order:status_update', {
        orderId,
        status: 'accepted',
        timestamp: new Date(),
      });

      // Notify customer
      await notifyService.sendNotification({
        userId: order.customer_id,
        orderId: order.id,
        type: 'order_accepted',
        title: 'Order Accepted',
        message: 'Driver has accepted your order and is on the way.',
      }, io);

      // Emit to driver room (if needed)
      socket.emit('order:status_update', {
        orderId,
        status: 'accepted',
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error in accepting order:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });

  // Driver rejects an order
  socket.on('driver:reject_order', async ({ orderId }) => {
    try {
      // Verify the order exists and is in assigned status
      const order = await Order.findById(orderId);
      if (!order) {
        return socket.emit('error', { message: 'Order not found' });
      }
      if (order.status !== 'assigned') {
        return socket.emit('error', { message: 'Order is not assigned' });
      }
      if (order.driver_id !== socket.userId) {
        return socket.emit('error', { message: 'Not assigned to this order' });
      }
      if (socket.userRole !== 'driver') {
        return socket.emit('error', { message: 'Unauthorized: Not a driver' });
      }

      // Update order status back to pending (so it can be reassigned)
      const updatedOrder = await Order.updateStatus(orderId, 'pending');
      // Also remove the driver assignment
      await pool.query(
        `UPDATE orders SET driver_id = NULL WHERE id = $1`,
        [orderId]
      );

      // Emit to the order room (customer and driver)
      io.to(`order:${orderId}`).emit('order:status_update', {
        orderId,
        status: 'pending',
        timestamp: new Date(),
      });

      // Notify customer that we are looking for a new driver
      await notifyService.sendNotification({
        userId: order.customer_id,
        orderId: order.id,
        type: 'assignment_timeout',
        title: 'Finding new driver',
        message: 'Driver rejected the order. We are finding a new driver for you.',
      }, io);

      // Emit to driver room (if needed)
      socket.emit('order:status_update', {
        orderId,
        status: 'pending',
        timestamp: new Date(),
      });

      // Trigger reassignment via the assignment engine (we'll call the assignment engine)
      const AssignmentEngine = require('../services/assignmentEngine');
      try {
        await AssignmentEngine.assignDriver(orderId);
      } catch (assignmentError) {
        console.error('Error in reassignment:', assignmentError);
        // If reassignment fails, we might want to notify admin
        // For now, we just log it
      }
    } catch (error) {
      console.error('Error in rejecting order:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });

  // Driver picks up the order
  socket.on('driver:pickup_order', async ({ orderId }) => {
    try {
      // Verify the order exists and is in accepted status
      const order = await Order.findById(orderId);
      if (!order) {
        return socket.emit('error', { message: 'Order not found' });
      }
      if (order.status !== 'accepted') {
        return socket.emit('error', { message: 'Order is not accepted' });
      }
      if (order.driver_id !== socket.userId) {
        return socket.emit('error', { message: 'Not assigned to this order' });
      }
      if (socket.userRole !== 'driver') {
        return socket.emit('error', { message: 'Unauthorized: Not a driver' });
      }

      // Update order status to picked_up
      const updatedOrder = await Order.updateStatus(orderId, 'picked_up');

      // Emit to the order room (customer and driver)
      io.to(`order:${orderId}`).emit('order:status_update', {
        orderId,
        status: 'picked_up',
        timestamp: new Date(),
      });

      // Notify customer
      await notifyService.sendNotification({
        userId: order.customer_id,
        orderId: order.id,
        type: 'order_picked_up',
        title: 'Order Picked Up',
        message: 'Your package has been picked up and is on the way.',
      }, io);
    } catch (error) {
      console.error('Error in picking up order:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });

  // Driver delivers the order
  socket.on('driver:deliver_order', async ({ orderId, proofPhoto }) => {
    try {
      // Verify the order exists and is in picked_up status
      const order = await Order.findById(orderId);
      if (!order) {
        return socket.emit('error', { message: 'Order not found' });
      }
      if (order.status !== 'picked_up') {
        return socket.emit('error', { message: 'Order is not picked up' });
      }
      if (order.driver_id !== socket.userId) {
        return socket.emit('error', { message: 'Not assigned to this order' });
      }
      if (socket.userRole !== 'driver') {
        return socket.emit('error', { message: 'Unauthorized: Not a driver' });
      }

      // For now, we'll assume the proofPhoto is a URL (in reality, we'd need to upload it)
      // We'll update the order with the proofPhoto URL and set status to delivered
      const updatedOrder = await Order.markDelivered(orderId, proofPhoto);

      // Emit to the order room (customer and driver)
      io.to(`order:${orderId}`).emit('order:delivered', {
        orderId,
        proofUrl: proofPhoto,
        deliveredAt: new Date(),
      });

      // Notify customer
      await notifyService.sendNotification({
        userId: order.customer_id,
        orderId: order.id,
        type: 'order_delivered',
        title: 'Order Delivered',
        message: 'Your order has been delivered. Please rate your driver.',
      }, io);
    } catch (error) {
      console.error('Error in delivering order:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });

  // Admin joins the dashboard for live updates
  socket.on('admin:join_dashboard', async () => {
    try {
      if (socket.userRole !== 'admin') {
        return socket.emit('error', { message: 'Unauthorized: Not an admin' });
      }
      socket.join('admin');
      console.log(`Admin ${socket.userId} joined admin room`);

      // We'll emit the initial live update
      // We'll need to get all online drivers and active orders
      // For now, we'll just send an empty array and count 0
      io.to('admin').emit('admin:live_update', {
        allDriverLocations: [],
        activeOrderCount: 0,
      });
    } catch (error) {
      console.error('Error in admin joining dashboard:', error);
      socket.emit('error', { message: 'Internal server error' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Order socket disconnected:', socket.id);
  });
};