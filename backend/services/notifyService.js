const pool = require('../config/db');
const nodemailer = require('nodemailer');
const axios = require('axios');

class NotifyService {
  constructor() {
    // Nodemailer transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Create a notification and send it
   * @param {Object} notificationData - { userId, orderId, type, title, message }
   * @param {Object} io - Socket.io instance (for emitting)
   * @returns {Promise<Object>} Created notification
   */
  async sendNotification(notificationData, io) {
    const { userId, orderId, type, title, message } = notificationData;

    // 1. Insert row into notifications table
    const notification = await this.createNotification(userId, orderId, type, title, message);

    // 2. Emit notification:new via Socket.io to user room
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', notification);
    }

    // 3. Send FCM push if user has fcm_token
    const user = await this.getUserFcmToken(userId);
    if (user && user.fcm_token) {
      await this.sendPushNotification(user.fcm_token, title, message);
    }

    // 4. Send email via Nodemailer for key events (placed, delivered)
    if (type === 'order_placed' || type === 'order_delivered') {
      await this.sendEmailNotification(userId, title, message);
    }

    return notification;
  }

  /**
   * Create notification in database
   */
  async createNotification(userId, orderId, type, title, message) {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, order_id, type, title, message)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [userId, orderId, type, title, message]
    );
    return result.rows[0];
  }

  /**
   * Get user's FCM token
   */
  async getUserFcmToken(userId) {
    const result = await pool.query('SELECT fcm_token FROM users WHERE id = $1', [userId]);
    return result.rows[0];
  }

  /**
   * Send push notification via FCM
   * @param {string} fcmToken - FCM token of the user
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   */
  async sendPushNotification(fcmToken, title, body) {
    try {
      await axios.post(
        'https://fcm.googleapis.com/fcm/send',
        {
          to: fcmToken,
          notification: {
            title: title,
            body: body,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
          },
        }
      );
    } catch (error) {
      console.error('Error sending FCM notification:', error);
      // We don't throw because we don't want to fail the whole process
    }
  }

  /**
   * Send email notification
   * @param {string} userId - User ID
   * @param {string> subject - Email subject
   * @param {string} text - Email body
   */
  async sendEmailNotification(userId, subject, text) {
    try {
      // Get user's email
      const user = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
      const email = user.rows[0].email;

      await this.transporter.sendMail({
        from: '"LogiTrack" <noreply@logitrack.com>', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
      });
    } catch (error) {
      console.error('Error sending email:', error);
      // We don't throw because we don't want to fail the whole process
    }
  }
}

module.exports = new NotifyService();