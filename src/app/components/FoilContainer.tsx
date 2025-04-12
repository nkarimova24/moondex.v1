import React, { useState } from 'react';
import { useCollection } from "@/context/CollectionContext";
import { useAuth } from "@/context/AuthContext";

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
  card?: any; // Add the card prop to pass card data
}

export default function FoilContainer({ 
  foilTypes, 
  cardId, 
  className = '',
  card
}: FoilContainerProps) {
  const { isAuthenticated } = useAuth();
  const { collections, addCardToCollection } = useCollection();
  
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [successMessages, setSuccessMessages] = useState<{[key: string]: boolean}>({});
  const [errorMessage, setErrorMessage] = useState('');
  
  if (!foilTypes || foilTypes.length === 0) return null;
  
  const getPosition = (index: number): 'first' | 'middle' | 'last' | 'single' => {
    if (foilTypes.length === 1) return 'single';
    if (index === 0) return 'first';
    if (index === foilTypes.length - 1) return 'last';
    return 'middle';
  };
  
  // Simplified add to collection - just add to the first collection
  const handleAddToCollection = async (foilType: string) => {
    if (!isAuthenticated) {
      // Redirect to login page if not authenticated
      window.location.href = '/signin';
      return;
    }
    
    // Reset states
    setErrorMessage('');
    setSuccessMessages(prev => ({ ...prev, [foilType]: false }));
    setLoading(prev => ({ ...prev, [foilType]: true }));
    
    try {
      // Find the user's collection
      if (collections.length === 0) {
        setErrorMessage("You don't have any collections yet. Please create one first.");
        setLoading(prev => ({ ...prev, [foilType]: false }));
        return;
      }
      
      // Just use the first collection
      const collectionId = collections[0].id;
      
      const isFoil = foilType.includes('holo') && !foilType.includes('reverse');
      const isReverseHolo = foilType.includes('reverse');
      
      const cardData = {
        card_id: cardId,
        quantity: 1,
        is_foil: isFoil,
        is_reverse_holo: isReverseHolo
      };
      
      const result = await addCardToCollection(collectionId, cardData);
      
      if (result) {
        // Show success message and auto-hide after 2 seconds
        setSuccessMessages(prev => ({ ...prev, [foilType]: true }));
        setTimeout(() => {
          setSuccessMessages(prev => ({ ...prev, [foilType]: false }));
        }, 2000);
      } else {
        setErrorMessage('Failed to add card to collection.');
      }
    } catch (err) {
      console.error('Error adding card to collection:', err);
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setLoading(prev => ({ ...prev, [foilType]: false }));
    }
  };
  
  // Decrement not fully implemented yet
  const handleDecrement = (type: string) => {
    console.log(`Decrement ${type} for card ${cardId}`);
    // Future enhancement: Implement remove from collection feature
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
          className="relative"
        >
          <CardFoil 
            foilType={foilType}
            position={getPosition(index)}
            isNeighborHovered={false} 
            onIncrement={() => handleAddToCollection(foilType)}
            onDecrement={() => handleDecrement(foilType)}
          />
          
          {loading[foilType] && (
            <div className="absolute top-[-8px] right-[-8px] w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
          )}
          
          {successMessages[foilType] && (
            <div className="absolute top-[-20px] right-[-20px] bg-green-600 text-white text-xs rounded-md px-1 py-0.5 animate-fadeIn">
              Added!
            </div>
          )}
        </div>
      ))}
      
      {errorMessage && (
        <div className="absolute top-[-30px] left-0 right-0 bg-red-600/80 text-white text-xs rounded-md px-2 py-1 text-center">
          {errorMessage}
        </div>
      )}
    </div>
  );
}