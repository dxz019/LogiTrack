// Track Order page - Real-time delivery tracking interface
// Connects to WebSocket for live driver location and ETA updates

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

  // Fetch order details on mount
  useEffect(() => {
    if (orderId) {
      getOrderById(orderId);
    }
  }, [orderId, getOrderById]);

  // Setup WebSocket connection for real-time updates
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

    // Listen for status updates
    socketInstance.on('order:status_update', (data) => {
      if (data.orderId === orderId) {
        updateOrderStatus(orderId, data.status);
      }
    });

    // Listen for live location updates
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

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return address.length > 50 ? address.substring(0, 50) + '...' : address;
  };

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

  // Login prompt for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <Card className="text-center p-5 border-round-xl shadow-3" style={{ background: 'rgba(255,255,255,0.9)' }}>
          <i className="pi pi-lock text-5xl text-blue-600 mb-4"></i>
          <h2 className="text-gray-800 mb-3">Please Login to Track Orders</h2>
          <Button label="Go to Login" className="p-button-rounded bg-blue-600 border-blue-600" onClick={() => window.location.href = '/login'} />
        </Card>
      </div>
    );
  }

  // Loading state
  if (loading && !currentOrder) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen p-4" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
          <i className="pi pi-spinner text-4xl text-blue-600"></i>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 m-4 text-center">
        <i className="pi pi-exclamation-triangle text-red-500 text-3xl mb-3"></i>
        <p className="text-red-600">Error loading order: {error}</p>
      </div>
    );
  }

  // Order not found
  if (!currentOrder) {
    return (
      <div className="p-4 m-4 text-center">
        <i className="pi pi-box text-4xl text-gray-400 mb-3"></i>
        <p className="text-gray-600">Order not found.</p>
      </div>
    );
  }

  return (
    <div className="page-container p-4" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <AnimatePresence>
        {!loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex align-items-center mb-4">
              <i className="pi pi-box text-3xl text-blue-600 mr-3"></i>
              <h1 className="m-0 text-3xl font-bold text-gray-800">
                Track Order <span className="text-blue-600">#{currentOrder.id?.slice(0, 8)}</span>
              </h1>
            </div>

            <div className="grid">
              {/* Live Map */}
              <div className="col-12 md:col-8">
                <Card className="h-full shadow-3 border-round-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
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
                          className="absolute top-0 left-0 m-3 p-3 bg-white bg-opacity-90 border-round shadow-2 z-5"
                        >
                          <h4 className="m-0 text-blue-600 font-bold">Live ETA</h4>
                          <p className="m-0 text-xl font-bold text-green-600">
                            {liveEta.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="absolute bottom-0 right-0 m-3 z-5 flex gap-2">
                      <Tag 
                        value={currentOrder.priority?.toUpperCase()} 
                        severity={currentOrder.priority === 'urgent' ? 'danger' : currentOrder.priority === 'express' ? 'warning' : 'info'} 
                      />
                      <Tag 
                        value={currentOrder.status?.replace('_', ' ').toUpperCase()} 
                        severity={getStatusSeverity(currentOrder.status)} 
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Order Details */}
              <div className="col-12 md:col-4">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                  <Card className="shadow-3 border-round-xl mb-4" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
                    <h2 className="mt-0 mb-4 text-xl text-gray-800 flex align-items-center">
                      <i className="pi pi-clock text-blue-600 mr-2"></i>
                      Delivery Status
                    </h2>
                    <StatusTimeline order={currentOrder} />
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                  <Card className="shadow-3 border-round-xl mb-4" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)' }}>
                    <h2 className="mt-0 mb-3 text-xl text-gray-800">
                      <i className="pi pi-info-circle text-blue-600 mr-2"></i>
                      Order Details
                    </h2>
                    
                    <div className="mb-3">
                      <span className="text-gray-600 block text-sm mb-1 font-medium">Pickup Location</span>
                      <div className="font-medium text-gray-800">{formatAddress(currentOrder.pickup_address)}</div>
                    </div>
                    
                    <Divider className="my-3" />
                    
                    <div className="mb-3">
                      <span className="text-gray-600 block text-sm mb-1 font-medium">Delivery Location</span>
                      <div className="font-medium text-gray-800">{formatAddress(currentOrder.delivery_address)}</div>
                    </div>
                    
                    <Divider className="my-3" />
                    
                    {currentOrder.estimated_distance && (
                      <>
                        <div className="mb-3">
                          <span className="text-gray-600 block text-sm mb-1 font-medium">Distance</span>
                          <div className="font-bold text-blue-600">{currentOrder.estimated_distance.toFixed(1)} km</div>
                        </div>
                        <Divider className="my-3" />
                      </>
                    )}

                    {currentOrder.price && (
                      <>
                        <div>
                          <span className="text-gray-600 block text-sm mb-1 font-medium">Price</span>
                          <div className="font-bold text-2xl text-green-600">${parseFloat(currentOrder.price).toFixed(2)}</div>
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