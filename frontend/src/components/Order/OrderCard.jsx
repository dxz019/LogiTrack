import React from 'react';
import { Card } from 'primereact/card';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const OrderCard = ({ order }) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="border-round-xl" style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex flex-column gap-3">
          <div className="flex align-items-center justify-content-between">
            <h3 className="m-0 text-white font-bold">#{order.id?.slice(0, 8)}</h3>
            <Tag value={order.status} severity={statusSeverity(order.status)} />
          </div>
          
          <div className="grid">
            <div className="col-6">
              <p className="text-gray-400 m-0 text-sm">Pickup</p>
              <p className="text-gray-200 m-0">{order.pickup_address?.substring(0, 40)}...</p>
            </div>
            <div className="col-6">
              <p className="text-gray-400 m-0 text-sm">Delivery</p>
              <p className="text-gray-200 m-0">{order.delivery_address?.substring(0, 40)}...</p>
            </div>
          </div>

          <div className="flex justify-content-between align-items-center">
            <div>
              <p className="text-gray-400 m-0 text-sm">Price</p>
              <p className="text-green-400 m-0 font-bold">${order.price || 0}</p>
            </div>
            <Link to={`/track/${order.id}`}>
              <Button label="Track" icon="pi pi-map" className="p-button-sm p-button-outlined" />
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default OrderCard;