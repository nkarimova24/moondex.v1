import React, { useState, useEffect } from 'react';
import { useCollection } from "@/context/CollectionContext";
import { useAuth } from "@/context/AuthContext";
import toast from 'react-hot-toast';

interface CardFoilProps {
  foilType: string;
  position: 'first' | 'middle' | 'last' | 'single';
  isNeighborHovered: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
  quantity: number;
}

function CardFoil({ 
  foilType, 
  onIncrement, 
  onDecrement,
  quantity = 0
}: CardFoilProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const normalizedType = foilType.toLowerCase();
  
  let borderColor = '';
  let bgColor = '';
  let hoverBg = '';
  let tooltipText = '';
  
  if (normalizedType.includes('normal')) {
    borderColor = 'border-green-600';
    bgColor = 'bg-green-600/20';
    hoverBg = 'hover:bg-green-600/30';
    tooltipText = 'Normal';
  } else if (normalizedType.includes('holo') && normalizedType.includes('reverse')) {
    borderColor = 'border-red-600';
    bgColor = 'bg-red-600/20';
    hoverBg = 'hover:bg-red-600/30';
    tooltipText = 'Reverse Holo';
  } else if (normalizedType.includes('holo')) {
    borderColor = 'border-blue-600';
    bgColor = 'bg-blue-600/20';
    hoverBg = 'hover:bg-blue-600/30';
    tooltipText = 'Holo';
  }

  return (
    <div 
      className="relative inline-flex items-center justify-center"
      style={{ width: '40px', height: '28px' }} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Minus button  */}
      <button 
        className="absolute left-[-8px] w-4 h-4 flex items-center justify-center rounded-full bg-gray-800 shadow-md hover:bg-gray-700 z-20 transition-opacity"
        style={{ opacity: isHovered ? 0.9 : 0.6 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onDecrement();
        }}
        disabled={quantity <= 0}
      >
        <span className="text-white text-xs font-bold">-</span>
      </button>
      
      {/* Foil indicator box with quantity inside */}
      <div 
        className={`w-6 h-6 border rounded-md ${borderColor} ${bgColor} ${hoverBg} transition-colors duration-200 mx-auto relative flex items-center justify-center`}
        title={`Foil type: ${tooltipText}${quantity > 0 ? ` (${quantity} in collection)` : ''}`}
      >
        {quantity > 0 ? (
          <span className="text-xs text-white">
            {quantity}
          </span>
        ) : (
          <span className="text-xs text-gray-400">0</span>
        )}
      </div>
      
      {/* Plus button */}
      <button 
        className="absolute right-[-8px] w-4 h-4 flex items-center justify-center rounded-full bg-gray-800 shadow-md hover:bg-gray-700 z-20 transition-opacity"
        style={{ opacity: isHovered ? 0.9 : 0.6 }}
        onClick={(e) => {
          e.preventDefault();
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
  card?: any;
}

export default function FoilContainer({ 
  foilTypes, 
  cardId, 
  className = '',
  card
}: FoilContainerProps) {
  const { isAuthenticated } = useAuth();
  const { 
    collections, 
    addCardToCollection, 
    updateCardInCollection, 
    removeCardFromCollection 
  } = useCollection();
  
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [successMessages, setSuccessMessages] = useState<{[key: string]: boolean}>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [cardQuantities, setCardQuantities] = useState<{[key: string]: number}>({});
  
  useEffect(() => {
    if (collections.length === 0 || !cardId) return;
    
    const quantities: {[key: string]: number} = {
      normal: 0,
      holo: 0,
      "reverse holo": 0
    };
    
    collections.forEach(collection => {
      collection.cards.forEach(collectionCard => {
        if (collectionCard.card_id === cardId) {
          if (collectionCard.is_reverse_holo) {
            quantities["reverse holo"] += collectionCard.quantity;
          } else if (collectionCard.is_foil) {
            quantities["holo"] += collectionCard.quantity;
          } else {
            quantities["normal"] += collectionCard.quantity;
          }
        }
      });
    });
    
    setCardQuantities(quantities);
  }, [collections, cardId]);
  
  if (!foilTypes || foilTypes.length === 0) return null;
  
  const getPosition = (index: number): 'first' | 'middle' | 'last' | 'single' => {
    if (foilTypes.length === 1) return 'single';
    if (index === 0) return 'first';
    if (index === foilTypes.length - 1) return 'last';
    return 'middle';
  };
  
  const handleAddToCollection = async (foilType: string) => {
    if (!isAuthenticated) {
      window.location.href = '/signin';
      return;
    }
    
    setErrorMessage('');
    setSuccessMessages(prev => ({ ...prev, [foilType]: false }));
    setLoading(prev => ({ ...prev, [foilType]: true }));
    
    try {
      if (collections.length === 0) {
        setErrorMessage("You don't have any collections yet. Please create one first.");
        setLoading(prev => ({ ...prev, [foilType]: false }));
        return;
      }
      
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
        setCardQuantities(prev => {
          const newQuantities = { ...prev };
          const key = isReverseHolo ? "reverse holo" : (isFoil ? "holo" : "normal");
          newQuantities[key] = (newQuantities[key] || 0) + 1;
          return newQuantities;
        });
        
        toast.success(`Added ${foilType} card to collection!`);
      } else {
        toast.error('Failed to add card to collection.');
      }
    } catch (err) {
      console.error('Error adding card to collection:', err);
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(prev => ({ ...prev, [foilType]: false }));
    }
  };
  
  const handleDecrement = async (type: string) => {
    if (!isAuthenticated) {
      window.location.href = '/signin';
      return;
    }
    
    if (collections.length === 0) {
      toast.error("You don't have any collections yet.");
      return;
    }
    
    const isFoil = type.includes('holo') && !type.includes('reverse');
    const isReverseHolo = type.includes('reverse');
    const foilTypeKey = isReverseHolo ? "reverse holo" : (isFoil ? "holo" : "normal");
    
    if (!cardQuantities[foilTypeKey] || cardQuantities[foilTypeKey] <= 0) {
      toast.error(`No ${type} cards in your collection to remove.`);
      return;
    }
    
    setLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      let cardToUpdate = null;
      let collectionId = null;
      
      for (const collection of collections) {
        const matchingCard = collection.cards.find(card => 
          card.card_id === cardId && 
          card.is_foil === isFoil && 
          card.is_reverse_holo === isReverseHolo
        );
        
        if (matchingCard) {
          cardToUpdate = matchingCard;
          collectionId = collection.id;
          break;
        }
      }
      
      if (!cardToUpdate || !collectionId) {
        toast.error(`Couldn't find this card in your collection.`);
        return;
      }
      
      if (cardToUpdate.quantity === 1) {
        const success = await removeCardFromCollection(collectionId, cardToUpdate.id);
        
        if (success) {
          setCardQuantities(prev => ({
            ...prev,
            [foilTypeKey]: 0
          }));
          toast.success(`Removed ${type} card from collection.`);
        }
      } else {
        const updatedCard = await updateCardInCollection(
          collectionId, 
          cardToUpdate.id, 
          { quantity: cardToUpdate.quantity - 1 }
        );
        
        if (updatedCard) {
          setCardQuantities(prev => ({
            ...prev,
            [foilTypeKey]: Math.max(0, prev[foilTypeKey] - 1)
          }));
          toast.success(`Removed one ${type} card from collection.`);
        }
      }
    } catch (err) {
      console.error('Error removing card from collection:', err);
      toast.error('Failed to remove card.');
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };
  
  return (
    <div 
      className={`flex ${className}`} 
      style={{ gap: '20px', zIndex: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      {foilTypes.map((foilType, index) => {
        const foilTypeKey = foilType.toLowerCase().includes('reverse') 
          ? "reverse holo" 
          : (foilType.toLowerCase().includes('holo') ? "holo" : "normal");
        
        return (
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
              quantity={cardQuantities[foilTypeKey] || 0}
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
        );
      })}
      
      {errorMessage && (
        <div className="absolute top-[-30px] left-0 right-0 bg-red-600/80 text-white text-xs rounded-md px-2 py-1 text-center">
          {errorMessage}
        </div>
      )}
    </div>
  );
}