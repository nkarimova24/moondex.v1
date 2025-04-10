"use client";

import { useState, useEffect } from "react";
import { PokemonCard } from "@/app/lib/api/types";
import CardDetails from "./CardDetails";
// import FoilContainer from "./FoilContainer";
import Image from "next/image";

interface CardGridProps {
  cards: PokemonCard[];
  isSidebarOpen?: boolean; 
}

export default function CardGrid({ cards, isSidebarOpen = false }: CardGridProps) {
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 960); 
    };
    
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  const handleCardClick = (card: PokemonCard) => {
    setSelectedCard(card);
  };
  
  const handleCloseDetails = () => {
    setSelectedCard(null);
  };
  
  const handleNavigate = (card: PokemonCard) => {
    setSelectedCard(card);
  };
  
  const handleImageLoad = (cardId: string) => {
    setLoadedImages(prev => ({
      ...prev,
      [cardId]: true
    }));
  };
  
  if (cards.length === 0) {
    return null;
  }
  
  const getRarityColor = (rarity?: string): string => {
    if (!rarity) return "bg-gray-700";
    
    const rarityColors: Record<string, string> = {
      "Common": "bg-gray-700",
      "Uncommon": "bg-emerald-700",
      "Rare": "bg-blue-700",
      "Rare Holo": "bg-indigo-700",
      "Rare Holo EX": "bg-purple-700",
      "Rare Ultra": "bg-amber-700",
      "Rare Rainbow": "bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600",
      "Rare Secret": "bg-gradient-to-r from-amber-600 to-rose-600"
    };
    
    return rarityColors[rarity] || "bg-gray-700";
  };
  
  const gridColsClass = isSidebarOpen
    ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4" 
    : "grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4"; // Without sidebar
  
  return (
    <>
      <div className={`grid ${gridColsClass} gap-2 sm:gap-4 w-full ml-6`}>
        {cards.map((card) => (
          <div 
            key={card.id}
            className="relative rounded-lg bg-[#252525] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleCardClick(card)}
            style={{ width: '220px', height: '370px' }}
          >
            <div className="aspect-[63/88] relative">
              {!loadedImages[card.id] && (
                <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                  <span className="text-gray-600 text-xs">Loading...</span>
                </div>
              )}
              <Image
                src={card.images.small}
                alt={card.name}
                width={180} // Adjust image width
                height={260} // Adjust image height
                className={`w-full h-full object-contain transform transition-transform ${loadedImages[card.id] ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                onLoad={() => handleImageLoad(card.id)}
              />
            </div>
            
            <div className="p-1"> {/* Adjust padding */}
              <div className="flex justify-between items-start">
                <h3 className="text-white font-medium text-xs sm:text-sm truncate w-4/5">{card.name}</h3>
                <span className="text-xs text-gray-400">#{card.number}</span>
              </div>
              
              <div className="mt-3 flex flex-wrap items-center justify-between">
                {/* Price indicator */}
                {card.cardmarket?.prices?.trendPrice && (
                  <span 
                    className="text-xs px-1 py-0.5 bg-[#8A3F3F] text-white rounded-full"
                    title={`Trend price: ${card.cardmarket.prices.trendPrice.toFixed(2)}`}
                  >
                    ${card.cardmarket.prices.trendPrice.toFixed(2)}
                  </span>
                )}
                
                {/* Card Foil indicator */}
                {/* {card.tcgplayer?.prices && (() => {
                  const foilTypes = [];
                  if (card.tcgplayer.prices.normal) foilTypes.push("normal");
                  if (card.tcgplayer.prices.holofoil) foilTypes.push("holo");
                  if (card.tcgplayer.prices.reverseHolofoil) foilTypes.push("reverse holo");
                  
                  return foilTypes.length > 0 ? (
                    <FoilContainer 
                      foilTypes={foilTypes} 
                      cardId={card.id}
                    />
                  ) : null;
                })()} */}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {selectedCard && (
        <CardDetails 
          card={selectedCard} 
          allCards={cards}
          onClose={handleCloseDetails}
          onNavigate={handleNavigate}
        />
      )}
    </>
  );
}