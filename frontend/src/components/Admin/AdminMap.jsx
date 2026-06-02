// AdminMap.jsx - Real-time fleet tracking dashboard component
// Displays interactive Google Map with driver locations and order markers
// Uses Three.js fallback when Google Maps API key is not configured

import React, { useState } from 'react';
import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { Card } from 'primereact/card';

// Map dimensions - fixed height for consistent layout
const containerStyle = { width: '100%', height: '500px' };

// Dark theme map styling for cyberpunk aesthetic
const mapOptions = {
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#050a14' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#e0f2ff' }] },
    { featureType: 'water', stylers: [{ color: '#001020' }] }
  ],
  // Minimal UI controls for clean interface
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false
};

// DemoMap - SVG-based fallback when Google Maps fails to load
// Renders simple driver and order icons on dark background
const DemoMap = ({ drivers, orders }) => (
  <div className="h-30rem flex items-center justify-center relative overflow-hidden" style={{ background: '#020614' }}>
    <svg viewBox="0 0 800 500" className="w-full h-full opacity-50">
      <defs>
        <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ff006e" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Render driver markers as triangles (semi-truck icon style) */}
      {drivers.map((_, i) => (
        <g key={i} transform={`translate(${100 + i * 120} ${150 + i * 80})`}>
          <path d="M0 -12 L12 -2 L6 2 L-6 2 Z" fill="#00d4ff" opacity="0.6" />
        </g>
      ))}
      {/* Render order markers as circles (delivery pin style) */}
      {orders.filter(o => ['pending', 'assigned'].includes(o.status)).map((_, i) => (
        <g key={i} transform={`translate(${200 + i * 100} ${250 + i * 60})`}>
          <circle cx="0" cy="0" r="8" fill="#ff006e" opacity="0.7" />
        </g>
      ))}
    </svg>
  </div>
);

// AdminMap - Main component for real-time logistics tracking
// Props: drivers (array of driver objects), orders (array of order objects)
// Features: Interactive map, marker clustering, info windows
export const AdminMap = ({ drivers = [], orders = [] }) => {
  // Load Google Maps API asynchronously
  // Returns isLoaded=true when API is ready, false during loading/failure
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    preventGoogleFontsLoading: true
  });
  
  // Track which marker was clicked for info window display
  const [activeInfo, setActiveInfo] = useState(null);
  
  // Default center coordinates (New York City)
  const defaultCenter = { lat: 40.7128, lng: -74.006 };
  
  // Filter pending orders for display
  const pendingOrders = orders.filter(o => ['pending', 'assigned'].includes(o.status));

  // Driver marker icon - triangle shape in cyan
  const driverIcon = {
    url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30"%3E%3Cpath d="M15 2 L22 15 L15 22 L8 15 Z" fill="%2300d4ff"/%3E%3C/svg%3E',
    scaledSize: typeof window !== 'undefined' && window.google?.maps ? new window.google.maps.Size(30, 30) : undefined
  };

  // Order marker icon - circle shape in magenta
  const orderIcon = {
    url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Ccircle cx="12" cy="12" r="10" fill="%23ff006e"/%3E%3C/svg%3E',
    scaledSize: typeof window !== 'undefined' && window.google?.maps ? new window.google.maps.Size(28, 28) : undefined
  };

  return (
    <div className="relative">
      {/* Background glow effect */}
      <div className="absolute -top-4 -left-4 w-16rem h-16rem bg-cyan-500 opacity-10 blur-2xl rounded-full pointer-events-none" />
      
      {/* Main card container with glassmorphism styling */}
      <Card className="border-round-2xl overflow-hidden shadow-5" style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 20, 0.98) 100%)',
        border: '1px solid rgba(0, 212, 255, 0.3)'
      }}>
        {/* Header section with title and stats */}
        <div className="p-4 border-bottom-1" style={{
          background: 'linear-gradient(90deg, rgba(0, 212, 255, 0.15), transparent)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)'
        }}>
          <div className="flex align-items-center justify-content-between">
            <h2 className="m-0 font-bold text-3xl text-transparent" style={{
              background: 'linear-gradient(90deg, #00d4ff, #ff006e)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text'
            }}>NEURAL TRACKING GRID</h2>
            
            {/* Quick stats indicators */}
            <div className="flex gap-3">
              <div className="px-3 py-2 border-round-xl" style={{
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.5)'
              }}>
                <span className="text-cyan-400 font-bold">{drivers.length}</span>
                <span className="text-gray-400 ml-2">AGENTS</span>
              </div>
              <div className="px-3 py-2 border-round-xl" style={{
                background: 'rgba(255, 0, 110, 0.1)',
                border: '1px solid rgba(255, 0, 110, 0.5)'
              }}>
                <span className="text-pink-500 font-bold">{pendingOrders.length}</span>
                <span className="text-gray-400 ml-2">ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Map display area - shows Google Map or SVG fallback */}
        <div className="h-30rem">
          {isLoaded ? (
            // Google Maps loaded successfully - render interactive map
            <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={12} options={mapOptions}>
              {/* Driver markers with click handlers */}
              {drivers.map(driver => (
                <Marker key={driver.id} position={{ lat: driver.latitude || defaultCenter.lat, lng: driver.longitude || defaultCenter.lng }} icon={driverIcon} onClick={() => setActiveInfo({ type: 'driver', data: driver })} />
              ))}
              {/* Order markers for pending/assigned orders */}
              {pendingOrders.map(order => (
                <Marker key={order.id} position={{ lat: order.pickup_lat || defaultCenter.lat, lng: order.pickup_lng || defaultCenter.lng }} icon={orderIcon} onClick={() => setActiveInfo({ type: 'order', data: order })} />
              ))}
              {/* Info window appears when marker is clicked */}
              {activeInfo && (
                <InfoWindow position={{
                  lat: activeInfo.data.latitude || activeInfo.data.pickup_lat || defaultCenter.lat,
                  lng: activeInfo.data.longitude || activeInfo.data.pickup_lng || defaultCenter.lng
                }} onCloseClick={() => setActiveInfo(null)}>
                  {/* Dynamic content based on marker type */}
                  <div className="p-3" style={{ background: 'rgba(2, 6, 20, 0.98)', border: '1px solid rgba(0, 212, 255, 0.5)', borderRadius: '8px' }}>
                    <h4 className="m-0 mb-2" style={{ color: '#00d4ff' }}>
                      {activeInfo.type === 'driver' ? activeInfo.data.name : `ORDER #${activeInfo.data.id?.slice(0, 8)}`}
                    </h4>
                    <div style={{ color: '#94a3b8' }}>
                      {activeInfo.type === 'driver' ? (
                        <>Vehicle: {activeInfo.data.vehicle_type || 'Motorcycle'}<br/>Rating: {activeInfo.data.rating || '4.9'}★</>
                      ) : (
                        <>From: {activeInfo.data.pickup_address}<br/>To: {activeInfo.data.delivery_address}</>
                      )}
                    </div>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          ) : (
            // Google Maps not loaded - show static SVG fallback
            <DemoMap drivers={drivers} orders={orders} />
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminMap;