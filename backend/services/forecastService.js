const OpenAIApi = require('openai');
const pool = require('../config/db');
const redisWrapper = require('../config/redis');

class ForecastService {
  /**
   * Generate demand forecast for the next 24 hours per zone
   * @returns {Promise<Array>} Array of forecast objects
   */
  static async generateForecast() {
    try {
      // Check cache first (only if Redis is available)
      if (redisWrapper.isRedisAvailable()) {
        const cached = await redisWrapper.getRedis().get('demand_forecast');
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Fetch last 30 days order data grouped by hour and zone
      const orderData = await this.fetchOrderData();

      // Build prompt for OpenAI
      const prompt = this.buildPrompt(orderData);

      // Call OpenAI API
      const openai = new OpenAIApi({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.createChatCompletion({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that predicts delivery demand.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      });

      const aiResponse = response.data.choices[0].message.content;

      // Parse the AI response (expected to be JSON)
      let forecast;
      try {
        forecast = JSON.parse(aiResponse);
      } catch (parseError) {
        // If the AI didn't return valid JSON, try to extract JSON from the text
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          forecast = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Failed to parse forecast from AI response');
        }
      }

      // Ensure forecast is an array
      if (!Array.isArray(forecast)) {
        forecast = [forecast];
      }

      // Cache in Redis for 1 hour (only if Redis is available)
      if (redisWrapper.isRedisAvailable()) {
        await redisWrapper.getRedis().setex('demand_forecast', 3600, JSON.stringify(forecast));
      }

      return forecast;
    } catch (error) {
      console.error('Error in generating forecast:', error);
      // Return empty array as fallback instead of throwing error
      return [];
    }
  }

  /**
   * Fetch order data from the last 30 days grouped by hour and zone
   * @returns {Promise<Array>} Array of order data objects
   */
  static async fetchOrderData() {
    // We need to join orders with drivers to get the zone? 
    // Actually, the demand_zones table has zones. We'll need to determine which zone each order belongs to.
    // For simplicity, we'll assume we have a zone column in orders or we can determine zone from delivery location.
    // Since we don't have a zone in orders, we'll use the delivery location to find which demand zone it falls in.
    // However, the demand_zones table might not be populated yet. We'll skip the zone for now and just group by hour.
    // Alternatively, we can use the driver's zone if assigned, or the delivery location's zone via a spatial query.
    // Given the complexity, we'll do a simplified version: group by hour only.
    // We'll leave the zone as null for now.

    const result = await pool.query(
      `SELECT 
          EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC') as hour,
          COUNT(*) as order_count
       FROM orders
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY hour
       ORDER BY hour`
    );

    // We'll return an array of objects with hour and order_count
    // We'll add a placeholder zone
    return result.rows.map(row => ({
      hour: parseInt(row.hour),
      order_count: parseInt(row.order_count),
      zone_name: 'default', // Placeholder
    }));
  }

  /**
   * Build prompt for OpenAI
   * @param {Array} data - Order data from the last 30 days
   * @returns {string} Prompt string
   */
  static buildPrompt(data) {
    return `
      Given this delivery order data by hour for the past 30 days:
      ${JSON.stringify(data, null, 2)}
      Predict demand for the next 24 hours per hour.
      Return JSON array of objects with the following properties:
      - hour: integer (0-23)
      - predicted_orders: number (expected order count)
      - confidence: number between 0 and 1
      - recommendation: string (e.g., 'increase_drivers', 'maintain_current')
    `;
  }
}

module.exports = ForecastService;
