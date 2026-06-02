import React from 'react';
import { motion } from 'framer-motion';

const StatsPanel = () => {
  const stats = [
    { icon: '👥', label: 'Active Users', value: '250M+', color: 'blue' },
    { icon: '🛡️', label: 'On-Time Delivery', value: '99.9%', color: 'teal' },
    { icon: '🏙️', label: 'Cities Covered', value: '150+', color: 'amber' },
    { icon: '🎧', label: 'Support', value: '24/7', color: 'purple' },
  ];

  return (
    <section className="stats-section">
      <div className="stats-container">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="glass-card stat-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <div className={`stat-icon ${stat.color}`}>{stat.icon}</div>
            <div className="stat-value" style={{ color: `var(--${stat.color === 'blue' ? 'blue2' : stat.color})` }}>
              {stat.value}
            </div>
            <div className="stat-label">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsPanel;
