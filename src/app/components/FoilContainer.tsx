import React, { useState } from 'react';

interface CardFoilProps {
  foilType: string;
  position: 'first' | 'middle' | 'last' | 'single';
  isNeighborHovered: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
}

function CardFoil({ 
  foilType, 

  onIncrement, 
  onDecrement 
}: CardFoilProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const normalizedType = foilType.toLowerCase();
  
  let borderColor = '';
  let hoverBg = '';
  let tooltipText = '';
  
  if (normalizedType.includes('normal')) {
    borderColor = 'border-green-600';
    hoverBg = 'hover:bg-green-600/10';
    tooltipText = 'Normal';
  } else if (normalizedType.includes('holo') && normalizedType.includes('reverse')) {
    borderColor = 'border-red-600';
    hoverBg = 'hover:bg-red-600/10';
    tooltipText = 'Reverse Holo';
  } else if (normalizedType.includes('holo')) {
    borderColor = 'border-blue-600';
    hoverBg = 'hover:bg-blue-600/10';
    tooltipText = 'Holo';
  }

  return (
    <div 
      className="relative inline-flex items-center justify-center"
      style={{ width: '40px', height: '28px' }} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Minus button - positioned outside the foil box */}
      <button 
        className="absolute left-[-8px] w-4 h-4 flex items-center justify-center rounded-full bg-gray-800 shadow-md hover:bg-gray-700 z-20 transition-opacity"
        style={{ opacity: isHovered ? 0.9 : 0.6 }}
        onClick={(e) => {
          e.stopPropagation();
          onDecrement();
        }}
      >
        <span className="text-white text-xs font-bold">-</span>
      </button>
      
      {/* Foil indicator box - in the middle */}
      <div 
        className={`w-6 h-6 border-2 rounded-md ${borderColor} ${hoverBg} bg-transparent transition-colors duration-200 mx-auto`}
        title={`Foil type: ${tooltipText}`}
      />
      
      {/* Plus button - positioned outside the foil box */}
      <button 
        className="absolute right-[-8px] w-4 h-4 flex items-center justify-center rounded-full bg-gray-800 shadow-md hover:bg-gray-700 z-20 transition-opacity"
        style={{ opacity: isHovered ? 0.9 : 0.6 }}
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
      >
        <span className="text-white text-xs font-bold">+</span>
      </button>
    </div>
  );
}

interface FoilContainerProps {
  foilTypes: string[];
  cardId: string;
  className?: string;
}

export default function FoilContainer({ foilTypes, cardId, className = '' }: FoilContainerProps) {
  if (!foilTypes || foilTypes.length === 0) return null;
  
  const getPosition = (index: number): 'first' | 'middle' | 'last' | 'single' => {
    if (foilTypes.length === 1) return 'single';
    if (index === 0) return 'first';
    if (index === foilTypes.length - 1) return 'last';
    return 'middle';
  };
  
  // increment/decrement
  const handleIncrement = (type: string) => {
    console.log(`Increment ${type} for card ${cardId}`);
   
  };
  
  const handleDecrement = (type: string) => {
    console.log(`Decrement ${type} for card ${cardId}`);
   
  };
  
  return (
    <div 
      className={`flex ${className}`} 
      style={{ gap: '20px', zIndex: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      {foilTypes.map((foilType, index) => (
        <div 
          key={`${cardId}-${foilType}`}
        >
          <CardFoil 
            foilType={foilType}
            position={getPosition(index)}
            isNeighborHovered={false} 
            onIncrement={() => handleIncrement(foilType)}
            onDecrement={() => handleDecrement(foilType)}
          />
        </div>
      ))}
    </div>
  );
}