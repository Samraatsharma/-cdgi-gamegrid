"use client";
import { useState, useRef } from 'react';

export default function TiltCard({ children, style, className }) {
  const [transform, setTransform] = useState('');
  const [glow, setGlow] = useState({ opacity: 0, x: 0, y: 0 });
  const cardRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = ((y - centerY) / centerY) * -8;
    const tiltY = ((x - centerX) / centerX) * 8;

    setTransform(`perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlow({ opacity: 1, x, y });
  };

  const handleMouseLeave = () => {
    setTransform(`perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`);
    setGlow({ opacity: 0, x: 0, y: 0 });
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`tilt-card ${className || ''}`}
      style={{
        ...style,
        transform,
        transition: 'transform 0.15s ease-out',
        position: 'relative',
        transformStyle: 'preserve-3d',
      }}
    >
      <div 
        className="tilt-glow"
        style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: `radial-gradient(circle at ${glow.x}px ${glow.y}px, rgba(255,255,255,0.15), transparent 50%)`,
          opacity: glow.opacity,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none',
          zIndex: 10,
          borderRadius: 'inherit'
        }}
      />
      {children}
    </div>
  );
}
