// 3D Background Scene Component - Industrial Futuristic Design
// Floating packages, delivery routes, and particle network for LogiTrack

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

// Animated Package Box Component
const PackageBox = ({ position, scale = 1, color = '#3b82f6' }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={color} 
        metalness={0.3} 
        roughness={0.4}
        emissive="#000000"
      />
    </mesh>
  );
};

// 3D Route Line Component
const RouteLine = ({ points }) => {
  const lineRef = useRef();
  
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(
      points.map(p => new THREE.Vector3(p[0], p[1], p[2]))
    );
    const curveGeometry = new THREE.TubeGeometry(curve, 64, 0.02, 8, false);
    return curveGeometry;
  }, [points]);

  useFrame((state) => {
    if (lineRef.current) {
      lineRef.current.material.emissiveIntensity = Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5;
    }
  });

  return (
    <mesh ref={lineRef}>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} />
    </mesh>
  );
};

// 3D Globe Component with Delivery Routes
const DeliveryGlobe = () => {
  const globeRef = useRef();
  const dotsRef = useRef();
  
  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.002;
    }
  });

  // Generate random points on sphere for delivery locations
  const locations = useMemo(() => {
    const positions = [];
    for (let i = 0; i < 30; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const x = 1.5 * Math.cos(theta) * Math.sin(phi);
      const y = 1.5 * Math.cos(phi);
      const z = 1.5 * Math.sin(theta) * Math.sin(phi);
      positions.push([x, y, z]);
    }
    return positions;
  }, []);

  return (
    <group ref={globeRef}>
      {/* Globe sphere */}
      <mesh>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshStandardMaterial 
          color="#1e293b" 
          metalness={0.6} 
          roughness={0.2}
          transparent
          opacity={0.3}
        />
      </mesh>
      
      {/* Delivery location dots */}
      {locations.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.03, 8, 8]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
      ))}
    </group>
  );
};

// Main 3D Scene Component
const Scene = () => {
  const { viewport } = useThree();
  
  // Package positions in 3D space
  const packages = useMemo(() => [
    [-3, 0, -2], [2, -1, -1], [-1, 2, -3], 
    [3, 1, 0], [-2, -1, 2], [1, 0, -1]
  ], []);

  // Route path points
  const routePoints = useMemo(() => [
    [-4, 0, 0], [-2, 1, -1], [0, 0, -2], [2, -1, -1], [4, 0, 0]
  ], []);

  return (
    <>
      {/* Ambient lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />
      
      {/* Floating packages */}
      {packages.map((pos, i) => (
        <PackageBox 
          key={i} 
          position={pos} 
          scale={0.3 + Math.random() * 0.2}
          color={i % 2 === 0 ? '#3b82f6' : '#8b5cf6'}
        />
      ))}
      
      {/* Delivery route line */}
      <RouteLine points={routePoints} />
      
      {/* Delivery globe */}
      <DeliveryGlobe />
      
      {/* Camera controls (disabled for production) */}
      {/* <OrbitControls enableZoom={false} enablePan={false} /> */}
    </>
  );
};

// 3DBackground Component - Wraps Canvas with HTML overlay
export const ThreeDBackground = ({ 
  className = '', 
  particleCount = 100,
  intensity = 0.8 
}) => {
  return (
    <div className={`absolute inset-0 z-neg-1 ${className}`} style={{ minWidth: '100vw', minHeight: '100vh' }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <Scene />
      </Canvas>
      
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="w-full h-full" 
          style={{ 
            background: 'radial-gradient(circle at center, rgba(59,130,246,0.1), transparent 70%)' 
          }} 
        />
      </div>
    </div>
  );
};

export default ThreeDBackground;