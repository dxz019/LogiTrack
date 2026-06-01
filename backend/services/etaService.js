const MapsService = require('./mapsService');

class ETAService {
  /**
   * Calculate ETA from driver's current location to delivery location
   * @param {number} driverLat - Driver's latitude
   * @param {number} driverLng - Driver's longitude
   * @param {number} destLat - Destination latitude
   * @param {number} destLng - Destination longitude
   * @param {string} priority - Order priority ('normal', 'express', 'urgent')
   * @param {boolean} isTrafficHeavy - Whether traffic is heavy (we can get this from Routes API)
   * @returns {Promise<{eta: Date, distance: number, duration: number}>}
   */
  static async calculateETA(driverLat, driverLng, destLat, destLng, priority = 'normal', isTrafficHeavy = false) {
    try {
      // Use Google Routes API to get duration
      const { distance, duration } = await MapsService.getRoutes(driverLat, driverLng, destLat, destLng);

      // Add buffer based on traffic and priority
      let buffer = 0;
      if (isTrafficHeavy) {
        buffer += 0.1; // 10% buffer for heavy traffic
      }
      if (priority === 'normal') {
        buffer += 0.05; // 5% buffer for normal priority
      }
      // express and urgent get no extra buffer beyond traffic

      const bufferedDuration = duration * (1 + buffer);

      // Calculate ETA as current time + bufferedDuration minutes
      const eta = new Date(Date.now() + bufferedDuration * 60 * 1000);

      return { eta, distance, duration: bufferedDuration };
    } catch (error) {
      console.error('Error in calculating ETA:', error);
      throw error;
    }
  }

  /**
   * Update ETA for an order in the database
   * @param {string} orderId - Order ID
   * @param {Date} eta - ETA timestamp
   */
  static async updateOrderETA(orderId, eta) {
    // We'll use the Order model to update the eta
    const Order = require('../models/Order');
    return await Order.updateETA(orderId, eta);
  }
}

module.exports = ETAService;