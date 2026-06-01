import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

export const LiveMap = ({ pickupLocation, deliveryLocation, driverLocation, routePolyline }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = useState(null);
  const driverMarkerRef = useRef(null);

  // Parse polyline string back to lat/lng objects if needed, 
  // though @react-google-maps/api polyline component might accept the encoded string path directly.
  // We will assume routePolyline is an array of {lat, lng} objects for simplicity.

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    if (pickupLocation) bounds.extend(new window.google.maps.LatLng(pickupLocation.lat, pickupLocation.lng));
    if (deliveryLocation) bounds.extend(new window.google.maps.LatLng(deliveryLocation.lat, deliveryLocation.lng));
    if (driverLocation) bounds.extend(new window.google.maps.LatLng(driverLocation.lat, driverLocation.lng));
    
    // Check if bounds is empty to avoid error
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
    }
    setMap(map);
  }, [pickupLocation, deliveryLocation, driverLocation]);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  // Animate driver marker smoothly (simple version)
  useEffect(() => {
    if (map && driverLocation && driverMarkerRef.current) {
      // In a real app we'd use requestAnimationFrame to animate from previous pos to new pos
      // For now, it will jump to the new location provided by driverLocation prop
      map.panTo(driverLocation);
    }
  }, [driverLocation, map]);

  return isLoaded ? (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={pickupLocation || defaultCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        { /* Pickup Pin */ }
        {pickupLocation && (
          <Marker 
            position={pickupLocation} 
            icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' }}
          />
        )}
        
        { /* Delivery Pin */ }
        {deliveryLocation && (
          <Marker 
            position={deliveryLocation} 
            icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' }}
          />
        )}

        { /* Driver Pin */ }
        {driverLocation && (
          <Marker 
            position={driverLocation} 
            icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/truck.png' }}
            ref={driverMarkerRef}
            animation={window.google.maps.Animation.DROP}
          />
        )}

        { /* Route Line */ }
        {routePolyline && routePolyline.length > 0 && (
          <Polyline
            path={routePolyline}
            options={{
              strokeColor: '#3B82F6',
              strokeOpacity: 0.8,
              strokeWeight: 5,
            }}
          />
        )}
      </GoogleMap>
  ) : <div className="flex align-items-center justify-content-center h-full">Loading Map...</div>;
};

export default LiveMap;
