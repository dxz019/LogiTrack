// Simple 3D delivery truck model - used as placeholder when no GLTF model is available
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion } from 'framer-motion';

export const DeliveryTruck = () => {
  const truckRef = useRef();
  
  useFrame((state) => {
    if (truckRef.current) {
      truckRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group ref={truckRef}>
      {/* Truck body */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2, 1, 1.5]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      {/* Truck cabin */}
      <mesh position={[0.4, 0.4, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.6]} />
        <meshStandardMaterial color="#1e40af" />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[-0.6, -0.4, 0.5]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0.6, -0.4, 0.5]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[-0.6, -0.4, -0.5]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
      <mesh position={[0.6, -0.4, -0.5]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#1f2937" />
      </mesh>
    </group>
  );
};

export default DeliveryTruck;