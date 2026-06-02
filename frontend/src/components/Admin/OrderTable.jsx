import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import api from '../../services/api';
import { motion } from 'framer-motion';

export const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const statusSeverity = (status) => {
    const map = { pending: 'warning', assigned: 'info', accepted: 'info', picked_up: 'primary', in_transit: 'primary', delivered: 'success', cancelled: 'danger' };
    return map[status] || 'info';
  };

  const statusTemplate = (rowData) => (
    <Tag value={rowData.status} severity={statusSeverity(rowData.status)} />
  );

  const actionTemplate = (rowData) => (
    <Button 
      icon="pi pi-eye" 
      className="p-button-rounded p-button-sm" 
      onClick={() => window.location.href = `/track/${rowData.id}`}
    />
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <ConfirmDialog />
      <DataTable
        value={orders}
        loading={loading}
        paginator
        rows={10}
        emptyMessage="No orders found"
        className="p-datatable-sm"
        stripedRows
        responsiveLayout="scroll"
      >
        <Column field="id" header="Order ID" body={(row) => `#${row.id?.slice(0, 8)}`} />
        <Column field="customer_name" header="Customer" />
        <Column field="pickup_address" header="Pickup" body={(row) => row.pickup_address?.substring(0, 30) + '...'} />
        <Column field="status" header="Status" body={statusTemplate} />
        <Column field="created_at" header="Date" body={(row) => new Date(row.created_at).toLocaleDateString()} />
        <Column body={actionTemplate} header="Actions" />
      </DataTable>
    </motion.div>
  );
};

export default OrderTable;
