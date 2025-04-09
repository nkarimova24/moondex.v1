import React, { useState } from 'react';

interface CardFoilProps {
  foilType?: string;
  className?: string;
  isNeighborHovered?: boolean;
  position?: 'first' | 'middle' | 'last';
}

export default function CardFoil({ 
  foilType, 
  className = '',
  isNeighborHovered = false,
  position = 'middle'
}: CardFoilProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  if (!foilType) return null;
  
  const normalizedType = foilType.toLowerCase();
  
  let borderColor = '';
  let tooltipText = '';
  
  if (normalizedType.includes('normal')) {
    borderColor = 'border-green-600 hover:bg-green-600/10';
    tooltipText = 'Normal';
  } else if (normalizedType.includes('holo') && normalizedType.includes('reverse')) {
    borderColor = 'border-red-600 hover:bg-red-600/10';
    tooltipText = 'Reverse Holo';
  } else if (normalizedType.includes('holo')) {
    borderColor = 'border-blue-600 hover:bg-blue-600/10';
    tooltipText = 'Holo';
  } else {
    return null;
  }

  let transform = '';
  
  if (isNeighborHovered) {
    if (position === 'first') {
      transform = 'transform -translate-x-4'; 
    } else if (position === 'last') {
      transform = 'transform translate-x-4'; 
    } else if (position === 'middle') {
      transform = 'transform translate-x-2';
    }
  }

  return (
    <div 
      className={`relative inline-block transition-transform duration-200 ${transform} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`w-6 h-6 border-2 rounded-md ${borderColor} ${isHovered ? 'scale-110' : ''} bg-transparent transition-all duration-200`}
        title={`Foil type: ${tooltipText}`}
      />
      
      {/* Minus button */}
      {isHovered && (
        <button 
          className="absolute left-0 top-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-800 shadow-md opacity-90 transform -translate-x-1/2 -translate-y-1/2 hover:bg-gray-700 z-20"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Decrease quantity for', tooltipText);
            //insert decrease logic
          }}
        >
          <span className="text-white text-xs font-bold">-</span>
        </button>
      )}
      
      {/* Plus button */}
      {isHovered && (
        <button 
          className="absolute right-0 top-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-800 shadow-md opacity-90 transform translate-x-1/2 -translate-y-1/2 hover:bg-gray-700 z-20"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Increase quantity for', tooltipText);
            //insert increate logic
          }}
        >
          <span className="text-white text-xs font-bold">+</span>
        </button>
      )}
    </div>
  );
}