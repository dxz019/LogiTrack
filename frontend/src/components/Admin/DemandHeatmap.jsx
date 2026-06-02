import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, HeatmapLayer } from '@react-google-maps/api';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { motion } from 'framer-motion';

const containerStyle = { width: '100%', height: '400px' };

export const DemandHeatmap = () => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: ['visualization']
  });
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

  useEffect(() => {
    // Simulate heatmap data - in real app, fetch from /api/admin/heatmap
    const demoData = Array.from({ length: 50 }).map(() => ({
      lat: 40.7128 + (Math.random() - 0.5) * 0.1,
      lng: -74.006 + (Math.random() - 0.5) * 0.1
    }));
    setHeatmapData(demoData);
    setLoading(false);
  }, []);

  const defaultCenter = { lat: 40.7128, lng: -74.006 };

  const toggleHeatmap = () => {
    setShowHeatmap(!showHeatmap);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-round-xl overflow-hidden shadow-2">
        <div className="flex align-items-center justify-content-between p-3 border-bottom-1" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <h3 className="m-0 text-white font-bold">Demand Heatmap</h3>
          <Button 
            label={showHeatmap ? "Hide" : "Show"} 
            icon={showHeatmap ? "pi pi-eye-slash" : "pi pi-eye"} 
            className="p-button-sm p-button-outlined"
            onClick={toggleHeatmap}
          />
        </div>
        
        <div style={{ height: '400px' }}>
          {loading ? (
            <div className="flex align-items-center justify-content-center h-full">
              <Skeleton shape="rectangle" className="w-full h-full" />
            </div>
          ) : isLoaded ? (
            <GoogleMap mapContainerStyle={containerStyle} center={defaultCenter} zoom={13}>
              {showHeatmap && heatmapData.length > 0 && (
                <HeatmapLayer
                  data={heatmapData.map(p => new google.maps.LatLng(p.lat, p.lng))}
                  options={{
                    radius: 50,
                    opacity: 0.8
                  }}
                />
              )}
            </GoogleMap>
          ) : (
            <div className="flex align-items-center justify-content-center h-full bg-gray-900">
              <i className="pi pi-spinner pi-spin text-4xl text-blue-400"></i>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

export default DemandHeatmap;
