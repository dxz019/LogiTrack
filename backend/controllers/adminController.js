const pool = require('../config/db');
const logger = require('../config/logger');
const ForecastService = require('../services/forecastService');
const Order = require('../models/Order');

class AdminController {
  /**
   * Get all orders with pagination and filtering
   * GET /api/admin/orders
   */
  static async getOrders(req, res) {
    try {
      const { status, limit = 20, offset = 0 } = req.query;
      
      let query = `
        SELECT o.*, 
               u1.name as customer_name,
               u2.name as driver_name
        FROM orders o
        JOIN users u1 ON o.customer_id = u1.id
        LEFT JOIN users u2 ON o.driver_id = u2.id
      `;
      const values = [];

      if (status) {
        query += ` WHERE o.status = $1`;
        values.push(status);
      }

      query += ` ORDER BY o.created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
      values.push(limit, offset);

      const result = await pool.query(query, values);
      
      const countResult = await pool.query(
        status ? 'SELECT COUNT(*) FROM orders WHERE status = $1' : 'SELECT COUNT(*) FROM orders',
        status ? [status] : []
      );

      res.json({
        orders: result.rows,
        total: parseInt(countResult.rows[0].count),
      });
    } catch (error) {
      logger.error('Error fetching admin orders:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  /**
   * Get all drivers with live locations
   * GET /api/admin/drivers
   */
  static async getDrivers(req, res) {
    try {
      const result = await pool.query(`
        SELECT d.*, u.name, u.email, u.phone,
               ST_X(d.current_location) as longitude,
               ST_Y(d.current_location) as latitude
        FROM drivers d
        JOIN users u ON d.id = u.id
      `);
      res.json({ drivers: result.rows });
    } catch (error) {
      logger.error('Error fetching drivers:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  /**
   * Manually assign driver
   * PUT /api/admin/orders/:id/assign
   */
  static async assignDriver(req, res) {
    try {
      const { driverId } = req.body;
      const orderId = req.params.id;

      const updatedOrder = await Order.assignDriver(orderId, driverId);

      // Emit driver_assigned event
      const io = req.app.get('io');
      if (io) {
        const Driver = require('../models/Driver');
        const driverInfo = await Driver.getDriverWithLocation(driverId);
        
        io.to(`order:${orderId}`).emit('order:driver_assigned', {
          orderId,
          driver: {
            name: driverInfo.name,
            phone: driverInfo.phone,
            vehicle: driverInfo.vehicle_type,
            rating: driverInfo.rating,
          },
        });
        io.to(`order:${orderId}`).emit('order:status_update', {
          orderId,
          status: 'assigned',
          timestamp: new Date().toISOString(),
        });
      }

      res.json({ order: updatedOrder });
    } catch (error) {
      logger.error('Error manually assigning driver:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  /**
   * Get KPI stats
   * GET /api/admin/stats
   */
  static async getStats(req, res) {
    try {
      const activeOrdersResult = await pool.query("SELECT COUNT(*) FROM orders WHERE status NOT IN ('delivered', 'cancelled')");
      const activeDriversResult = await pool.query("SELECT COUNT(*) FROM drivers WHERE is_online = true AND is_available = true");
      
      res.json({
        activeOrders: parseInt(activeOrdersResult.rows[0].count),
        availableDrivers: parseInt(activeDriversResult.rows[0].count),
        // Add more stats as needed
      });
    } catch (error) {
      logger.error('Error fetching stats:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  /**
   * Get demand forecast
   * GET /api/admin/forecast
   */
  static async getForecast(req, res) {
    try {
      const forecast = await ForecastService.generateForecast();
      res.json({ forecast });
    } catch (error) {
      logger.error('Error getting forecast:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
}

module.exports = AdminController;
