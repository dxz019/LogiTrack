import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { Divider } from 'primereact/divider';
import { motion, AnimatePresence } from 'framer-motion';
import LiveMap from '../components/Map/LiveMap';
import StatusTimeline from '../components/Order/StatusTimeline';
import useOrderStore from '../store/orderStore';
import useAuthStore from '../store/authStore';
import { io } from 'socket.io-client';

const TrackOrder = () => {
  const { orderId } = useParams();
  const { getOrderById, currentOrder, loading, error, updateOrderStatus } = useOrderStore();
  const { accessToken, isAuthenticated } = useAuthStore();
  
  const [liveLocation, setLiveLocation] = useState(null);
  const [liveEta, setLiveEta] = useState(null);
  const [socket, setSocket] = useState(null);

  // Fetch initial order details
  useEffect(() => {
    if (orderId) {
      getOrderById(orderId);
    }
  }, [orderId, getOrderById]);

  // Setup WebSocket for live updates
  useEffect(() => {
    if (!orderId || !accessToken) return;

    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token: accessToken }
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Connected to tracking socket');
      socketInstance.emit('customer:track_order', { orderId });
    });

    socketInstance.on('order:status_update', (data) => {
      if (data.orderId === orderId) {
        updateOrderStatus(orderId, data.status);
      }
    });

    socketInstance.on('order:location_update', (data) => {
      if (data.orderId === orderId) {
        setLiveLocation({ lat: data.lat, lng: data.lng });
        if (data.eta) setLiveEta(new Date(data.eta));
      }
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [orderId, accessToken, updateOrderStatus]);

  // Format address display
  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return address.length > 50 ? address.substring(0, 50) + '...' : address;
  };

  // Get status severity
  const getStatusSeverity = (status) => {
    const map = {
      pending: 'warning',
      assigned: 'info',
      accepted: 'info',
      picked_up: 'primary',
      in_transit: 'primary',
      delivered: 'success',
      cancelled: 'danger',
    };
    return map[status] || 'info';
  };

  if (!isAuthenticated) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen">
        <div className="text-center">
          <i className="pi pi-lock text-6xl text-primary mb-4"></i>
          <h2 className="text-white mb-3">Please Login to Track Orders</h2>
          <Button label="Go to Login" className="p-button-rounded" onClick={() => window.location.href = '/login'} />
        </div>
      </div>
    );
  }

  if (loading && !currentOrder) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a, #1e3a8a)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <i className="pi pi-spinner text-4xl text-white"></i>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 m-4 border-round-lg">
        <i className="pi pi-exclamation-triangle mr-2"></i>
        Error loading order: {error}
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="p-4 m-4 text-center">
        <i className="pi pi-box text-4xl text-500 mb-3"></i>
        <p className="text-gray-300">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ minHeight: '100vh' }}>
      <AnimatePresence>
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex align-items-center mb-4">
              <i className="pi pi-box text-3xl text-primary mr-3"></i>
              <h1 className="m-0 text-3xl font-bold text-white">
                Track Order <span className="text-blue-400">#{currentOrder.id?.slice(0, 8)}</span>
              </h1>
            </div>

            <div className="grid">
              {/* Map Section */}
              <div className="col-12 md:col-8">
                <Card className="h-full shadow-2 border-round-xl overflow-hidden glass-card">
                  <div className="h-30rem w-full relative">
                    <LiveMap 
                      pickupLocation={currentOrder.pickup_lat ? { lat: parseFloat(currentOrder.pickup_lat), lng: parseFloat(currentOrder.pickup_lng) } : null}
                      deliveryLocation={currentOrder.delivery_lat ? { lat: parseFloat(currentOrder.delivery_lat), lng: parseFloat(currentOrder.delivery_lng) } : null}
                      driverLocation={liveLocation}
                      routePolyline={[]} 
                    />
                    
                    <AnimatePresence>
                      {liveEta && (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute top-0 left-0 m-3 p-3 glass-panel border-round shadow-2 z-5 text-white"
                        >
                          <h4 className="m-0 text-primary font-bold">Live ETA</h4>
                          <p className="m-0 text-xl font-bold text-green-400">
                            {liveEta.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="absolute bottom-0 right-0 m-3 z-5 flex gap-2">
                      <Tag 
                        value={currentOrder.priority?.toUpperCase()} 
                        severity={currentOrder.priority === 'urgent' ? 'danger' : currentOrder.priority === 'express' ? 'warning' : 'info'} 
                        className="font-bold"
                      />
                      <Tag 
                        value={currentOrder.status?.replace('_', ' ').toUpperCase()} 
                        severity={getStatusSeverity(currentOrder.status)} 
                        className="font-bold"
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Details Section */}
              <div className="col-12 md:col-4">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="shadow-2 border-round-xl mb-4 glass-card">
                    <h2 className="mt-0 mb-4 text-xl text-white flex align-items-center">
                      <i className="pi pi-clock text-primary mr-2"></i>
                      Delivery Status
                    </h2>
                    <StatusTimeline currentStatus={currentOrder.status} />
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="shadow-2 border-round-xl mb-4 glass-card">
                    <h2 className="mt-0 mb-3 text-xl text-white">
                      <i className="pi pi-info-circle text-primary mr-2"></i>
                      Order Details
                    </h2>
                    
                    <div className="mb-3">
                      <span className="text-gray-400 block text-sm mb-1 font-medium">Pickup Location</span>
                      <div className="font-medium text-white">{formatAddress(currentOrder.pickup_address)}</div>
                    </div>
                    
                    <Divider className="my-3" />
                    
                    <div className="mb-3">
                      <span className="text-gray-400 block text-sm mb-1 font-medium">Delivery Location</span>
                      <div className="font-medium text-white">{formatAddress(currentOrder.delivery_address)}</div>
                    </div>
                    
                    <Divider className="my-3" />
                    
                    {currentOrder.package_description && (
                      <>
                        <div className="mb-3">
                          <span className="text-gray-400 block text-sm mb-1 font-medium">Package</span>
                          <div className="font-medium text-white">{currentOrder.package_description}</div>
                        </div>
                        <Divider className="my-3" />
                      </>
                    )}

                    <div className="mb-3">
                      <span className="text-gray-400 block text-sm mb-1 font-medium">Distance</span>
                      <div className="font-bold text-blue-400">{currentOrder.estimated_distance ? `${currentOrder.estimated_distance.toFixed(1)} km` : 'Calculating...'}</div>
                    </div>

                    <Divider className="my-3" />

                    <div className="mb-3">
                      <span className="text-gray-400 block text-sm mb-1 font-medium">Estimated Time</span>
                      <div className="font-bold text-green-400">{currentOrder.estimated_duration ? `${Math.round(currentOrder.estimated_duration)} min` : 'Calculating...'}</div>
                    </div>

                    {currentOrder.price && (
                      <>
                        <Divider className="my-3" />
                        <div>
                          <span className="text-gray-400 block text-sm mb-1 font-medium">Price</span>
                          <div className="font-bold text-2xl text-yellow-400">${parseFloat(currentOrder.price).toFixed(2)}</div>
                        </div>
                      </>
                    )}
                  </Card>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrackOrder;