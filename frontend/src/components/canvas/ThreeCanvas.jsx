// Canvas component for 3D model rendering
import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import Loader from '../Loader';

// 3D Model component - loads GLTF model with animations
const Model = ({ modelPath = '/3DModel/scene.gltf', scale = 1 }) => {
  const group = useRef();
  
  // Load GLTF model - works with both .gltf and .glb formats
  const { scene } = useGLTF(modelPath);
  
  // Rotate model slowly for visual effect
  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={group}>
      <primitive object={scene} scale={scale} />
    </group>
  );
};

// Main Canvas wrapper component
export const ThreeCanvas = ({ 
  modelPath,
  className = '',
  height = '400px',
  background = '#f8fafc'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-round-xl overflow-hidden shadow-3 ${className}`}
      style={{ background }}
    >
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Suspense fallback={<Loader />}>
          <Model modelPath={modelPath} />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </motion.div>
  );
};

export default ThreeCanvas;