import React from 'react';
import { Timeline } from 'primereact/timeline';
import { Card } from 'primereact/card';

export const StatusTimeline = ({ currentStatus }) => {
  const events = [
    { status: 'Order Placed', code: 'pending', icon: 'pi pi-shopping-cart', color: '#9C27B0' },
    { status: 'Driver Assigned', code: 'assigned', icon: 'pi pi-user', color: '#673AB7' },
    { status: 'Picked Up', code: 'picked_up', icon: 'pi pi-box', color: '#FF9800' },
    { status: 'In Transit', code: 'in_transit', icon: 'pi pi-compass', color: '#00BCD4' },
    { status: 'Delivered', code: 'delivered', icon: 'pi pi-check', color: '#4CAF50' },
  ];

  // Map backend status to timeline index
  const statusToMap = {
    'pending': 0,
    'assigned': 1,
    'accepted': 1,
    'picked_up': 2,
    'in_transit': 3,
    'delivered': 4,
    'cancelled': -1,
  };

  const currentIndex = statusToMap[currentStatus] ?? 0;

  const customizedMarker = (item, index) => {
    const isCompleted = index <= currentIndex;
    return (
      <span className="flex w-2rem h-2rem align-items-center justify-content-center text-white border-circle z-1 shadow-1" 
            style={{ backgroundColor: isCompleted ? item.color : '#e0e0e0' }}>
        <i className={item.icon}></i>
      </span>
    );
  };

  const customizedContent = (item, index) => {
    const isCompleted = index <= currentIndex;
    const isCurrent = index === currentIndex;
    return (
      <Card className={`mb-3 ${isCurrent ? 'border-primary border-2 shadow-4' : 'shadow-1'}`} 
            style={{ opacity: isCompleted ? 1 : 0.6 }}>
        <h3 className="text-xl font-bold m-0" style={{ color: isCompleted ? item.color : '#9e9e9e' }}>
          {item.status}
        </h3>
        {isCurrent && <p className="text-sm mt-2 mb-0">Currently in this stage.</p>}
      </Card>
    );
  };

  if (currentStatus === 'cancelled') {
    return (
      <div className="p-4 bg-red-100 text-red-700 border-round font-bold text-center">
        This order has been cancelled.
      </div>
    );
  }

  return (
    <div className="card">
      <Timeline value={events} align="alternate" className="customized-timeline" 
                marker={customizedMarker} content={customizedContent} />
    </div>
  );
};

export default StatusTimeline;
