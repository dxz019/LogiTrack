import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import { motion } from 'framer-motion';
import LiveMap from '../Map/LiveMap';

export const ActiveDelivery = ({ order }) => {
  const progressMap = {
    pending: 10,
    assigned: 25,
    accepted: 40,
    picked_up: 60,
    in_transit: 80,
    delivered: 100
  };

  const statusMessages = {
    pending: 'Waiting for driver assignment',
    assigned: 'Driver assigned and on the way',
    accepted: 'Driver is heading to pickup location',
    picked_up: 'Package picked up, heading to delivery',
    in_transit: 'Out for delivery',
    delivered: 'Delivered successfully!'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-round-xl shadow-3" style={{ background: 'rgba(30,41,59,0.8)' }}>
        <div className="grid md:h-25rem overflow-hidden">
          <div className="col-12 md:col-6 p-0">
            <div className="h-full w-full">
              <LiveMap
                pickupLocation={order?.pickup_lat ? { lat: order.pickup_lat, lng: order.pickup_lng } : null}
                deliveryLocation={order?.delivery_lat ? { lat: order.delivery_lat, lng: order.delivery_lng } : null}
                driverLocation={order?.driver_location ? { lat: order.driver_location.lat, lng: order.driver_location.lng } : null}
              />
            </div>
          </div>
          
          <div className="col-12 md:col-6 flex flex-column justify-content-between p-4">
            <div>
              <div className="flex align-items-center justify-content-between mb-3">
                <h2 className="m-0 text-white font-bold">#{order?.id?.slice(0, 8)}</h2>
                <Tag value={order?.status?.replace('_', ' ')} severity="info" />
              </div>

              <ProgressBar value={progressMap[order?.status] || 0} className="mb-4 h-1rem" />

              <div className="mb-4">
                <p className="text-gray-400 m-0 mb-2">Current Status</p>
                <p className="text-blue-300 m-0 font-medium">{statusMessages[order?.status]}</p>
              </div>

              <div className="grid mb-4">
                <div className="col-12 md:col-6">
                  <p className="text-gray-400 m-0 text-sm">ETA</p>
                  <p className="text-white font-bold">{order?.eta ? new Date(order.eta).toLocaleTimeString() : 'Calculating...'}</p>
                </div>
                <div className="col-12 md:col-6">
                  <p className="text-gray-400 m-0 text-sm">Distance</p>
                  <p className="text-white font-bold">{order?.estimated_distance || 0} km</p>
                </div>
              </div>

              {order?.driver && (
                <div className="border-round-lg p-3 mb-3" style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <p className="text-gray-400 m-0 mb-1 text-sm">Driver</p>
                  <p className="text-white m-0 font-bold">{order.driver.name}</p>
                  <p className="text-gray-300 m-0 text-sm">{order.driver.vehicle_type} • {order.driver.rating}★</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button label="Call Driver" icon="pi pi-phone" className="p-button-outlined flex-1" />
              <Button label="Message" icon="pi pi-envelope" className="p-button-outlined flex-1" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ActiveDelivery;