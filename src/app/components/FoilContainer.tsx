import React, { useState, useEffect, useRef } from 'react';
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
  
  if (normalizedType === 'darkgray') {
    // Dark gray style for cards with no price data
    borderColor = 'border-gray-600';
    bgColor = 'bg-gray-700/50';
    hoverBg = 'hover:bg-gray-600/50';
    tooltipText = 'Add to Collection';
  } else if (normalizedType.includes('normal')) {
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
  } else {
    // Default fallback style
    borderColor = 'border-gray-600';
    bgColor = 'bg-gray-600/20';
    hoverBg = 'hover:bg-gray-600/30';
    tooltipText = 'Unknown';
  }

  return (
    <div 
      className="relative inline-flex items-center justify-center"
      style={{ width: '44px', height: '30px' }} 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Minus button - only show when quantity > 0 */}
      {quantity > 0 && (
        <button 
          className="absolute left-[-14px] w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-800/30 z-20 transition-all duration-200"
          style={{ 
            opacity: isHovered ? 1 : 0.7,
            transform: isHovered ? 'scale(1.1)' : 'scale(1)'
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDecrement();
          }}
        >
          <span className="text-white text-xs font-bold">-</span>
        </button>
      )}
      
      {/* Foil indicator box with quantity inside */}
      <div 
        className={`w-7 h-7 border-2 rounded-md ${borderColor} ${bgColor} ${hoverBg} transition-all duration-200 mx-auto relative flex items-center justify-center`}
        style={{ 
          transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 2px 6px rgba(0,0,0,0.15)' : 'none'
        }}
        title={`Foil type: ${tooltipText}${quantity > 0 ? ` (${quantity} in collection)` : ''}`}
      >
        {quantity > 0 ? (
          <span className="text-xs font-semibold text-white">
            {quantity}
          </span>
        ) : (
          <span className="text-xs text-gray-400">0</span>
        )}
      </div>
      
      {/* Plus button */}
      <button 
        className="absolute right-[-14px] w-5 h-5 flex items-center justify-center rounded-full hover:bg-gray-800/30 z-20 transition-all duration-200"
        style={{ 
          opacity: isHovered ? 1 : 0.7,
          transform: isHovered ? 'scale(1.1)' : 'scale(1)'
        }}
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
  listStyle?: boolean;
}

