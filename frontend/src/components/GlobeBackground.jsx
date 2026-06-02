import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'react-globe.gl';

const GlobeBackground = () => {
  const globeEl = React.useRef();

  React.useEffect(() => {
    if (!globeEl.current) return;

    const globe = globeEl.current;
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;

    const arcsData = [];
    for (let i = 0; i < 15; i++) {
      arcsData.push({
        startLat: (Math.random() - 0.5) * 160,
        startLng: (Math.random() - 0.5) * 360,
        endLat: (Math.random() - 0.5) * 160,
        endLng: (Math.random() - 0.5) * 360,
        color: ['#2563EB', '#7C3AED', '#3B82F6'][Math.floor(Math.random() * 3)],
      });
    }

    globe.arcsData(arcsData);
    globe.arcColor('color');
    globe.arcAltitude(0.15);
    globe.arcStroke(0.5);
    globe.pointsData([]);
    globe.labelsData([]);
  }, []);

  return (
    <div className="globe-container">
      <Globe
        ref={globeEl}
        width={400}
        height={400}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        showAtmosphere={true}
        atmosphereColor="#3B82F6"
        showGraticules={false}
      />
    </div>
  );
};

export default GlobeBackground;
