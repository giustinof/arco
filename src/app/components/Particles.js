'use client';

import { useEffect, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const Particles = () => {
  const count = 30;
  
  const getRandom = (min, max) => Math.random() * (max - min) + min;
  
  const renderParticles = () => {
    return Array.from({ length: count }).map((_, i) => {
      const size = getRandom(2, 6);
      const duration = getRandom(10, 30);
      const delay = getRandom(0, 5);
      const x = getRandom(0, 100);
      const y = getRandom(0, 100);
      
      return (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0,
            x: `${x}%`,
            y: `${y}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [`${y}%`, `${y - getRandom(10, 30)}%`],
            x: [`${x}%`, `${x + getRandom(-10, 10)}%`],
          }}
          transition={{
            duration: duration,
            delay: delay,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
          className="absolute rounded-full bg-blue-400/30 pointer-events-none"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            filter: 'blur(1px)',
          }}
        />
      );
    });
  };

  return (
    <div className="fixed inset-0 overflow-hidden z-0">
      {renderParticles()}
    </div>
  );
};

export default Particles;