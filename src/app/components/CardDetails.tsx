"use client";

import { PokemonCard } from "@/app/lib/api";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

interface CardDetailsProps {
  card: PokemonCard;
  allCards: PokemonCard[];
  onClose: () => void;
  onNavigate: (card: PokemonCard) => void;
}

export default function CardDetails({ card, allCards, onClose, onNavigate }: CardDetailsProps) {
  const currentIndex = allCards.findIndex(c => c.id === card.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allCards.length - 1;

  const goToPrevious = () => {
    if (hasPrevious) {
      onNavigate(allCards[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    if (hasNext) {
      onNavigate(allCards[currentIndex + 1]);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrevious) {
        goToPrevious();
      } else if (e.key === 'ArrowRight' && hasNext) {
        goToNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentIndex, allCards]); 

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const formatPrice = (price?: number) => {
    if (price === undefined || price === 0) return "N/A";
    return `€${price.toFixed(2)}`;
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={handleBackdropClick}
      style={{ left: '240px' }}
    >
      <div className="relative w-full max-w-4xl bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-gray-400 hover:text-white z-10 bg-gray-700 rounded-full"
          aria-label="Close"
        >
          <X size={6} />
        </button>

        {/* Navigation buttons */}
        {hasPrevious && (
          <button 
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white z-10 bg-gray-700 rounded-full opacity-80 hover:opacity-100"
            aria-label="Previous card"
          >
            <ChevronLeft size={24} />
          </button>
        )}
        
        {hasNext && (
          <button 
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-white z-10 bg-gray-700 rounded-full opacity-80 hover:opacity-100"
            aria-label="Next card"
          >
            <ChevronRight size={24} />
          </button>
        )}

        <div className="flex flex-col md:flex-row">
          {/* Card image */}
          <div className="w-full md:w-2/5 p-4 flex items-center justify-center bg-gray-900">
            <img 
              src={card.images.large || card.images.small} 
              alt={card.name}
              className="max-h-[70vh] object-contain"
            />
          </div>

          {/* Card details */}
          <div className="w-full md:w-3/5 p-6 overflow-y-auto max-h-[80vh]">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white">
                {card.name}
            </h2>
            <span className="text-gray-400 text-lg ml-2">
                #{card.number}
                {card.set && (
                  <span className="text-gray-500 text-sm ml-1">{card.set.name}</span> 
                )}
            </span>
            </div>
                        
            {/* Card type & Number */}
            <div className="flex justify-between mb-4">
              <div className="text-gray-300">
                {card.supertype} {card.subtypes?.join(", ")}
        
              </div>
           
            </div>
            
            {/* HP & Types if Pokemon */}
            {card.supertype === "Pokémon" && (
              <div className="mb-4">
                {card.hp && <div className="text-gray-300">HP: {card.hp}</div>}
                {card.types && card.types.length > 0 && (
                  <div className="flex gap-2 mt-1">
                    <span className="text-gray-400">Types:</span>
                    <div className="flex gap-2">
                      {card.types.map(type => (
                        <span key={type} className="text-white">{type}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Evolution line if available */}
            {(card.evolvesFrom || (card.evolvesTo && card.evolvesTo.length > 0)) && (
              <div className="mb-4 p-3 bg-gray-700 rounded-md">
                <h3 className="text-lg font-semibold text-white mb-1">Evolution</h3>
                {card.evolvesFrom && (
                  <div className="flex gap-2">
                    <span className="text-gray-400">Evolves From:</span>
                    <span className="text-white">{card.evolvesFrom}</span>
                  </div>
                )}
                {card.evolvesTo && card.evolvesTo.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-gray-400">Evolves To:</span>
                    <span className="text-white">{card.evolvesTo.join(", ")}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Abilities if any */}
            {card.abilities && card.abilities.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-1">Abilities</h3>
                {card.abilities.map((ability, index) => (
                  <div key={index} className="mb-2 p-3 bg-gray-700 rounded-md">
                    <div className="flex justify-between">
                      <span className="font-medium text-white">{ability.name}</span>
                      <span className="text-sm text-gray-400">{ability.type}</span>
                    </div>
                    <p className="text-gray-300 mt-1">{ability.text}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Card market prices */}
            {card.cardmarket?.prices && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Market Prices</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {card.cardmarket.prices.trendPrice !== undefined && (
                    <>
                      <div className="text-gray-400">Trend Price:</div>
                      <div className="text-green-400 font-medium">
                        {formatPrice(card.cardmarket.prices.trendPrice)}
                      </div>
                    </>
                  )}
                  
                  {card.cardmarket.prices.averageSellPrice !== undefined && (
                    <>
                      <div className="text-gray-400">Average Sell Price:</div>
                      <div className="text-green-400">
                        {formatPrice(card.cardmarket.prices.averageSellPrice)}
                      </div>
                    </>
                  )}
                  
                  {card.cardmarket.prices.lowPrice !== undefined && (
                    <>
                      <div className="text-gray-400">Low Price:</div>
                      <div className="text-green-400">
                        {formatPrice(card.cardmarket.prices.lowPrice)}
                      </div>
                    </>
                  )}
                  
                  {card.cardmarket.prices.reverseHoloTrend !== undefined && 
                   card.cardmarket.prices.reverseHoloTrend > 0 && (
                    <>
                      <div className="text-gray-400">Reverse Holo Trend:</div>
                      <div className="text-green-400">
                        {formatPrice(card.cardmarket.prices.reverseHoloTrend)}
                      </div>
                    </>
                  )}
                </div>
                
                {card.cardmarket.updatedAt && (
                  <div className="text-xs text-gray-500 mt-2">
                    Prices updated: {new Date(card.cardmarket.updatedAt).toLocaleDateString()}
                  </div>
                )}
                
                {card.cardmarket.url && (
                  <a 
                    href={card.cardmarket.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm text-blue-400 hover:text-blue-300"
                  >
                    View on CardMarket
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}