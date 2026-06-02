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

  static async getDriverProfile(req, res) {
    try {
      const driverId = req.params.id;
      const result = await pool.query(`
        SELECT d.*, u.name, u.email, u.phone, u.role
        FROM drivers d
        JOIN users u ON d.id = u.id
        WHERE d.id = $1
      `, [driverId]);
      if (!result.rows.length) {
        return res.status(404).json({ message: 'Driver not found', code: 'DRIVER_NOT_FOUND' });
      }
      res.json({ driver: result.rows[0] });
    } catch (error) {
      logger.error('Error fetching driver profile:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }

  static async updateDriverProfile(req, res) {
    try {
      const driverId = req.params.id;
      const updates = req.body;

      const allowedDriverFields = ['vehicle_type','vehicle_number','license_number','vehicle_registration','aadhar_card','address','zone'];
      const allowedUserFields = ['name','email','phone'];

      const driverSet = [];
      const userSet = [];
      const values = [];
      let idx = 1;

      Object.keys(updates).forEach((key) => {
        if (allowedDriverFields.includes(key) && updates[key] !== undefined) {
          driverSet.push(`${key} = $${idx}`);
          values.push(updates[key]);
          idx++;
        } else if (allowedUserFields.includes(key) && updates[key] !== undefined) {
          userSet.push(`${key} = $${idx}`);
          values.push(updates[key]);
          idx++;
        }
      });

      if (!driverSet.length && !userSet.length) {
        return res.status(400).json({ message: 'No valid fields provided', code: 'NO_VALID_FIELDS' });
      }

      values.push(driverId);

      if (driverSet.length) {
        const sql = `UPDATE drivers SET ${driverSet.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
        await pool.query(sql, values);
      }

      if (userSet.length) {
        const sql = `UPDATE users SET ${userSet.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id`;
        await pool.query(sql, values);
      }

      const result = await pool.query(`
        SELECT d.*, u.name, u.email, u.phone
        FROM drivers d
        JOIN users u ON d.id = u.id
        WHERE d.id = $1
      `, [driverId]);

      res.json({ driver: result.rows[0] });
    } catch (error) {
      logger.error('Error updating driver profile:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
}

module.exports = AdminController;
