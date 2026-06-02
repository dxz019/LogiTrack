import React from 'react';
import { motion } from 'framer-motion';

const LiveTrackingCard = ({ orderNum, status, statusClass, timeAgo, delay = 0 }) => {
  const iconMap = {
    blue: '🚚',
    teal: '🚛',
    green: '✓',
  };

  return (
    <motion.div
      className="floating-card"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className={`floating-card-icon ${statusClass}`}>
        <span>{iconMap[statusClass] || '📦'}</span>
      </div>
      <div>
        <div className="floating-card-title">Order #{orderNum}</div>
        <div className={`floating-card-meta text-${statusClass}`} style={{ color: `var(--${statusClass === 'blue' ? 'blue2' : statusClass})` }}>
          {status}
        </div>
        <div className="floating-card-time">{timeAgo}</div>
      </div>
    </motion.div>
  );
};

export default LiveTrackingCard;
