import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { useSocket } from '../../hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';

export const NotificationPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('notification:new', (notification) => {
        setNotifications(prev => [notification, ...prev.slice(0, 9)]);
        setShowPanel(true);
      });
    }
  }, [socket]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <Button
        icon="pi pi-bell"
        className="p-button-rounded p-button-text relative"
        onClick={() => setShowPanel(!showPanel)}
      >
        {unreadCount > 0 && (
          <Badge value={unreadCount} severity="danger" className="absolute top-0 right-0" />
        )}
      </Button>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-100 right-0 w-20rem z-5 shadow-5"
          >
            <Card className="border-round-xl" style={{ background: 'rgba(30,41,59,0.95)', backdropFilter: 'blur(10px)' }}>
              <div className="flex align-items-between justify-content-between mb-3">
                <h3 className="m-0 text-white">Notifications</h3>
                <Button icon="pi pi-times" className="p-button-rounded p-button-text p-button-sm" onClick={() => setShowPanel(false)} />
              </div>
              
              {notifications.length === 0 ? (
                <div className="text-center py-4">
                  <i className="pi pi-bell text-3xl text-gray-500 mb-2"></i>
                  <p className="text-gray-400 m-0">No notifications yet</p>
                </div>
              ) : (
                <div className="max-h-20rem overflow-y-auto">
                  {notifications.map((notification, i) => (
                    <motion.div
                      key={notification.id || i}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 border-round-lg mb-2 cursor-pointer hover:bg-white-alpha-10"
                      style={{ background: notification.is_read ? 'transparent' : 'rgba(59,130,246,0.1)' }}
                    >
                      <h4 className="m-0 mb-1 text-white font-bold">{notification.title}</h4>
                      <p className="m-0 text-gray-300 text-sm">{notification.message}</p>
                      <small className="text-gray-500">{new Date(notification.sent_at).toLocaleTimeString()}</small>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPanel;
