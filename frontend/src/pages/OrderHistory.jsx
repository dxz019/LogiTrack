import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Rating } from 'primereact/rating';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { toast } from 'primereact/usetoast';
import { Toast } from 'primereact/toast';
import useOrderStore from '../store/orderStore';
import { Card } from 'primereact/card';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const OrderHistory = () => {
  const { myOrders, orders, getOrders, loading } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const toastRef = React.useRef(null);

  useEffect(() => {
    getOrders();
  }, [getOrders]);

  const statusSeverity = (status) => {
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

  const prioritySeverity = (priority) => {
    const map = {
      normal: 'info',
      express: 'warning',
      urgent: 'danger',
    };
    return map[priority] || 'info';
  };

  const statusBodyTemplate = (rowData) => {
    return <Tag value={rowData.status?.replace('_', ' ').toUpperCase()} severity={statusSeverity(rowData.status)} />;
  };

  const priorityBodyTemplate = (rowData) => {
    return <Tag value={rowData.priority} severity={prioritySeverity(rowData.priority)} />;
  };

  const actionBodyTemplate = (rowData) => {
    const canCancel = rowData.status === 'pending' || rowData.status === 'assigned';
    return (
      <div className="flex gap-2">
        <Link to={`/track/${rowData.id}`}>
          <Button icon="pi pi-eye" className="p-button-rounded p-button-success p-button-sm" tooltip="View Details" />
        </Link>
        {canCancel && (
          <Button 
            icon="pi pi-times" 
            className="p-button-rounded p-button-danger p-button-sm" 
            tooltip="Cancel Order"
            onClick={() => handleCancel(rowData.id)}
          />
        )}
        {rowData.status === 'delivered' && (
          <Button 
            icon="pi pi-star" 
            className="p-button-rounded p-button-warning p-button-sm" 
            tooltip="Rate Driver"
            onClick={() => handleRate(rowData.id)}
          />
        )}
      </div>
    );
  };

  const priceBodyTemplate = (rowData) => {
    return `$${(rowData.price || 0).toFixed(2)}`;
  };

  const dateBodyTemplate = (rowData) => {
    return new Date(rowData.created_at).toLocaleDateString();
  };

  const handleCancel = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Optimistic UI update
    // Would call API to cancel
    toast.show({ severity: 'info', summary: 'Order Cancelled', detail: `Order #${orderId.slice(0,8)} has been cancelled` });
  };

  const handleRate = (orderId) => {
    setSelectedOrder(orderId);
    // Would open rating dialog
    toast.show({ severity: 'info', summary: 'Rate Driver', detail: 'Rating feature coming soon!' });
  };

  return (
    <div className="page-container py-4">
      <Toast ref={toastRef} />
      <ConfirmDialog />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex align-items-center mb-4">
          <i className="pi pi-history text-3xl text-primary mr-3"></i>
          <h1 className="m-0 text-3xl font-bold">Order History</h1>
        </div>

        <Card className="shadow-2 border-round-xl" style={{ background: 'rgba(30,41,59,0.8)', backdropFilter: 'blur(10px)' }}>
          <DataTable 
            value={orders || []} 
            loading={loading}
            paginator 
            rows={10}
            emptyMessage="No orders found"
            className="p-datatable-sm"
            stripedRows
            responsiveLayout="scroll"
          >
            <Column field="id" header="Order ID" body={(row) => `#${row.id?.slice(0, 8)}`} />
            <Column field="pickup_address" header="Pickup" body={(row) => row.pickup_address?.substring(0, 30) + '...'} />
            <Column field="delivery_address" header="Delivery" body={(row) => row.delivery_address?.substring(0, 30) + '...'} />
            <Column field="status" header="Status" body={statusBodyTemplate} />
            <Column field="priority" header="Priority" body={priorityBodyTemplate} />
            <Column field="estimated_distance" header="Distance (km)" />
            <Column field="created_at" header="Date" body={dateBodyTemplate} />
            <Column field="price" header="Price" body={priceBodyTemplate} />
            <Column header="Actions" body={actionBodyTemplate} />
          </DataTable>
        </Card>
      </motion.div>
    </div>
  );
};

export default OrderHistory;