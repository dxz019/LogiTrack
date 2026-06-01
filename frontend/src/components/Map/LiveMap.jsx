import React, { useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, DirectionsRenderer } from '@react-google-maps/api';
import { Skeleton } from 'primereact/skeleton';
import { Card } from 'primereact/card';

const containerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '300px'
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const defaultMapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  styles: [
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#ffffff' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#000000' }]
    },
    {
      featureType: 'administrative',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }, { weight: 1.5 }]
    },
    {
      featureType: 'landscape',
      stylers: [{ color: '#1e293b' }]
    },
    {
      featureType: 'water',
      stylers: [{ color: '#0f172a' }]
    }
  ]
};

export const LiveMap = ({ pickupLocation, deliveryLocation, driverLocation, routePolyline }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDUMMY_API_KEY_FOR_DEMO',
    libraries: ['places']
  });

  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const driverMarkerRef = useRef(null);

  const onLoad = React.useCallback(function callback(mapInstance) {
    const bounds = new window.google.maps.LatLngBounds();
    if (pickupLocation) bounds.extend(new window.google.maps.LatLng(pickupLocation.lat, pickupLocation.lng));
    if (deliveryLocation) bounds.extend(new window.google.maps.LatLng(deliveryLocation.lat, deliveryLocation.lng));
    if (driverLocation) bounds.extend(new window.google.maps.LatLng(driverLocation.lat, driverLocation.lng));
    
    if (!bounds.isEmpty()) {
      mapInstance.fitBounds(bounds, { padding: 100 });
    }
    setMap(mapInstance);
  }, [pickupLocation, deliveryLocation, driverLocation]);

  const onUnmount = React.useCallback(function callback() {
    setMap(null);
  }, []);

  // Animate driver marker smoothly
  useEffect(() => {
    if (map && driverLocation) {
      map.panTo(driverLocation);
    }
  }, [driverLocation, map]);

  // Determine center - prefer pickup, then driver, then default
  const mapCenter = pickupLocation || driverLocation || defaultCenter;

  if (loadError) {
    return (
      <div className="flex align-items-center justify-content-center h-full bg-gray-900 border-round-xl">
        <div className="text-center p-4">
          <i className="pi pi-exclamation-triangle text-4xl text-red-400 mb-3"></i>
          <p className="text-gray-400">Unable to load map. Please check your API key.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex align-items-center justify-content-center h-full bg-gray-900 border-round-xl">
        <div className="text-center">
          <Skeleton shape="circle" size="4rem" className="mb-3" />
          <Skeleton width="12rem" className="mb-2" />
          <Skeleton width="8rem" />
        </div>
      </div>
    );
  }

  return (
    <Card className="h-full border-round-xl overflow-hidden shadow-2 glass-card" style={{ background: 'rgba(30,41,59,0.3)' }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={defaultMapOptions}
      >
        {/* Pickup Pin with custom styling */}
        {pickupLocation && (
          <Marker 
            position={pickupLocation} 
            icon={{
              url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2310b981"%3E%3Ccircle cx="12" cy="12" r="12"/%3E%3Ctext x="12" y="16" font-size="10" text-anchor="middle" fill="white"%3E📍%3C/text%3E%3C/svg%3E',
              scaledSize: new window.google.maps.Size(40, 40)
            }}
          />
        )}
        
        {/* Delivery Pin with custom styling */}
        {deliveryLocation && (
          <Marker 
            position={deliveryLocation} 
            icon={{
              url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444"%3E%3Ccircle cx="12" cy="12" r="12"/%3E%3Ctext x="12" y="16" font-size="10" text-anchor="middle" fill="white"%3E🏁%3C/text%3E%3C/svg%3E',
              scaledSize: new window.google.maps.Size(40, 40)
            }}
          />
        )}

        {/* Driver Pin (truck icon) */}
        {driverLocation && (
          <Marker 
            position={driverLocation} 
            icon={{
              url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6"%3E%3Ccircle cx="12" cy="12" r="12"/%3E%3Ctext x="12" y="16" font-size="10" text-anchor="middle" fill="white"%3E🚚%3C/text%3E%3C/svg%3E',
              scaledSize: new window.google.maps.Size(40, 40)
            }}
            ref={driverMarkerRef}
            animation={window.google.maps.Animation.BOUNCE}
          />
        )}

        {/* Route Polyline */}
        {routePolyline && routePolyline.length > 0 && (
          <Polyline
            path={routePolyline}
            options={{
              strokeColor: '#3b82f6',
              strokeOpacity: 0.8,
              strokeWeight: 6,
              geodesic: true
            }}
          />
        )}
      </GoogleMap>
    </Card>
  );
};

export default LiveMap;