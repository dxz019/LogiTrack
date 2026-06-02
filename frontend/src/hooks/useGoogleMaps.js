import { useState, useEffect } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

let loader = null;
let isLoaded = false;

export const useGoogleMaps = (apiKey) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key is required');
      return;
    }

    if (isLoaded) {
      setLoading(false);
      return;
    }

    const loadMap = async () => {
      setLoading(true);
      setError(null);
      try {
        loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places']
        });
        await loader.load();
        isLoaded = true;
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMap();
  }, [apiKey]);

  return { loading, error, isLoaded };
};

export default useGoogleMaps;
