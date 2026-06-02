// GEOLOCATION HOOK — GETS USER'S CURRENT POSITION
// USAGE: const { location, error, loading, getCurrentLocation } = useGeolocation();
// CLIENT-ONLY: guard all navigator.geolocation calls with typeof window !== 'undefined'

import { useState, useEffect, useCallback } from 'react';

export const useGeolocation = (options = {}) => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      options,
    );
  }, [options]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      getCurrentLocation();
    }
  }, [getCurrentLocation]);

  return { location, error, loading, getCurrentLocation };
};

export default useGeolocation;