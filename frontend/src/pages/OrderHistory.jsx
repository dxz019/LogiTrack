import React, { useEffect, useState, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import useOrderStore from '../store/orderStore';
import { Card } from 'primereact/card';
import { Link } from 'react-router-dom';

export const OrderHistory = () => {
  const { orders, fetchOrders, loading, cancelOrder } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const toastRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const showToast = (severity, summary, detail) => {
    if (toastRef.current) {
      toastRef.current.show({ severity, summary, detail });
    }
  };

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
    try {
      await cancelOrder(orderId);
      showToast('info', 'Order Cancelled', `Order #${orderId.slice(0,8)} has been cancelled`);
    } catch (error) {
      showToast('error', 'Cancellation Failed', 'Could not cancel order');
    }
  };

  const handleRate = (orderId) => {
    setSelectedOrder(orderId);
    showToast('info', 'Rate Driver', 'Rating feature coming soon!');
  };

  return (
    <div className="page-container py-4">
      <Toast ref={toastRef} />
      <ConfirmDialog />
      
      <div className="flex align-items-center mb-4">
        <i className="pi pi-history text-3xl text-primary mr-3"></i>
        <h1 className="m-0 text-3xl font-bold">Order History</h1>
      </div>

      <Card className="shadow-2 border-round-xl">
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
    </div>
  );
};

export default OrderHistory;
