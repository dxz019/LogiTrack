const pool = require('../config/db');

class Driver {
  static async create(userId, { vehicleType, vehicleNumber, zone }) {
    const result = await pool.query(
      `INSERT INTO drivers (id, vehicle_type, vehicle_number, zone)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, vehicleType, vehicleNumber, zone]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await pool.query('SELECT * FROM drivers WHERE id = $1', [userId]);
    return result.rows[0];
  }

  static async updateLocation(driverId, lat, lng) {
    const result = await pool.query(
      `UPDATE drivers 
       SET current_location = ST_SetSRID(ST_MakePoint($2, $1), 4326),
           updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [lng, lat, driverId]
    );
    return result.rows[0];
  }

  static async setAvailability(driverId, isAvailable) {
    const result = await pool.query(
      `UPDATE drivers SET is_available = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [isAvailable, driverId]
    );
    return result.rows[0];
  }

  static async setOnline(driverId, isOnline) {
    const result = await pool.query(
      `UPDATE drivers SET is_online = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [isOnline, driverId]
    );
    return result.rows[0];
  }

  static async getOnlineAvailableDrivers() {
    const result = await pool.query(
      `SELECT d.*, u.name, u.phone, u.email
       FROM drivers d
       JOIN users u ON d.id = u.id
       WHERE d.is_online = true AND d.is_available = true`
    );
    return result.rows;
  }

  static async getDriverWithLocation(driverId) {
    const result = await pool.query(
      `SELECT d.*, u.name, u.phone, u.email,
              ST_X(d.current_location) as longitude,
              ST_Y(d.current_location) as latitude
       FROM drivers d
       JOIN users u ON d.id = u.id
       WHERE d.id = $1`,
      [driverId]
    );
    return result.rows[0];
  }
}

module.exports = Driver;