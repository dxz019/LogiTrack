import React from 'react';
import { motion } from 'framer-motion';
import GlobeBackground from './GlobeBackground';
import TruckScene from './TruckScene';
import LiveTrackingCard from './LiveTrackingCard';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 6}s`,
            }}
          />
        ))}
      </div>

      <div className="hero-content">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span>🚛</span>
          <span>Smart Logistics, Delivered</span>
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          Fast, Reliable
          <br />
          <span className="gradient-text">Delivery Logistics</span>
        </motion.h1>

        <motion.p
          className="hero-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Real-time tracking, intelligent routing, and instant notifications for your delivery operations. Track packages with precision.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <button className="btn-primary" type="button">
            🚀 Get Started Free
          </button>
          <button className="btn-secondary" type="button">
            ↗ Log In
          </button>
        </motion.div>

        <motion.div
          className="track-bar"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <input placeholder="Enter Order ID to track..." />
          <button aria-label="Track" type="button">→</button>
        </motion.div>
      </div>

      <div className="hero-visual">
        <GlobeBackground />
        <TruckScene />
        <div className="floating-cards">
          <LiveTrackingCard
            orderNum="LT1256"
            status="Out for Delivery"
            statusClass="blue"
            timeAgo="2 min ago"
            delay={0}
          />
          <LiveTrackingCard
            orderNum="LT1257"
            status="In Transit"
            statusClass="teal"
            timeAgo="15 min ago"
            delay={0.4}
          />
          <LiveTrackingCard
            orderNum="LT1258"
            status="Delivered"
            statusClass="green"
            timeAgo="1 hour ago"
            delay={0.8}
          />
        </div>
        <div className="neon-road" />
      </div>
    </section>
  );
};

export default HeroSection;
