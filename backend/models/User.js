// User model - handles authentication and user profile operations
// Interacts with the 'users' table in PostgreSQL

const pool = require('../config/db');

class User {
  /**
   * Create a new user with hashed password
   * @param {Object} userData - { name, email, passwordHash, role, phone, fcmToken }
   */
  static async create({ name, email, passwordHash, role = 'customer', phone, fcmToken }) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone, fcm_token)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, email, passwordHash, role, phone, fcmToken]
    );
    return result.rows[0];
  }

  // Find user by email - used for login
  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  // Find user by ID - used for profile
  static async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Update FCM token for push notifications
  static async updateFcmToken(userId, fcmToken) {
    const result = await pool.query(
      `UPDATE users SET fcm_token = $1 WHERE id = $2 RETURNING *`,
      [fcmToken, userId]
    );
    return result.rows[0];
  }
}

module.exports = User;