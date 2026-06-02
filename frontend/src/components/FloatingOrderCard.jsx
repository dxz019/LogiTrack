import React from 'react';
import '../styles/hero.css';

const FloatingOrderCard = ({ delay = 0, orderNum, statusText, statusClass, timeAgo, icon }) => {
  return (
    <div className="floating-card" style={{ animationDelay: `${delay}s` }}>
      <div className="floating-card-icon blue">
        <span>{icon}</span>
      </div>
      <div className="floating-card-body">
        <div className="floating-card-title">Order #{orderNum}</div>
        <div className={`floating-card-meta ${statusClass}`}>{statusText}</div>
        <div className="floating-card-time">{timeAgo}</div>
      </div>
    </div>
  );
};

export default FloatingOrderCard;
