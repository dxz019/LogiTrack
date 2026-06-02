import React, { useState, useEffect } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { motion, AnimatePresence } from 'framer-motion';
import useOrderStore from '../store/orderStore';
import useAuthStore from '../store/authStore';
import adminApi from '../services/adminApi';

const AdminPanel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showDriverDialog, setShowDriverDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverForm, setDriverForm] = useState({});
  const [drivers, setDrivers] = useState([]);
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'customer', orders: 12 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'driver', orders: 28 },
    { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'admin', orders: 0 }
  ]);
  const toast = React.useRef(null);
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

  const driverBodyTemplate = (rowData) => {
    return rowData.driver ? (
      <span className="text-green-400">{rowData.driver}</span>
    ) : (
      <span className="text-gray-400">Unassigned</span>
    );
  };

  const actionBodyTemplate = (rowData, rowIndex) => {
    return (
      <div className="flex gap-2">
        <Button icon="pi pi-pencil" className="p-button-rounded p-button-sm" onClick={() => openEditDriver(rowData)} />
        <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm" />
      </div>
    );
  };

  const orders = [
    { id: 'ORD001', pickup_address: '123 Main St', delivery_address: '456 Oak Ave', status: 'delivered', driver: 'Mike Driver', priority: 'normal' },
    { id: 'ORD002', pickup_address: '789 Park Rd', delivery_address: '321 Elm St', status: 'in_transit', driver: 'Sarah Rider', priority: 'express' },
    { id: 'ORD003', pickup_address: '555 Market St', delivery_address: '999 Broadway', status: 'pending', driver: null, priority: 'urgent' }
  ];

  const stats = [
    { icon: 'pi pi-box', label: 'Total Orders', value: '1,248', color: 'blue' },
    { icon: 'pi pi-users', label: 'Active Drivers', value: '24', color: 'green' },
    { icon: 'pi pi-user', label: 'Total Users', value: '542', color: 'purple' },
    { icon: 'pi pi-dollar', label: 'Revenue', value: '$24,890', color: 'yellow' }
  ];

  const vehicleTypes = [
    { label: 'Bike', value: 'bike' },
    { label: 'Car', value: 'car' },
    { label: 'Van', value: 'van' },
    { label: 'Truck', value: 'truck' }
  ];

  const fetchDrivers = async () => {
    try {
      const response = await adminApi.getDrivers();
      setDrivers(response.data.drivers || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const openEditDriver = async (driver) => {
    setSelectedDriver(driver);
    setDriverForm({
      name: driver.name || '',
      email: driver.email || '',
      phone: driver.phone || '',
      vehicle_type: driver.vehicle_type || '',
      vehicle_number: driver.vehicle_number || '',
      license_number: driver.license_number || '',
      vehicle_registration: driver.vehicle_registration || '',
      aadhar_card: driver.aadhar_card || '',
      address: driver.address || '',
      zone: driver.zone || ''
    });
    setShowDriverDialog(true);
  };

  const handleUpdateDriver = async () => {
    if (!selectedDriver?.id) return;
    try {
      await adminApi.updateDriverProfile(selectedDriver.id, driverForm);
      toast.current.show({ severity: 'success', summary: 'Updated', detail: 'Driver profile updated', life: 3000 });
      setShowDriverDialog(false);
      fetchDrivers();
    } catch (error) {
      toast.current.show({ severity: 'error', summary: 'Error', detail: 'Failed to update driver profile', life: 3000 });
    }
  };

  return (
    <div className="py-4 px-3" style={{ minHeight: 'calc(100vh - 80px)', background: 'rgba(15,23,42,0.3)' }}>
      <Toast ref={toast} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-1200 mx-auto"
      >
        <div className="surface-card border-round-xl p-4 shadow-2 mb-4" style={{ background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="flex align-items-center justify-content-between">
            <div>
              <h1 className="text-3xl font-bold mb-1 text-white">Admin Panel</h1>
              <p className="text-gray-300 m-0">Welcome back, {user?.name || 'Admin'}!</p>
            </div>
            <div className="flex gap-2">
              <Button icon="pi pi-bell" className="p-button-rounded p-button-text" badge="5" />
              <Button icon="pi pi-refresh" className="p-button-rounded p-button-text" onClick={fetchDrivers} />
            </div>
          </div>
        </div>

        <div className="grid mb-4">
          {stats.map((stat, i) => (
            <div key={stat.label} className="col-6 md:col-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="border-round-xl shadow-2 text-center" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                  <i className={`${stat.icon} text-3xl text-${stat.color}-400 mb-3`}></i>
                  <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-gray-300 m-0 text-sm">{stat.label}</p>
                </Card>
              </motion.div>
            </div>
          ))}
        </div>

        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)} className="border-round-xl overflow-hidden">
          <TabPanel header="Orders" leftIcon="pi pi-box">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Card className="border-round-xl shadow-2" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <DataTable value={orders} paginator rows={10} className="p-datatable-sm">
                  <Column field="id" header="Order ID" />
                  <Column field="pickup_address" header="Pickup" />
                  <Column field="delivery_address" header="Delivery" />
                  <Column field="status" header="Status" body={statusBodyTemplate} />
                  <Column header="Driver" body={driverBodyTemplate} />
                  <Column header="Actions" body={actionBodyTemplate} />
                </DataTable>
              </Card>
            </motion.div>
          </TabPanel>

          <TabPanel header="Drivers" leftIcon="pi pi-truck">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Card className="border-round-xl shadow-2" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <DataTable value={drivers} paginator rows={10} className="p-datatable-sm">
                  <Column field="id" header="Driver ID" />
                  <Column field="name" header="Name" />
                  <Column field="email" header="Email" />
                  <Column field="vehicle_type" header="Vehicle" />
                  <Column field="vehicle_number" header="Vehicle No" />
                  <Column field="zone" header="Zone" />
                  <Column field="is_available" header="Available" />
                  <Column field="rating" header="Rating" />
                  <Column header="Actions" body={actionBodyTemplate} />
                </DataTable>
              </Card>
            </motion.div>
          </TabPanel>

          <TabPanel header="Users" leftIcon="pi pi-users">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Card className="border-round-xl shadow-2" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <div className="flex justify-content-between align-items-center mb-3">
                  <h3 className="text-white m-0">User Management</h3>
                  <Button label="Add User" icon="pi pi-plus" onClick={() => setShowUserDialog(true)} />
                </div>
                <DataTable value={users} paginator rows={10} className="p-datatable-sm">
                  <Column field="name" header="Name" />
                  <Column field="email" header="Email" />
                  <Column field="role" header="Role" />
                  <Column field="orders" header="Orders" />
                  <Column header="Actions" body={actionBodyTemplate} />
                </DataTable>
              </Card>
            </motion.div>
          </TabPanel>

          <TabPanel header="Analytics" leftIcon="pi pi-chart-bar">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <div className="grid">
                <div className="col-12 md:col-8">
                  <Card className="border-round-xl shadow-2 mb-4" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                    <div className="h-20rem w-full flex align-items-center justify-content-center">
                      <i className="pi pi-chart-line text-6xl text-gray-600"></i>
                    </div>
                  </Card>
                </div>
                <div className="col-12 md:col-4">
                  <Card className="border-round-xl shadow-2 mb-4" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                    <h4 className="text-white mb-3">Quick Stats</h4>
                    <div className="flex justify-content-between mb-2">
                      <span className="text-gray-300">Completed Today</span>
                      <span className="text-green-400 font-bold">48</span>
                    </div>
                    <div className="flex justify-content-between mb-2">
                      <span className="text-gray-300">Pending</span>
                      <span className="text-yellow-400 font-bold">12</span>
                    </div>
                    <div className="flex justify-content-between mb-2">
                      <span className="text-gray-300">Cancelled</span>
                      <span className="text-red-400 font-bold">3</span>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          </TabPanel>

          <TabPanel header="Settings" leftIcon="pi pi-cog">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <Card className="border-round-xl shadow-2" style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                <div className="field mb-3">
                  <label className="text-gray-300 block mb-1">Company Name</label>
                  <InputText value="LogiTrack Inc." className="w-full" />
                </div>
                <div className="field mb-3">
                  <label className="text-gray-300 block mb-1">Support Email</label>
                  <InputText value="support@logitrack.com" className="w-full" />
                </div>
                <div className="field mb-3">
                  <label className="text-gray-300 block mb-1">Commission Rate</label>
                  <InputText value="15%" className="w-full" />
                </div>
                <Button label="Save Settings" icon="pi pi-check" className="mt-2" />
              </Card>
            </motion.div>
          </TabPanel>
        </TabView>

        <Dialog
          visible={showUserDialog}
          onHide={() => setShowUserDialog(false)}
          header="Add New User"
          style={{ width: '400px' }}
          className="surface-card border-round-xl"
        >
          <div className="field mb-3">
            <label className="block mb-1">Full Name</label>
            <InputText className="w-full" />
          </div>
          <div className="field mb-3">
            <label className="block mb-1">Email</label>
            <InputText className="w-full" type="email" />
          </div>
          <div className="flex justify-content-end gap-2">
            <Button label="Cancel" className="p-button-text" onClick={() => setShowUserDialog(false)} />
            <Button label="Add User" />
          </div>
        </Dialog>

        <Dialog
          visible={showDriverDialog}
          onHide={() => setShowDriverDialog(false)}
          header="Edit Driver Profile"
          style={{ width: '600px' }}
          className="surface-card border-round-xl"
        >
          <div className="grid">
            <div className="col-12 md:col-6 field mb-3">
              <label className="block mb-1">Full Name</label>
              <InputText value={driverForm.name || ''} onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })} className="w-full" />
            </div>
            <div className="col-12 md:col-6 field mb-3">
              <label className="block mb-1">Email</label>
              <InputText value={driverForm.email || ''} onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })} className="w-full" type="email" />
            </div>
            <div className="col-12 md:col-6 field mb-3">
              <label className="block mb-1">Phone</label>
              <InputText value={driverForm.phone || ''} onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })} className="w-full" />
            </div>
            <div className="col-12 md:col-6 field mb-3">
              <label className="block mb-1">Vehicle Type</label>
              <Dropdown value={driverForm.vehicle_type || ''} options={vehicleTypes} onChange={(e) => setDriverForm({ ...driverForm, vehicle_type: e.value })} className="w-full" placeholder="Select vehicle type" />
            </div>
            <div className="col-12 md:col-6 field mb-3">
              <label className="block mb-1">Vehicle Number</label>
              <InputText value={driverForm.vehicle_number || ''} onChange={(e) => setDriverForm({ ...driverForm, vehicle_number: e.target.value })} className="w-full" />
            </div>
            <div className="col-12 md:col-6 field mb-3">
              <label className="block mb-1">License Number</label>
              <InputText value={driverForm.license_number || ''} onChange={(e) => setDriverForm({ ...driverForm, license_number: e.target.value })} className="w-full" />
            </div>
            <div className="col-12 md:col-6 field mb-3">
              <label className="block mb-1">Vehicle Registration</label>
              <InputText value={driverForm.vehicle_registration || ''} onChange={(e) => setDriverForm({ ...driverForm, vehicle_registration: e.target.value })} className="w-full" />
            </div>
            <div className="col-12 md:col-6 field mb-3">
              <label className="block mb-1">Aadhar Card</label>
              <InputText value={driverForm.aadhar_card || ''} onChange={(e) => setDriverForm({ ...driverForm, aadhar_card: e.target.value })} className="w-full" />
            </div>
            <div className="col-12 md:col-6 field mb-3">
              <label className="block mb-1">Address</label>
              <InputText value={driverForm.address || ''} onChange={(e) => setDriverForm({ ...driverForm, address: e.target.value })} className="w-full" />
            </div>
            <div className="col-12 md:col-6 field mb-3">
              <label className="block mb-1">Zone</label>
              <InputText value={driverForm.zone || ''} onChange={(e) => setDriverForm({ ...driverForm, zone: e.target.value })} className="w-full" />
            </div>
          </div>
          <div className="flex justify-content-end gap-2 mt-4">
            <Button label="Cancel" className="p-button-text" onClick={() => setShowDriverDialog(false)} />
            <Button label="Save Changes" icon="pi pi-check" onClick={handleUpdateDriver} />
          </div>
        </Dialog>
      </motion.div>
    </div>
  );
};

export default AdminPanel;
