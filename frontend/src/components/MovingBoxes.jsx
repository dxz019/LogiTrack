import React, { useEffect, useRef } from 'react';

const MovingBoxes = ({ isStatic = false }) => {
  const containerRef = useRef();

  useEffect(() => {
    if (isStatic) return;
    
    const boxes = [];
    const container = containerRef.current;
    if (!container) return;

    for (let i = 0; i < 15; i++) {
      const box = document.createElement('div');
      box.className = 'absolute w-8 h-8 opacity-20 pointer-events-none';
      box.style.background = i % 3 === 0 ? 'var(--blue)' : i % 2 === 0 ? 'var(--purple)' : 'var(--green)';
      box.style.borderRadius = '2px';
      box.style.left = `${Math.random() * 100}%`;
      box.style.top = `${Math.random() * 100}%`;
      const duration = 10 + Math.random() * 20;
      const delay = Math.random() * 5;
      box.style.animation = `float ${duration}s infinite ease-in-out`;
      box.style.animationDelay = `${delay}s`;
      container.appendChild(box);
      boxes.push(box);
    }

    return () => boxes.forEach(b => b.remove());
  }, [isStatic]);

  if (isStatic) {
    return (
      <div ref={containerRef} className="absolute inset-0">
        <style>{`
          @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(180deg)} }
        `}</style>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-20px) rotate(180deg)} }
      `}</style>
    </div>
  );
};

export default MovingBoxes;