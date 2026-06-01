import React, { useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { motion } from 'framer-motion';
import LiveMap from '../components/Map/LiveMap';
import useOrderStore from '../store/orderStore';
import useAuthStore from '../store/authStore';

const DriverTabs = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { myOrders, loading } = useOrderStore();
  const { user } = useAuthStore();

  const statusBodyTemplate = (rowData) => {
    const severity = {
      pending: 'warning',
      assigned: 'info',
      picked_up: 'primary',
      in_transit: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return (
      <span className={`text-${severity[rowData.status]}-500 font-medium`}>
        {rowData.status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-map" className="p-button-rounded p-button-success p-button-sm" tooltip="Navigate" />
        <Button icon="pi pi-check" className="p-button-rounded p-button-sm" disabled={rowData.status === 'delivered'} />
      </div>
    );
  };

  return (
    <div className="py-4 px-3" style={{ minHeight: 'calc(100vh - 80px)', background: 'rgba(15,23,42,0.3)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-1200 mx-auto"
      >
        <div className="surface-card border-round-xl p-4 shadow-2 mb-4" style={{ background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="flex align-items-center justify-content-between">
            <div>
              <h1 className="text-3xl font-bold mb-1 text-white">Driver Dashboard</h1>
              <p className="text-gray-300 m-0">Welcome back, {user?.name || 'Driver'}!</p>
            </div>
            <div className="flex gap-2">
              <Button icon="pi pi-bell" className="p-button-rounded p-button-text" badge="3" />
              <Button icon="pi pi-refresh" className="p-button-rounded p-button-text" loading={loading} />
            </div>
          </div>
        </div>

        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} className="border-round-xl overflow-hidden">
          <TabPanel header="My Deliveries" leftIcon="pi pi-box">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Card className="border-round-xl shadow-2" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <DataTable 
                  value={myOrders || []} 
                  loading={loading}
                  paginator 
                  rows={10}
                  emptyMessage="No deliveries assigned yet"
                  className="p-datatable-sm"
                >
                  <Column field="id" header="Order ID" body={(row) => `#${row.id?.slice(0, 8)}`} />
                  <Column field="pickup_address" header="Pickup" />
                  <Column field="delivery_address" header="Delivery" />
                  <Column field="status" header="Status" body={statusBodyTemplate} />
                  <Column field="priority" header="Priority" />
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
              </Card>
            </motion.div>
          </TabPanel>

          <TabPanel header="Earnings" leftIcon="pi pi-dollar">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="grid">
                <div className="col-12 md:col-4">
                  <Card className="border-round-xl shadow-2 text-center" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                    <i className="pi pi-dollar text-4xl text-green-400 mb-3"></i>
                    <h3 className="text-2xl font-bold text-white mb-1">$1,248</h3>
                    <p className="text-gray-300 m-0">This Month</p>
                  </Card>
                </div>
                <div className="col-12 md:col-4">
                  <Card className="border-round-xl shadow-2 text-center" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                    <i className="pi pi-chart-line text-4xl text-blue-400 mb-3"></i>
                    <h3 className="text-2xl font-bold text-white mb-1">$124</h3>
                    <p className="text-gray-300 m-0">Today</p>
                  </Card>
                </div>
                <div className="col-12 md:col-4">
                  <Card className="border-round-xl shadow-2 text-center" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                    <i className="pi pi-star text-4xl text-yellow-400 mb-3"></i>
                    <h3 className="text-2xl font-bold text-white mb-1">4.9</h3>
                    <p className="text-gray-300 m-0">Rating</p>
                  </Card>
                </div>
              </div>
            </motion.div>
          </TabPanel>

          <TabPanel header="Profile" leftIcon="pi pi-user">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Card className="border-round-xl shadow-2" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <div className="flex flex-column md:flex-row gap-4">
                  <div className="flex-1">
                    <h3 className="text-white mb-3">Personal Info</h3>
                    <div className="field mb-3">
                      <label className="text-gray-300 block mb-1">Full Name</label>
                      <InputText value={user?.name || ''} className="w-full" readOnly />
                    </div>
                    <div className="field mb-3">
                      <label className="text-gray-300 block mb-1">Email</label>
                      <InputText value={user?.email || ''} className="w-full" readOnly />
                    </div>
                    <div className="field mb-3">
                      <label className="text-gray-300 block mb-1">Phone</label>
                      <InputText value={user?.phone || ''} className="w-full" readOnly />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white mb-3">Vehicle Info</h3>
                    <div className="field mb-3">
                      <label className="text-gray-300 block mb-1">Vehicle Type</label>
                      <InputText value="Motorcycle" className="w-full" readOnly />
                    </div>
                    <div className="field mb-3">
                      <label className="text-gray-300 block mb-1">License Plate</label>
                      <InputText value="ABC-1234" className="w-full" readOnly />
                    </div>
                    <Button label="Edit Profile" icon="pi pi-pencil" className="mt-2" />
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

export default DriverTabs;