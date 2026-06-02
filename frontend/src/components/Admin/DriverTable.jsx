import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ToggleButton } from 'primereact/togglebutton';
import api from '../../services/api';
import { motion } from 'framer-motion';

export const DriverTable = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/drivers');
      setDrivers(res.data.drivers || []);
    } catch (err) {
      console.error('Failed to fetch drivers');
    } finally {
      setLoading(false);
    }
  };

  const statusTemplate = (rowData) => (
    <Tag 
      value={rowData.is_available ? 'Available' : 'Busy'} 
      severity={rowData.is_available ? 'success' : 'warning'} 
    />
  );

  const onlineTemplate = (rowData) => (
    <Tag 
      value={rowData.is_online ? 'Online' : 'Offline'} 
      severity={rowData.is_online ? 'info' : 'danger'} 
    />
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <DataTable
        value={drivers}
        loading={loading}
        paginator
        rows={10}
        emptyMessage="No drivers found"
        className="p-datatable-sm"
        stripedRows
        responsiveLayout="scroll"
      >
        <Column field="name" header="Driver Name" />
        <Column field="email" header="Email" />
        <Column field="vehicle_type" header="Vehicle" />
        <Column field="is_available" header="Status" body={statusTemplate} />
        <Column field="is_online" header="Online" body={onlineTemplate} />
        <Column field="rating" header="Rating" body={(row) => `${row.rating || 5}★`} />
        <Column field="total_deliveries" header="Deliveries" />
      </DataTable>
    </motion.div>
  );
};

export default DriverTable;
