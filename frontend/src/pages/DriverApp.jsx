import React, { useState, useEffect } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Badge } from 'primereact/badge';
import { Chip } from 'primereact/chip';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressBar } from 'primereact/progressbar';
import { motion, AnimatePresence } from 'framer-motion';
import LiveMap from '../components/Map/LiveMap';
import useOrderStore from '../store/orderStore';
import useAuthStore from '../store/authStore';
import { io } from 'socket.io-client';

const DeliveryTabs = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { myOrders, orders, loading, getOrders, updateOrderStatus } = useOrderStore();
  const { user, accessToken } = useAuthStore();

  // Setup socket for real-time updates
  useEffect(() => {
    if (!accessToken) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token: accessToken }
    });

    socket.on('order:status_update', (data) => {
      updateOrderStatus(data.orderId, data.status);
    });

    return () => socket.disconnect();
  }, [accessToken, updateOrderStatus]);

  const statusBodyTemplate = (rowData) => {
    const severityMap = {
      pending: 'warning',
      assigned: 'info',
      accepted: 'info',
      picked_up: 'primary',
      in_transit: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return (
      <Badge 
        value={rowData.status?.replace('_', ' ').toUpperCase()} 
        severity={severityMap[rowData.status]} 
        className="text-xs font-bold"
      />
    );
  };

  const actionBodyTemplate = (rowData) => {
    const handleAccept = async () => {
      // Would call API to accept order
    };

    const handleReject = async () => {
      // Would call API to reject order
    };

    const handlePickup = async () => {
      // Would call API for pickup
    };

    const handleDeliver = async () => {
      // Would call API for delivery
    };

    return (
      <div className="flex gap-2">
        <Button 
          icon="pi pi-map" 
          className="p-button-rounded p-button-success p-button-sm" 
          tooltip="Navigate" 
          onClick={() => window.open(`https://maps.google.com?saddr=&daddr=${rowData.delivery_lat},${rowData.delivery_lng}`, '_blank')}
        />
        {rowData.status === 'assigned' && (
          <>
            <Button 
              icon="pi pi-check" 
              className="p-button-rounded p-button-sm" 
              tooltip="Accept" 
              onClick={handleAccept}
            />
            <Button 
              icon="pi pi-times" 
              className="p-button-rounded p-button-danger p-button-sm" 
              tooltip="Reject" 
              onClick={handleReject}
            />
          </>
        )}
        {rowData.status === 'accepted' && (
          <Button 
            icon="pi pi-box" 
            className="p-button-rounded p-button-warning p-button-sm" 
            tooltip="Mark Picked Up" 
            onClick={handlePickup}
          />
        )}
        {(rowData.status === 'picked_up' || rowData.status === 'in_transit') && (
          <Button 
            icon="pi pi-check-circle" 
            className="p-button-rounded p-button-success p-button-sm" 
            tooltip="Mark Delivered" 
            onClick={handleDeliver}
          />
        )}
      </div>
    );
  };

  const distanceBodyTemplate = (rowData) => {
    return rowData.estimated_distance ? `${parseFloat(rowData.estimated_distance).toFixed(1)} km` : '—';
  };

  const customerBodyTemplate = (rowData) => {
    return (
      <div>
        <div className="font-medium text-white">{rowData.customer_name?.split(' ')[0] || '—'}</div>
        <div className="text-gray-400 text-sm">{rowData.customer_phone || '—'}</div>
      </div>
    );
  };

  const earningsTotal = orders.filter(o => o.status === 'delivered').length * 15; // Mock earnings
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const activeCount = orders.filter(o => ['assigned', 'accepted', 'picked_up', 'in_transit'].includes(o.status)).length;

  return (
    <div className="py-4 px-3" style={{ minHeight: 'calc(100vh - 80px)', background: 'rgba(15,23,42,0.3)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-1200 mx-auto"
      >
        <div className="surface-card border-round-xl p-4 shadow-2 mb-4" style={{ background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="flex flex-column md:flex-row align-items-center justify-content-between">
            <div>
              <h1 className="text-3xl font-bold mb-1 text-white m-0">Driver Dashboard</h1>
              <p className="text-gray-300 m-0">Welcome back, {user?.name?.split(' ')[0] || 'Driver'}!</p>
            </div>
            <div className="flex gap-3 mt-3 md:mt-0">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Chip 
                  label={`${deliveredCount} Delivered`} 
                  icon="pi pi-check-circle" 
                  className="bg-green-500 text-white font-bold"
                />
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }}>
                <Chip 
                  label={`${activeCount} Active`} 
                  icon="pi pi-clock" 
                  className="bg-blue-500 text-white font-bold"
                />
              </motion.div>
            </div>
          </div>
        </div>

        <TabView 
          activeIndex={activeIndex} 
          onTabChange={(e) => setActiveIndex(e.index)} 
          className="border-round-xl overflow-hidden shadow-2"
          panelContainerStyle={{ background: 'rgba(255,255,255,0.02)' }}
        >
          <TabPanel header="My Deliveries" leftIcon="pi pi-box">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Card className="border-round-xl shadow-2" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <DataTable 
                  value={orders || []} 
                  loading={loading}
                  paginator 
                  rows={10}
                  emptyMessage={
                    <div className="p-5 text-center">
                      <i className="pi pi-inbox text-4xl text-500 mb-3 block"></i>
                      <p className="text-gray-400 m-0">No deliveries assigned yet. Go online to receive orders!</p>
                    </div>
                  }
                  className="p-datatable-sm"
                  stripedRows
                  responsiveLayout="scroll"
                >
                  <Column field="id" header="Order ID" body={(row) => `#${row.id?.slice(0, 8)}`} />
                  <Column header="Customer" body={customerBodyTemplate} />
                  <Column field="pickup_address" header="Pickup" body={(row) => row.pickup_address?.substring(0, 25) + '...'} />
                  <Column field="delivery_address" header="Delivery" body={(row) => row.delivery_address?.substring(0, 25) + '...'} />
                  <Column field="status" header="Status" body={statusBodyTemplate} />
                  <Column header="Distance" body={distanceBodyTemplate} />
                  <Column header="Actions" body={actionBodyTemplate} />
                </DataTable>
              </Card>
            </motion.div>
          </TabPanel>

          <TabPanel header="Live Map" leftIcon="pi pi-map">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Card className="border-round-xl shadow-2" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <div className="h-30rem w-full">
                  <LiveMap 
                    pickupLocation={{ lat: 40.7128, lng: -74.0060 }}
                    deliveryLocation={{ lat: 40.7306, lng: -73.9352 }}
                    driverLocation={{ lat: 40.7217, lng: -73.95 }}
                  />
                </div>
                
                <div className="flex flex-column md:flex-row gap-3 mt-3">
                  <div className="flex-1 p-3 bg-gray-900 border-round">
                    <span className="text-gray-400 block text-sm mb-1">Current Speed</span>
                    <span className="text-white text-xl font-bold">45 km/h</span>
                  </div>
                  <div className="flex-1 p-3 bg-gray-900 border-round">
                    <span className="text-gray-400 block text-sm mb-1">Heading</span>
                    <span className="text-white text-xl font-bold">NE</span>
                  </div>
                  <div className="flex-1 p-3 bg-gray-900 border-round">
                    <span className="text-gray-400 block text-sm mb-1">Battery</span>
                    <ProgressBar value={85} color="#10b981" />
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabPanel>

          <TabPanel header="Earnings" leftIcon="pi pi-dollar">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="grid">
                <div className="col-12 md:col-4">
                  <motion.div whileHover={{ y: -5 }}>
                    <Card className="border-round-xl shadow-2 text-center glass-card">
                      <i className="pi pi-wallet text-4xl text-green-400 mb-3 block"></i>
                      <h3 className="text-2xl font-bold text-white mb-1">${earningsTotal.toFixed(2)}</h3>
                      <p className="text-gray-300 m-0">Total Earnings</p>
                    </Card>
                  </motion.div>
                </div>
                <div className="col-12 md:col-4">
                  <motion.div whileHover={{ y: -5 }}>
                    <Card className="border-round-xl shadow-2 text-center glass-card">
                      <i className="pi pi-chart-line text-4xl text-blue-400 mb-3 block"></i>
                      <h3 className="text-2xl font-bold text-white mb-1">$124.50</h3>
                      <p className="text-gray-300 m-0">This Week</p>
                    </Card>
                  </motion.div>
                </div>
                <div className="col-12 md:col-4">
                  <motion.div whileHover={{ y: -5 }}>
                    <Card className="border-round-xl shadow-2 text-center glass-card">
                      <i className="pi pi-star text-4xl text-yellow-400 mb-3 block"></i>
                      <h3 className="text-2xl font-bold text-white mb-1">4.9</h3>
                      <p className="text-gray-300 m-0">Rating</p>
                    </Card>
                  </motion.div>
                </div>
              </div>

              <Card className="border-round-xl shadow-2 mt-4 glass-card">
                <h3 className="text-white mb-3">Recent Payments</h3>
                <div className="p-fluid">
                  <div className="flex justify-content-between align-items-center py-3 border-bottom-1" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div>
                      <div className="font-medium text-white">Order #A3F7B2</div>
                      <div className="text-gray-400 text-sm">Delivered yesterday</div>
                    </div>
                    <div className="text-green-400 font-bold">+$18.50</div>
                  </div>
                  <div className="flex justify-content-between align-items-center py-3 border-bottom-1" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <div>
                      <div className="font-medium text-white">Order #B9CD12</div>
                      <div className="text-gray-400 text-sm">Delivered 2 days ago</div>
                    </div>
                    <div className="text-green-400 font-bold">+$22.00</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabPanel>

          <TabPanel header="Profile" leftIcon="pi pi-user">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Card className="border-round-xl shadow-2" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <div className="flex flex-column md:flex-row gap-4">
                  <div className="flex-1">
                    <h3 className="text-white mb-3">Personal Info</h3>
                    <div className="field mb-3">
                      <label className="text-gray-300 block mb-1 font-medium">Full Name</label>
                      <InputText value={user?.name || ''} className="w-full bg-gray-900 border-gray-700 text-white" readOnly />
                    </div>
                    <div className="field mb-3">
                      <label className="text-gray-300 block mb-1 font-medium">Email</label>
                      <InputText value={user?.email || ''} className="w-full bg-gray-900 border-gray-700 text-white" readOnly />
                    </div>
                    <div className="field mb-3">
                      <label className="text-gray-300 block mb-1 font-medium">Phone</label>
                      <InputText value={user?.phone || ''} className="w-full bg-gray-900 border-gray-700 text-white" readOnly />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white mb-3">Vehicle Info</h3>
                    <div className="field mb-3">
                      <label className="text-gray-300 block mb-1 font-medium">Vehicle Type</label>
                      <InputText value="Motorcycle" className="w-full bg-gray-900 border-gray-700 text-white" readOnly />
                    </div>
                    <div className="field mb-3">
                      <label className="text-gray-300 block mb-1 font-medium">License Plate</label>
                      <InputText value="ABC-1234" className="w-full bg-gray-900 border-gray-700 text-white" readOnly />
                    </div>
                    <div className="field mb-3">
                      <label className="text-gray-300 block mb-1 font-medium">Zone</label>
                      <InputText value="Downtown" className="w-full bg-gray-900 border-gray-700 text-white" readOnly />
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }}>
                      <Button label="Edit Profile" icon="pi pi-pencil" className="mt-2" />
                    </motion.div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </TabPanel>
        </TabView>
      </motion.div>
    </div>
  );
};

export default DeliveryTabs;