const pool = require('../config/db');

class Notification {
  static async create({ userId, orderId, type, title, message }) {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, order_id, type, title, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, orderId, type, title, message]
    );
    return result.rows[0];
  }

  static async findByUserId(userId, { limit = 20, offset = 0 } = {}) {
    const result = await pool.query(
      `SELECT n.*, 
              o.id as order_id, o.status as order_status
       FROM notifications n
       LEFT JOIN orders o ON n.order_id = o.id
       WHERE n.user_id = $1
       ORDER BY n.sent_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async markAsRead(notificationId) {
    const result = await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *`,
      [notificationId]
    );
    return result.rows[0];
  }
}

module.exports = Notification;