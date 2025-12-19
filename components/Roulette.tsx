
import React, { useState, useEffect, useRef } from 'react';
import { TargetApp } from '../types';
import { TARGET_APPS } from '../constants';

interface RouletteProps {
  onSelected: (app: TargetApp) => void;
  isSpinning: boolean;
}

const Roulette: React.FC<RouletteProps> = ({ onSelected, isSpinning }) => {
  const [spinOffset, setSpinOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extend the list for infinite-like scrolling
  const items = [...TARGET_APPS, ...TARGET_APPS, ...TARGET_APPS, ...TARGET_APPS, ...TARGET_APPS];
  const itemWidth = 100;

  useEffect(() => {
    if (isSpinning) {
      const luckyIndex = Math.floor(Math.random() * TARGET_APPS.length) + (TARGET_APPS.length * 3);
      const targetOffset = -(luckyIndex * itemWidth) + (containerRef.current?.offsetWidth || 0) / 2 - (itemWidth / 2);
      
      setSpinOffset(targetOffset);

      const timeout = setTimeout(() => {
        onSelected(TARGET_APPS[luckyIndex % TARGET_APPS.length]);
      }, 3000);

      return () => clearTimeout(timeout);
    } else {
      setSpinOffset(0);
    }
  }, [isSpinning, onSelected]);

  return (
    <div className="relative w-full overflow-hidden bg-gray-800 border-y-4 border-yellow-600 h-32 flex items-center shadow-inner">
      {/* Pointer */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-red-600 z-10 -translate-x-1/2 shadow-lg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-red-600"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[15px] border-b-red-600"></div>
      </div>

      <div 
        ref={containerRef}
        className="flex transition-transform duration-[3000ms] cubic-bezier(0.15, 0, 0.15, 1)"
        style={{ transform: `translateX(${spinOffset}px)` }}
      >
        {items.map((app, i) => (
          <div 
            key={i} 
            className="flex-shrink-0 w-[100px] flex flex-col items-center justify-center text-white"
          >
            <i className={`${app.icon} text-4xl mb-1`}></i>
            <span className="text-[10px] font-bold uppercase truncate w-20 text-center">{app.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roulette;
