const axios = require('axios');

const GOOGLE_MAPS_SERVER_KEY = process.env.GOOGLE_MAPS_SERVER_KEY;

class MapsService {
  /**
   * Geocode an address to get latitude and longitude
   * Uses mock coordinates in demo mode (no API key)
   * @param {string} address - Address to geocode
   * @returns {Promise<{lat: number, lng: number}>}
   */
  static async geocode(address) {
    if (!GOOGLE_MAPS_SERVER_KEY || GOOGLE_MAPS_SERVER_KEY === 'your_google_maps_server_key') {
      return this.getMockGeocode(address);
    }
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: address,
          key: GOOGLE_MAPS_SERVER_KEY,
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }

      const location = response.data.results[0].geometry.location;
      return { lat: location.lat, lng: location.lng };
    } catch (error) {
      console.error('Error in geocoding:', error);
      throw error;
    }
  }

  // Mock geocode for demo/development mode
  static getMockGeocode(address) {
    const hash = [...address].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    // Generate pseudo-random coordinates based on address hash for consistent results
    const lat = 40.7128 + (hash % 100) / 1000;
    const lng = -74.0060 + (hash % 100) / 1000;
    return { lat, lng };
  }

  /**
   * Get directions between two points (for route polyline)
   * Uses mock data in demo mode (no API key)
   * @param {number} originLat - Origin latitude
   * @param {number} originLng - Origin longitude
   * @param {number} destLat - Destination latitude
   * @param {number} destLng - Destination longitude
   * @returns {Promise<{distance: number, duration: number, polyline: string}>}
   */
  static async getDirections(originLat, originLng, destLat, destLng) {
    if (!GOOGLE_MAPS_SERVER_KEY || GOOGLE_MAPS_SERVER_KEY === 'your_google_maps_server_key') {
      return this.getMockDirections();
    }
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
        params: {
          origin: `${originLat},${originLng}`,
          destination: `${destLat},${destLng}`,
          key: GOOGLE_MAPS_SERVER_KEY,
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Directions failed: ${response.data.status}`);
      }

      const route = response.data.routes[0];
      const leg = route.legs[0];
      const distance = leg.distance.value / 1000; // Convert meters to kilometers
      const duration = leg.duration.value / 60;   // Convert seconds to minutes
      const polyline = route.overview_polyline.points;

      return { distance, duration, polyline };
    } catch (error) {
      console.error('Error in getting directions:', error);
      throw error;
    }
  }

  static getMockDirections() {
    return {
      distance: 5.2,
      duration: 18,
      polyline: 'a~}jHaik~cA@eA}AeA}AeA}AeA}AeA}AeA}'
    };
  }

  /**
   * Calculate distance and duration using Google Routes API (more advanced)
   * @param {number} originLat - Origin latitude
   * @param {number} originLng - Origin longitude
   * @param {number} destLat - Destination latitude
   * @param {number} destLng - Destination longitude
   * @returns {Promise<{distance: number, duration: number, polyline: string}>}
   */
  static async getRoutes(originLat, originLng, destLat, destLng) {
    try {
      const response = await axios.post(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        {
          origin: {
            location: {
              latLng: {
                latitude: originLat,
                longitude: originLng,
              },
            },
          },
          destination: {
            location: {
              latLng: {
                latitude: destLat,
                longitude: destLng,
              },
            },
          },
          travelMode: 'DRIVE',
          // We can specify additional parameters like routingPreference, etc.
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': GOOGLE_MAPS_SERVER_KEY,
            'X-Goog-FieldMask': 'routes.distance,routes.duration,routes.polyline.encodedPolyline',
          },
        }
      );

      if (!response.data.routes || response.data.routes.length === 0) {
        throw new Error('No routes found');
      }

      const route = response.data.routes[0];
      const distance = route.distance / 1000; // Convert meters to kilometers
      const duration = route.duration / 60;   // Convert seconds to minutes (assuming duration is in seconds)
      const polyline = route.polyline.encodedPolyline;

      return { distance, duration, polyline };
    } catch (error) {
      console.error('Error in getting routes:', error);
      throw error;
    }
  }

  /**
   * Get place autocomplete suggestions (for client-side, but we can use server-side for validation)
   * @param {string} input - User input
   * @param {string} sessionToken - Session token for autocomplete
   * @returns {Promise<Array>}
   */
  static async getPlaceAutocomplete(input, sessionToken) {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
        params: {
          input: input,
          key: GOOGLE_MAPS_SERVER_KEY,
          sessiontoken: sessionToken,
          types: 'address',
        },
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Place autocomplete failed: ${response.data.status}`);
      }

      return response.data.predictions;
    } catch (error) {
      console.error('Error in place autocomplete:', error);
      throw error;
    }
  }
}

module.exports = MapsService;