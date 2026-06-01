import React from 'react';
import { Timeline } from 'primereact/timeline';
import { Card } from 'primereact/card';
import { motion } from 'framer-motion';

export const StatusTimeline = ({ currentStatus }) => {
  const events = [
    { status: 'Order Placed', code: 'pending', icon: 'pi pi-shopping-cart', color: '#a855f7' },
    { status: 'Driver Assigned', code: 'assigned', icon: 'pi pi-user-plus', color: '#6366f1' },
    { status: 'Accepted', code: 'accepted', icon: 'pi pi-check-circle', color: '#3b82f6' },
    { status: 'Picked Up', code: 'picked_up', icon: 'pi pi-box', color: '#f97316' },
    { status: 'In Transit', code: 'in_transit', icon: 'pi pi-truck', color: '#06b6d4' },
    { status: 'Delivered', code: 'delivered', icon: 'pi pi-check', color: '#10b981' },
  ];

  // Map backend status to timeline index
  const statusToMap = {
    'pending': 0,
    'assigned': 1,
    'accepted': 2,
    'picked_up': 3,
    'in_transit': 4,
    'delivered': 5,
    'cancelled': -1,
  };

  const currentIndex = statusToMap[currentStatus] ?? 0;

  const customizedMarker = (item, index) => {
    const isCompleted = index <= currentIndex;
    const isCurrent = index === currentIndex && currentIndex >= 0;
    
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        whileHover={{ scale: 1.1 }}
        className="flex w-2.5rem h-2.5rem align-items-center justify-content-center text-white border-circle z-1 shadow-2"
        style={{ 
          backgroundColor: isCompleted ? item.color : '#374151',
          boxShadow: isCurrent ? `0 0 20px ${item.color}66` : '0 4px 6px rgba(0,0,0,0.2)',
          border: isCurrent ? '2px solid #ffffff' : 'none'
        }}
      >
        <i className={`${item.icon} text-sm`}></i>
      </motion.div>
    );
  };

  const customizedContent = (item, index) => {
    const isCompleted = index <= currentIndex;
    const isCurrent = index === currentIndex && currentIndex >= 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        whileHover={{ x: 5 }}
      >
        <Card 
          className={`mb-3 border-round-xl transition-all transition-duration-300 ${isCurrent ? 'shadow-4' : 'shadow-1'}`}
          style={{ 
            opacity: isCompleted ? 1 : 0.5,
            background: isCompleted ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
            borderLeft: isCompleted ? `4px solid ${item.color}` : '4px solid transparent',
            cursor: 'pointer'
          }}
        >
          <div className="flex align-items-center justify-content-between">
            <h3 className="text-lg font-bold m-0" style={{ color: isCompleted ? item.color : '#6b7280' }}>
              {item.status}
            </h3>
            {isCompleted && (
              <i className="pi pi-check-circle text-green-400" style={{ fontSize: '1.2rem' }}></i>
            )}
          </div>
          {isCurrent && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm mt-2 mb-0 text-blue-300"
            >
              Currently in this stage...
            </motion.p>
          )}
        </Card>
      </motion.div>
    );
  };

  if (currentStatus === 'cancelled') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-5 bg-gradient-to-r from-red-900/30 to-red-800/30 text-red-300 border-round-xl text-center glass-panel"
      >
        <i className="pi pi-times-circle text-4xl mb-3 block"></i>
        <h3 className="m-0 font-bold text-red-400">This order has been cancelled.</h3>
      </motion.div>
    );
  }

  return (
    <div className="card">
      <Timeline 
        value={events} 
        align="alternate" 
        className="customized-timeline" 
        marker={customizedMarker} 
        content={customizedContent}
        layout="vertical"
      />
    </div>
  );
};

export default StatusTimeline;