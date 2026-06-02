import React, { memo } from 'react';
import { Marker } from '@react-google-maps/api';

export const DriverMarker = memo(({ position, driver, onClick }) => {
  const icon = {
    url: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Ccircle cx="12" cy="12" r="12" fill="%233b82f6"/%3E%3Ctext x="12" y="16" font-size="12" text-anchor="middle" fill="white"%3E%E2%9A%9C%3C/text%3E%3C/svg%3E',
    scaledSize: new window.google.maps.Size(40, 40),
    anchor: new window.google.maps.Point(20, 20)
  };

  return (
    <Marker
      position={position}
      icon={icon}
      onClick={onClick}
      animation={window.google.maps.Animation.BOUNCE}
    />
  );
});

export default DriverMarker;