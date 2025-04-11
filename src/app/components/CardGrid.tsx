"use client";

import { useState, useEffect } from "react";
import { PokemonCard } from "@/app/lib/api/types";
import CardDetails from "./CardDetails";
// import FoilContainer from "./FoilContainer";
import Image from "next/image";

interface CardGridProps {
  cards: PokemonCard[];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isSidebarOpen?: boolean; 
}

export default function CardGrid({ cards }: CardGridProps) {
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); 
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
  
  const gridColsClass = "grid-cols-2 md:grid-cols-4";
  
  return (
    <>
      <div className={`grid ${gridColsClass} gap-x-3 sm:gap-x-4 gap-y-8 sm:gap-y-10 w-full`}>
        {cards.map((card) => (
          <div 
            key={card.id}
            //bg-[#252525]
            className="relative rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer max-w-[220px] mx-auto"
            onClick={() => handleCardClick(card)}
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
                width={180}
                height={251}
                className={`w-full h-full object-contain transform transition-transform ${loadedImages[card.id] ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                onLoad={() => handleImageLoad(card.id)}
              />
            </div>
            
            <div className="p-1.5">
              <div className="flex justify-between items-start">
                <h3 className="text-white font-medium text-xs truncate w-4/5">{card.name}</h3>
                <span className="text-xs text-gray-400">#{card.number}</span>
              </div>
              
              <div className="mt-2 flex flex-wrap items-center justify-between">
                {/* Price indicator */}
                {card.cardmarket?.prices?.trendPrice && (
                  <span 
                    className="text-xs px-1.5 py-0.5 bg-[#8A3F3F] text-white rounded-full"
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