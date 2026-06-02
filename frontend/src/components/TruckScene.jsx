import React from 'react';
import { motion } from 'framer-motion';

const TruckScene = () => {
  return (
    <div className="truck-container">
      <div className="glow-circle"></div>
      <motion.img
        src="/hero-truck.svg"
        alt="Futuristic Logistics Truck"
        className="truck-image"
        initial={{ opacity: 0, x: 100, rotateY: -15 }}
        animate={{ opacity: 1, x: 0, rotateY: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        whileHover={{ scale: 1.02 }}
      />
    </div>
  );
};

export default TruckScene;
