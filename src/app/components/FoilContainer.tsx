import React, { useState } from 'react';

interface CardFoilProps {
  foilType: string;
  onIncrement?: () => void;
  onDecrement?: () => void;
}

function CardFoil({ foilType, onIncrement, onDecrement }: CardFoilProps) {
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
      className="flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Minus button */}
      {isHovered && (
        <button 
          className="flex-shrink-0 h-4 w-4 flex items-center justify-center rounded-full bg-gray-800 opacity-90 hover:bg-gray-700 mr-1"
          onClick={(e) => {
            e.stopPropagation();
            if (onDecrement) onDecrement();
          }}
        >
          <span className="text-white text-xs leading-none">-</span>
        </button>
      )}
      
      {/* Foil box */}
      <div 
        className={`w-5 h-5 border-2 rounded-md ${borderColor} ${hoverBg} transition-colors duration-200`}
        title={` ${tooltipText}`}
      />
      
      {/* Plus button */}
      {isHovered && (
        <button 
          className="flex-shrink-0 h-4 w-4 flex items-center justify-center rounded-full bg-gray-800 opacity-90 hover:bg-gray-700 ml-1"
          onClick={(e) => {
            e.stopPropagation();
            if (onIncrement) onIncrement();
          }}
        >
          <span className="text-white text-xs leading-none">+</span>
        </button>
      )}
    </div>
  );
}

interface FoilContainerProps {
  foilTypes: string[];
  cardId: string;
  className?: string;
}

export default function FoilContainer({ foilTypes, cardId, className = '' }: FoilContainerProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  if (foilTypes.length === 0) return null;
  
  return (
    <div className={`flex ${className}`} style={{ gap: '6px' }}>
      {foilTypes.map((foilType, index) => (
        <div 
          key={`${cardId}-${foilType}`}
          style={{
            transition: 'transform 0.15s ease-out',
            transform: hoveredIndex !== null && hoveredIndex !== index
              ? `translateX(${hoveredIndex < index ? '5px' : '-5px'})`
              : 'translateX(0)'
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={(e) => e.stopPropagation()}
        >
          <CardFoil 
            foilType={foilType}
            onIncrement={() => console.log(`Increment ${foilType}`)}
            onDecrement={() => console.log(`Decrement ${foilType}`)}
          />
        </div>
      ))}
    </div>
  );
}