"use client";

import { useState, useEffect } from "react";
import { PokemonCard } from "@/app/lib/api";
import CardDetails from "./CardDetails";
import CardFoil from "./CardFoil";
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
  
  const gridColsClass = isMobile
    ? "grid-cols-2" 
    : isSidebarOpen
      ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" // With sidebar visible
      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"; // Without sidebar
  
  return (
    <>
      <div className={`grid ${gridColsClass} gap-2 sm:gap-4 w-full`}>
        {cards.map((card) => (
          <div 
            key={card.id}
            className="relative rounded-lg bg-[#252525] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
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
                width={245}  
                height={342}
                className={`w-full h-full object-contain transform transition-transform ${loadedImages[card.id] ? 'opacity-100' : 'opacity-0'}`}
                loading="lazy"
                onLoad={() => handleImageLoad(card.id)}
              />
            </div>
            
            <div className="p-2">
              <div className="flex justify-between items-start">
                <h3 className="text-white font-medium text-xs sm:text-sm truncate w-4/5">{card.name}</h3>
                <span className="text-xs text-gray-400">#{card.number}</span>
              </div>
              
              <div className="mt-1 flex flex-wrap gap-1">
                {/* Card Foil indicator */}
                {card.tcgplayer?.prices && (
                  <>
                    {card.tcgplayer.prices.normal && (
                      <CardFoil foilType="normal" />
                    )}
                    {card.tcgplayer.prices.holofoil && (
                      <CardFoil foilType="holo" />
                    )}
                    {card.tcgplayer.prices.reverseHolofoil && (
                      <CardFoil foilType="reverse holo" />
                    )}
                  </>
                )}
                
                {/* Price indicator */}
                {card.cardmarket?.prices?.trendPrice && (
                  <span 
                    className="text-xs px-1.5 py-0.5 bg-[#8A3F3F] text-white rounded-full"
                    title={`Trend price: $${card.cardmarket.prices.trendPrice.toFixed(2)}`}
                  >
                    ${card.cardmarket.prices.trendPrice.toFixed(2)}
                  </span>
                )}
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