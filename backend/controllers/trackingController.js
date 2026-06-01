const pool = require('../config/db');
const logger = require('../config/logger');

class TrackingController {
  /**
   * Get full GPS trail polyline for an order
   * GET /api/tracking/:orderId/history
   */
  static async getTrackingHistory(req, res) {
    try {
      const { orderId } = req.params;

      // Verify order exists
      const orderResult = await pool.query('SELECT id, customer_id, driver_id FROM orders WHERE id = $1', [orderId]);
      if (orderResult.rows.length === 0) {
        return res.status(404).json({ message: 'Order not found', code: 'ORDER_NOT_FOUND' });
      }

      const order = orderResult.rows[0];

      // Access control: customer can only see their own, driver can see assigned, admin sees all
      if (req.user.role === 'customer' && order.customer_id !== req.user.userId) {
        return res.status(403).json({ message: 'Access denied', code: 'FORBIDDEN' });
      }
      if (req.user.role === 'driver' && order.driver_id !== req.user.userId) {
        return res.status(403).json({ message: 'Access denied', code: 'FORBIDDEN' });
      }

      const result = await pool.query(
        `SELECT
           tl.id,
           ST_X(tl.location) as lng,
           ST_Y(tl.location) as lat,
           tl.speed,
           tl.heading,
           tl.recorded_at
         FROM tracking_logs tl
         WHERE tl.order_id = $1
         ORDER BY tl.recorded_at ASC`,
        [orderId]
      );

      // Build a GeoJSON LineString from the points
      const coordinates = result.rows.map((row) => [
        parseFloat(row.lng),
        parseFloat(row.lat),
      ]);

      const geojson = {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates,
        },
        properties: {
          orderId,
          pointCount: result.rows.length,
        },
      };

      res.json({
        trackingHistory: result.rows,
        geojson,
      });
    } catch (error) {
      logger.error('Error fetching tracking history:', error);
      res.status(500).json({ message: 'Internal server error', code: 'INTERNAL_ERROR' });
    }
  }
}

module.exports = TrackingController;
