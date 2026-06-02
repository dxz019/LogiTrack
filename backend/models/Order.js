// Order model - handles order CRUD operations
// Uses PostGIS geometry columns for location data

const pool = require('../config/db');

class Order {
  // Create new order with pickup/delivery locations
  // Locations stored as PostGIS Point geometry
  static async create({
    customerId, pickupAddress, pickupLat, pickupLng,
    deliveryAddress, deliveryLat, deliveryLng,
    packageDescription, priority = 'normal', notes
  }) {
    const result = await pool.query(
      `INSERT INTO orders (customer_id, pickup_address, pickup_location, delivery_address, delivery_location, package_description, priority, notes)
       VALUES ($1, $2, ST_SetSRID(ST_MakePoint($4, $3), 4326), $5, ST_SetSRID(ST_MakePoint($7, $6), 4326), $8, $9, $10)
       RETURNING *`,
      [customerId, pickupAddress, pickupLng, pickupLat, deliveryAddress, deliveryLng, deliveryLat, packageDescription, priority, notes]
    );
    return result.rows[0];
  }

  // Find order by ID - returns with lat/lng coordinates
  static async findById(orderId) {
    const result = await pool.query(
      `SELECT o.*, ST_X(o.pickup_location) as pickup_lng, ST_Y(o.pickup_location) as pickup_lat,
              ST_X(o.delivery_location) as delivery_lng, ST_Y(o.delivery_location) as delivery_lat
       FROM orders o WHERE o.id = $1`,
      [orderId]
    );
    return result.rows[0];
  }

  // Get orders for a customer
  static async findByCustomerId(customerId) {
    const result = await pool.query(
      `SELECT o.*, ST_X(o.pickup_location) as pickup_lng, ST_Y(o.pickup_location) as pickup_lat
       FROM orders o WHERE o.customer_id = $1 ORDER BY o.created_at DESC`,
      [customerId]
    );
    return result.rows;
  }

  // Get all orders (for admin)
  static async findAll() {
    const result = await pool.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email
       FROM orders o JOIN users u ON o.customer_id = u.id ORDER BY o.created_at DESC`
    );
    return result.rows;
  }

  // Update order status
  static async updateStatus(orderId, status) {
    const result = await pool.query(
      `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, orderId]
    );
    return result.rows[0];
  }

  // Assign driver to order
  static async assignDriver(orderId, driverId) {
    const result = await pool.query(
      `UPDATE orders SET driver_id = $1, status = 'assigned', updated_at = NOW() WHERE id = $2 RETURNING *`,
      [driverId, orderId]
    );
    return result.rows[0];
  }

  static async updateETA(orderId, eta) {
    const result = await pool.query(
      `UPDATE orders SET eta = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [eta, orderId]
    );
    return result.rows[0];
  }

  static async updateDistanceDuration(orderId, distance, duration, polyline = null) {
    const result = await pool.query(
      `UPDATE orders SET estimated_distance = $1, estimated_duration = $2, route_polyline = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
      [distance, duration, polyline, orderId]
    );
    return result.rows[0];
  }

  static async markPickedUp(orderId) {
    const result = await pool.query(
      `UPDATE orders SET status = 'picked_up', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [orderId]
    );
    return result.rows[0];
  }

  static async markDelivered(orderId, proofUrl) {
    const result = await pool.query(
      `UPDATE orders SET status = 'delivered', actual_delivery = NOW(), delivery_proof_url = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [orderId, proofUrl]
    );
    return result.rows[0];
  }

  static async cancelOrder(orderId) {
    const result = await pool.query(
      `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [orderId]
    );
    return result.rows[0];
  }

  static async getTrackingLogs(orderId) {
    const result = await pool.query(
      `SELECT tl.*, ST_X(tl.location) as lng, ST_Y(tl.location) as lat
       FROM tracking_logs tl WHERE tl.order_id = $1 ORDER BY tl.recorded_at ASC`,
      [orderId]
    );
    return result.rows;
  }
}

module.exports = Order;