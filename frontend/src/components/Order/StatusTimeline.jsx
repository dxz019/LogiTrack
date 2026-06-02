// Status Timeline - PrimeReact Timeline component for order progress visualization
// Shows completed steps with timestamps

import React from 'react';
import { Timeline } from 'primereact/timeline';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';

// Order status configuration - defines the steps and their display properties
const statuses = [
  { label: 'Order Placed', value: 'pending', icon: 'pi pi-check', color: 'success' },
  { label: 'Driver Assigned', value: 'assigned', icon: 'pi pi-user', color: 'info' },
  { label: 'Accepted', value: 'accepted', icon: 'pi pi-check-circle', color: 'info' },
  { label: 'Picked Up', value: 'picked_up', icon: 'pi pi-box', color: 'warning' },
  { label: 'In Transit', value: 'in_transit', icon: 'pi pi-truck', color: 'primary' },
  { label: 'Delivered', value: 'delivered', icon: 'pi pi-check-circle', color: 'success' }
];

export const StatusTimeline = ({ order }) => {
  // Build timeline events from order status
  const events = statuses.map((status, index) => {
    const isCompleted = statuses.findIndex(s => s.value === order?.status) >= index || order?.status === 'delivered';
    const isCancelled = order?.status === 'cancelled';
    
    return {
      status: status.label,
      icon: status.icon,
      color: isCancelled ? 'danger' : isCompleted ? status.color : 'secondary',
      timestamp: isCompleted ? 'Completed' : 'Pending'
    };
  });

  const eventTemplate = (item) => {
    return (
      <div className="flex flex-column">
        <div className="flex align-items-center gap-2 mb-2">
          <Tag severity={item.color} style={{ minWidth: '2rem', minHeight: '2rem' }}>
            <i className={item.icon}></i>
          </Tag>
          <h4 className="m-0 font-medium text-gray-800">{item.status}</h4>
        </div>
        <small className="text-gray-500">{item.timestamp}</small>
      </div>
    );
  };

  return (
    <Card className="border-round-xl bg-white shadow-2">
      <Timeline value={events} content={eventTemplate} layout="vertical" />
    </Card>
  );
};

export default StatusTimeline;