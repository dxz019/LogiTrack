import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useOrderStore from '../store/orderStore';
import LiveMap from '../components/Map/LiveMap';
import StatusTimeline from '../components/Order/StatusTimeline';
import { Card } from 'primereact/card';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

const TrackOrder = () => {
  const { orderId } = useParams();
  const { getOrderById, currentOrder, loading, error } = useOrderStore();
  const { accessToken } = useAuthStore();
  
  const [liveLocation, setLiveLocation] = useState(null);
  const [liveEta, setLiveEta] = useState(null);
  const [socketStatus, setSocketStatus] = useState(null);
  
  // Fetch initial order details
  useEffect(() => {
    if (orderId) {
      getOrderById(orderId);
    }
  }, [orderId, getOrderById]);

  // Setup WebSocket for live updates
  useEffect(() => {
    if (!orderId || !accessToken) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token: accessToken }
    });

    socket.on('connect', () => {
      console.log('Connected to tracking socket');
      socket.emit('customer:track_order', { orderId });
    });

    socket.on('order:status_update', (data) => {
      if (data.orderId === orderId) {
        setSocketStatus(data.status);
      }
    });

    socket.on('order:location_update', (data) => {
      if (data.orderId === orderId) {
        setLiveLocation({ lat: data.lat, lng: data.lng });
        if (data.eta) setLiveEta(new Date(data.eta));
      }
    });

    socket.on('order:driver_assigned', (data) => {
       // Ideally we refetch or update store, for now just force a refetch
       getOrderById(orderId);
    });

    return () => {
      socket.disconnect();
    };
  }, [orderId, accessToken, getOrderById]);

  if (loading && !currentOrder) return <div className="flex justify-content-center p-5"><i className="pi pi-spin pi-spinner" style={{ fontSize: '2rem' }}></i></div>;
  if (error) return <div className="p-4 bg-red-100 text-red-800 m-4 border-round">Error loading order: {error}</div>;
  if (!currentOrder) return <div className="p-4 m-4">Order not found.</div>;

  const displayStatus = socketStatus || currentOrder.status;

  return (
    <div className="page-container">
      <div className="flex align-items-center mb-4">
        <i className="pi pi-box text-3xl text-primary mr-3"></i>
        <h1 className="m-0 text-3xl font-bold">Track Order #{currentOrder.id.slice(0, 8)}</h1>
      </div>

      <div className="grid">
        <div className="col-12 md:col-8">
          <Card className="h-full shadow-2 border-round-xl overflow-hidden">
            <div className="h-30rem w-full relative">
               <LiveMap 
                  pickupLocation={currentOrder.pickup_lat ? { lat: currentOrder.pickup_lat, lng: currentOrder.pickup_lng } : null}
                  deliveryLocation={currentOrder.delivery_lat ? { lat: currentOrder.delivery_lat, lng: currentOrder.delivery_lng } : null}
                  driverLocation={liveLocation}
                  // We'd ideally decode currentOrder.polyline here if we saved it encoded
                  routePolyline={[]} 
               />
               
               {liveEta && (
                 <div className="absolute top-0 left-0 m-3 p-3 glass-panel border-round shadow-2 z-5">
                   <h4 className="m-0 text-primary">Live ETA</h4>
                   <p className="m-0 text-xl font-bold">{liveEta.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                 </div>
               )}
            </div>
          </Card>
        </div>
        
        <div className="col-12 md:col-4">
          <Card className="shadow-2 border-round-xl mb-4">
            <h2 className="mt-0 mb-4 text-xl">Delivery Status</h2>
            <StatusTimeline currentStatus={displayStatus} />
          </Card>
          
          <Card className="shadow-2 border-round-xl">
             <h2 className="mt-0 mb-3 text-xl">Details</h2>
             <div className="mb-3">
               <span className="text-500 block text-sm mb-1">Pickup</span>
               <div className="font-medium">{currentOrder.pickup_address}</div>
             </div>
             <div className="mb-3">
               <span className="text-500 block text-sm mb-1">Delivery</span>
               <div className="font-medium">{currentOrder.delivery_address}</div>
             </div>
             {currentOrder.package_description && (
               <div>
                 <span className="text-500 block text-sm mb-1">Package</span>
                 <div className="font-medium">{currentOrder.package_description}</div>
               </div>
             )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TrackOrder;
