import React from 'react';

interface CardFoilProps {
  foilType?: string;
  className?: string;
}

export default function CardFoil({ foilType, className = '' }: CardFoilProps) {
  if (!foilType) return null;
  
  const normalizedType = foilType.toLowerCase();
  
  let color = '';
  let label = '';
  
  if (normalizedType.includes('normal')) {
    color = 'bg-green-600';
    label = 'Normal';
  } else if (normalizedType.includes('holo') && normalizedType.includes('reverse')) {
    color = 'bg-red-600';
    label = 'Reverse Holo';
  } else if (normalizedType.includes('holo')) {
    color = 'bg-blue-600';
    label = 'Holo';
  } else {
    return null; 
  }
  
  return (
    <span 
      className={`text-xs px-1.5 py-0.5 ${color} text-white rounded-full ${className}`}
      title={`Foil type: ${label}`}
    >
      {label}
    </span>
  );
}