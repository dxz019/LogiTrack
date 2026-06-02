import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ToggleButton } from 'primereact/togglebutton';
import { Chip } from 'primereact/chip';
import { useSocket } from '../../hooks/useSocket';
import { motion } from 'framer-motion';

export const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 });
  const { emit } = useSocket();

  useEffect(() => {
    // Update status via socket
    if (isOnline || isAvailable) {
      emit('driver:status_update', { isOnline, isAvailable });
    }
  }, [isOnline, isAvailable, emit]);

  return (
    <div className="p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid mb-4"
      >
        <div className="col-12 md:col-4">
          <Card className="border-round-xl" style={{ background: 'rgba(30,41,59,0.8)' }}>
            <div className="flex align-items-center justify-content-between">
              <span className="text-gray-300">Online Status</span>
              <ToggleButton
                checked={isOnline}
                onChange={(e) => setIsOnline(e.value)}
                onLabel="Online"
                offLabel="Offline"
                className="w-6rem"
              />
            </div>
          </Card>
        </div>
        
        <div className="col-12 md:col-4">
          <Card className="border-round-xl" style={{ background: 'rgba(30,41,59,0.8)' }}>
            <div className="flex align-items-center justify-content-between">
              <span className="text-gray-300">Available for Orders</span>
              <ToggleButton
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.value)}
                onLabel="Available"
                offLabel="Busy"
                disabled={!isOnline}
                className="w-6rem"
              />
            </div>
          </Card>
        </div>

        <div className="col-12 md:col-4">
          <Card className="border-round-xl" style={{ background: 'rgba(30,41,59,0.8)' }}>
            <div>
              <p className="text-gray-400 m-0">Today&apos;s Earnings</p>
              <p className="text-2xl font-bold text-green-400 m-0">${earnings.today.toFixed(2)}</p>
            </div>
          </Card>
        </div>
      </motion.div>

      {activeOrder ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-round-xl" style={{ background: 'rgba(30,41,59,0.8)' }}>
            <h3 className="text-white m-0 mb-3">Active Delivery</h3>
            <div className="flex flex-column gap-3">
              <Chip label={`Order #${activeOrder.id?.slice(0, 8)}`} className="bg-blue-900 text-blue-300" />
              <p className="text-gray-300 m-0">Pickup: {activeOrder.pickup_address}</p>
              <p className="text-gray-300 m-0">Delivery: {activeOrder.delivery_address}</p>
              <div className="flex gap-2">
                <Button label="Mark Picked Up" icon="pi pi-box" className="p-button-success" />
                <Button label="Mark Delivered" icon="pi pi-check" className="p-button-info" />
                <Button label="Navigate" icon="pi pi-map" className="p-button-outlined" />
              </div>
            </div>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-5"
        >
          <i className="pi pi-truck text-6xl text-blue-400 mb-3"></i>
          <p className="text-gray-400">No active deliveries. Go online to receive orders!</p>
        </motion.div>
      )}
    </div>
  );
};

export default DriverDashboard;