export default function FoilContainer({ 
  foilTypes, 
  cardId, 
  className = '',
  card,
  listStyle = false
}: FoilContainerProps) {
  const { isAuthenticated } = useAuth();
  const { 
    collections, 
    addCardToCollection, 
    updateCardInCollection, 
    removeCardFromCollection,
    createCollection
  } = useCollection();
  
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [cardQuantities, setCardQuantities] = useState<{[key: string]: number}>({});
  
  // Use a ref to track toasts within this component instance
  const toastIdsRef = useRef(new Map());
  // Track counter for each card type
  const cardCountRef = useRef<{[key: string]: number}>({});
  
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
    setLoading(prev => ({ ...prev, [foilType]: true }));
    
    const normalizedType = foilType.toLowerCase();
    let foilTypeKey = "normal";
    let isFoil = false;
    let isReverseHolo = false;
    
    if (normalizedType === 'darkgray') {
      foilTypeKey = "normal";
    } else {
      isFoil = normalizedType.includes('holo') && !normalizedType.includes('reverse');
      isReverseHolo = normalizedType.includes('reverse');
      foilTypeKey = isReverseHolo ? "reverse holo" : (isFoil ? "holo" : "normal");
    }
    
    // Update local card count ref
    if (!cardCountRef.current[foilTypeKey]) {
      cardCountRef.current[foilTypeKey] = 0;
    }
    cardCountRef.current[foilTypeKey]++;
    
    setCardQuantities(prev => {
      const newQuantities = { ...prev };
      newQuantities[foilTypeKey] = (newQuantities[foilTypeKey] || 0) + 1;
      return newQuantities;
    });
    
    const cardName = card?.name || "Card";
    const displayFoilType = normalizedType === 'darkgray' ? 'Normal' : foilType;
    
    // Create a unique key for this card type combination
    const toastKey = `${cardId}-${foilTypeKey}-add`;
    
    // Display the count from our ref
    const count = cardCountRef.current[foilTypeKey];
    
    // Clear previous toast if it exists
    if (toastIdsRef.current.has(toastKey)) {
      toast.dismiss(toastIdsRef.current.get(toastKey));
    }
    
    // Create a new toast with the current count
    const toastId = toast.success(`Added ${cardName} (${displayFoilType}) to collection! (x${count})`, {
      duration: 3000, // Set a consistent duration
    });
    
    // Save the new toast ID
    toastIdsRef.current.set(toastKey, toastId);
    
    try {
      let collectionId: number;
      let isNewCollection = false;
      
      if (collections.length === 0) {
        const newCollection = await createCollection("My Collection", "Your default collection");
        
        if (!newCollection) {
          setCardQuantities(prev => {
            const newQuantities = { ...prev };
            newQuantities[foilTypeKey] = Math.max(0, (newQuantities[foilTypeKey] || 0) - 1);
            return newQuantities;
          });
          // Decrease our count ref
          cardCountRef.current[foilTypeKey]--;
          toast.error("Failed to create a collection. Please try again.");
          return;
        }
        
        collectionId = newCollection.id;
        isNewCollection = true;
      } else {
        collectionId = collections[0].id;
      }
      
      const cardData = {
        card_id: cardId,
        quantity: 1,
        is_foil: isFoil,
        is_reverse_holo: isReverseHolo
      };
      
      const result = await addCardToCollection(collectionId, cardData);
      
      if (!result) {
        setCardQuantities(prev => {
          const newQuantities = { ...prev };
          newQuantities[foilTypeKey] = Math.max(0, (newQuantities[foilTypeKey] || 0) - 1);
          return newQuantities;
        });
        // Decrease our count ref
        cardCountRef.current[foilTypeKey]--;
        toast.error('Failed to add card to collection.');
      } else if (isNewCollection) {
        toast.success('Created "My Collection" and added your first card!');
      }
      
      if (result) {
        const cardUpdatedEvent = new CustomEvent('cardAddedToCollection', { 
          detail: { 
            cardId,
            collectionCardId: result.id,
            collectionId: result.collection_id,
            isFoil,
            isReverseHolo
          } 
        });
        document.dispatchEvent(cardUpdatedEvent);
      }
    } catch (error) {
      console.error('Error adding card to collection:', error);
      
      setCardQuantities(prev => {
        const newQuantities = { ...prev };
        newQuantities[foilTypeKey] = Math.max(0, (newQuantities[foilTypeKey] || 0) - 1);
        return newQuantities;
      });
      
      // Decrease our count ref
      cardCountRef.current[foilTypeKey]--;
      
      // Create a new error toast
      toast.error('Error adding card to collection. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [foilType]: false }));
    }
  };
  
  const handleDecrement = async (type: string) => {
    if (!isAuthenticated) {
      window.location.href = '/signin';
      return;
    }
    
    const normalizedType = type.toLowerCase();
    let foilTypeKey = "normal";
    let isFoil = false;
    let isReverseHolo = false;
    
    if (normalizedType === 'darkgray') {
      foilTypeKey = "normal";
    } else {
      isFoil = normalizedType.includes('holo') && !normalizedType.includes('reverse');
      isReverseHolo = normalizedType.includes('reverse');
      foilTypeKey = isReverseHolo ? "reverse holo" : (isFoil ? "holo" : "normal");
    }
    
    if (!cardQuantities[foilTypeKey] || cardQuantities[foilTypeKey] <= 0) {
      toast.error(`No ${normalizedType === 'darkgray' ? 'normal' : type} cards in your collection to remove.`);
      return;
    }
    
    setLoading(prev => ({ ...prev, [type]: true }));
    
    const previousQuantity = cardQuantities[foilTypeKey];
    
    setCardQuantities(prev => ({
      ...prev,
      [foilTypeKey]: Math.max(0, prev[foilTypeKey] - 1)
    }));
    
    // Update our local count ref
    if (cardCountRef.current[foilTypeKey]) {
      cardCountRef.current[foilTypeKey] = Math.max(0, cardCountRef.current[foilTypeKey] - 1);
    }
    
    const cardName = card?.name || "Card";
    const displayFoilType = normalizedType === 'darkgray' ? 'Normal' : type;
    
    // Create a unique key for this card type combination
    const toastKey = `${cardId}-${foilTypeKey}-remove`;
    
    // Clear previous toast if it exists
    if (toastIdsRef.current.has(toastKey)) {
      toast.dismiss(toastIdsRef.current.get(toastKey));
    }
    
    const remainingQuantity = Math.max(0, previousQuantity - 1);
    
    // Create a new toast with the current quantity info
    let toastId;
    if (remainingQuantity > 0) {
      toastId = toast.success(`Removed ${cardName} (${displayFoilType}) from collection. (${remainingQuantity} remaining)`, {
        duration: 3000,
      });
    } else {
      toastId = toast.success(`Removed last ${cardName} (${displayFoilType}) from collection.`, {
        duration: 3000,
      });
    }
    
    // Save the new toast ID
    toastIdsRef.current.set(toastKey, toastId);
    
    try {
      if (collections.length === 0) {
        setCardQuantities(prev => ({
          ...prev,
          [foilTypeKey]: previousQuantity
        }));
        // Reset our count ref to the previous value
        if (cardCountRef.current[foilTypeKey] !== undefined) {
          cardCountRef.current[foilTypeKey]++;
        }
        toast.error("You don't have any collections yet.");
        return;
      }
      
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
        setCardQuantities(prev => ({
          ...prev,
          [foilTypeKey]: previousQuantity
        }));
        toast.error(`Couldn't find this card in your collection.`);
        return;
      }
      
      let success = false;
      
      if (cardToUpdate.quantity === 1) {
        success = await removeCardFromCollection(collectionId, cardToUpdate.id);
      } else {
        const updatedCard = await updateCardInCollection(
          collectionId, 
          cardToUpdate.id, 
          { quantity: cardToUpdate.quantity - 1 }
        );
        success = !!updatedCard;
      }
      
      if (!success) {
        setCardQuantities(prev => ({
          ...prev,
          [foilTypeKey]: previousQuantity
        }));
        toast.error('Failed to remove card.');
      }
    } catch (err) {
      console.error('Error removing card from collection:', err);
      
      setCardQuantities(prev => ({
        ...prev,
        [foilTypeKey]: previousQuantity
      }));
      
      toast.error('Failed to remove card.');
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };
  
  if (listStyle) {
    return (
      <div className={`${className}`}>
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: "#8A3F3F" }}>Card Variants</h3>
        <div className="rounded-lg p-3 sm:p-4" style={{ backgroundColor: "rgba(40,40,40,0.6)" }}>
          {foilTypes.map((foilType, index) => {
            const normalizedType = foilType.toLowerCase();
            let foilTypeKey = "normal";
            
            if (normalizedType === 'darkgray') {
              foilTypeKey = "normal";
            } else {
              foilTypeKey = normalizedType.includes('reverse') 
                ? "reverse holo" 
                : (normalizedType.includes('holo') ? "holo" : "normal");
            }
            
            const displayName = normalizedType === "darkgray" 
              ? "Variant NaN - Add to Collection" 
              : (foilType === "normal" ? "Normal" 
                : (foilType === "holo" ? "Holo Foil" 
                : (foilType === "reverse holo" ? "Reverse Holo" : foilType)));
            
            let typeColor = "#4e4e4e";
            if (normalizedType === "darkgray") {
              typeColor = "#707070";
            } else if (normalizedType.includes('reverse')) {
              typeColor = "#D32F2F";
            } else if (normalizedType.includes('holo')) {
              typeColor = "#1976D2";
            } else {
              typeColor = "#388E3C";
            }
            
            return (
              <div 
                key={`${cardId}-${foilType}`}
                className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0"
              >
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: typeColor }}
                  ></div>
                  <span className="text-white text-sm">{displayName}</span>
                </div>
                
                <div className="flex items-center">
                  {card?.tcgplayer?.prices?.[foilTypeKey === "normal" ? "normal" : (foilTypeKey === "holo" ? "holofoil" : "reverseHolofoil")] && (
                    <span className="text-xs px-2 py-0.5 rounded-sm mr-4" style={{ backgroundColor: "rgba(138, 63, 63, 0.2)", color: "#7FC99F" }}>
                      ${card.tcgplayer.prices[foilTypeKey === "normal" ? "normal" : (foilTypeKey === "holo" ? "holofoil" : "reverseHolofoil")].market?.toFixed(2) || "—"}
                    </span>
                  )}
                  
                  <div className="flex items-center">
                    <button 
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 mr-1 transition-colors"
                      onClick={() => handleDecrement(foilType)}
                      disabled={!cardQuantities[foilTypeKey] || cardQuantities[foilTypeKey] <= 0}
                      style={{ opacity: (!cardQuantities[foilTypeKey] || cardQuantities[foilTypeKey] <= 0) ? 0.5 : 1 }}
                    >
                      <span className="text-white text-sm font-bold">-</span>
                    </button>
                    
                    <span className="w-8 text-center text-white">{cardQuantities[foilTypeKey] || 0}</span>
                    
                    <button 
                      className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 ml-1 transition-colors"
                      onClick={() => handleAddToCollection(foilType)}
                    >
                      <span className="text-white text-sm font-bold">+</span>
                    </button>
                    
                    {loading[foilType] && (
                      <div className="ml-2 w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`flex ${className}`} 
      style={{ gap: '20px', zIndex: 0, marginLeft: '5px' }}
      onClick={(e) => e.stopPropagation()}
    >
      {foilTypes.map((foilType, index) => {
        const foilTypeKey = foilType.toLowerCase().includes('reverse') 
          ? "reverse holo" 
          : (foilType.toLowerCase().includes('holo') ? "holo" : "normal");
        
        return (
          <div 
            key={`${cardId}-${foilType}`}
            className="relative transition-transform duration-200 hover:scale-105"
            style={{ margin: '0 4px' }}
          >
            <CardFoil 
              foilType={foilType}
              position={getPosition(index)}
              isNeighborHovered={false} 
              onIncrement={() => handleAddToCollection(foilType)}
              onDecrement={() => handleDecrement(foilType)}
              quantity={cardQuantities[foilTypeKey] || 0}
            />
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