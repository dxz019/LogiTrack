import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { motion } from 'framer-motion';
import api from '../../services/api';

const StatCard = ({ title, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ scale: 1.03 }}
  >
    <Card className="border-round-xl" style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex align-items-center justify-content-between">
        <div>
          <p className="text-gray-400 m-0 text-sm">{title}</p>
          <p className={`text-2xl font-bold m-0 text-${color}`}>{value}</p>
        </div>
        <div className={`w-3rem h-3rem border-round-xl bg-${color}-500 bg-opacity-20 flex align-items-center justify-content-center`}>
          <i className={`pi ${icon} text-2xl text-${color}`}></i>
        </div>
      </div>
    </Card>
  </motion.div>
);

export const StatsCards = () => {
  const [stats, setStats] = useState({
    activeOrders: 0,
    availableDrivers: 0,
    avgETA: '0 min',
    onTimeRate: '0%'
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.stats || stats);
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  return (
    <div className="grid">
      <div className="col-12 md:col-3">
        <StatCard title="Active Orders" value={stats.activeOrders} icon="pi-shopping-cart" color="blue" delay={0.1} />
      </div>
      <div className="col-12 md:col-3">
        <StatCard title="Available Drivers" value={stats.availableDrivers} icon="pi-users" color="green" delay={0.2} />
      </div>
      <div className="col-12 md:col-3">
        <StatCard title="Avg ETA" value={stats.avgETA} icon="pi-clock" color="orange" delay={0.3} />
      </div>
      <div className="col-12 md:col-3">
        <StatCard title="On-Time Rate" value={stats.onTimeRate} icon="pi-chart-line" color="purple" delay={0.4} />
      </div>
    </div>
  );
};

export default StatsCards;
