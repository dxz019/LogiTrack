// Loader component - displays loading progress for 3D models
// Shows percentage while GLTF model loads

import { Html, useProgress } from '@react-three/drei';
import { motion } from 'framer-motion';

export const Loader = () => {
  const { progress } = useProgress();
  
  return (
    <Html center>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-column align-items-center justify-content-center p-4 bg-white border-round-xl shadow-3"
      >
        <div className="w-10rem h-10rem border-circle border-4 relative">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e6e6e6"
              strokeWidth="4"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="4"
              strokeDasharray="100"
              strokeDashoffset={`${100 - progress}`}
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute top-50 left-50 transform-50 -translate-x-50 -translate-y-50 text-center">
            <span className="text-2xl font-bold text-blue-600">{Math.round(progress)}%</span>
          </div>
        </div>
        <p className="text-gray-600 mt-3 mb-0">Loading 3D Model...</p>
      </motion.div>
    </Html>
  );
};

export default Loader;