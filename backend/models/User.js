const pool = require('../config/db');

class User {
  static async create({ name, email, passwordHash, role = 'customer', phone, fcmToken }) {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone, fcm_token)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, email, passwordHash, role, phone, fcmToken]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async updateFcmToken(userId, fcmToken) {
    const result = await pool.query(
      `UPDATE users SET fcm_token = $1 WHERE id = $2 RETURNING *`,
      [fcmToken, userId]
    );
    return result.rows[0];
  }
}

module.exports = User;