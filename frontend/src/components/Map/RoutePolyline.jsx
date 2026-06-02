import React, { memo } from 'react';
import { Polyline } from '@react-google-maps/api';

export const RoutePolyline = memo(({ path, strokeColor = '#3b82f6' }) => {
  const options = {
    strokeColor,
    strokeOpacity: 0.8,
    strokeWeight: 6,
    geodesic: true,
    icons: [{
      icon: {
        path: 'M 0,0 0,10',
        strokeOpacity: 0.8,
        strokeColor,
        scale: 2
      },
      offset: '0',
      repeat: '20px'
    }]
  };

  return path && path.length > 0 ? (
    <Polyline path={path} options={options} />
  ) : null;
});

export default RoutePolyline;