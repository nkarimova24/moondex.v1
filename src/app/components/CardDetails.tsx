"use client";

import { useCallback, useEffect, useState } from "react";
import { PokemonCard } from "@/app/lib/api";
import { X, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import Image from "next/image";

interface CardDetailsProps {
  card: PokemonCard;
  allCards: PokemonCard[];
  onClose: () => void;
  onNavigate: (card: PokemonCard) => void;
}

export default function CardDetails({ card, allCards, onClose, onNavigate }: CardDetailsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const currentIndex = allCards.findIndex(c => c.id === card.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allCards.length - 1;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const goToPrevious = useCallback(() => {
    if (hasPrevious) {
      onNavigate(allCards[currentIndex - 1]);
    }
  }, [hasPrevious, onNavigate, allCards, currentIndex]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      onNavigate(allCards[currentIndex + 1]);
    }
  }, [hasNext, onNavigate, allCards, currentIndex]);

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
  }, [goToPrevious, goToNext, hasPrevious, hasNext, onClose]);

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const formatPrice = (price?: number) => {
    if (price === undefined || price === 0) return "N/A";
    return `$${price.toFixed(2)}`;
  };

  const getTypeColor = (type?: string) => {
    if (!type) return "#8A3F3F";
    
    const typeColors: Record<string, string> = {
      "Fire": "#FF8A65",
      "Water": "#4FC3F7",
      "Grass": "#81C784",
      "Electric": "#FFD54F",
      "Lightning": "#FFD54F",
      "Psychic": "#BA68C8",
      "Fighting": "#A1887F",
      "Darkness": "#78909C",
      "Metal": "#B0BEC5",
      "Fairy": "#F8BBD0",
      "Dragon": "#7986CB",
      "Colorless": "#E0E0E0"
    };
    
    return typeColors[type] || "#8A3F3F";
  };

  const getRarityColor = (rarity?: string): string => {
    if (!rarity) return "#4e4e4e";
    
    const rarityColors: Record<string, string> = {
      "Common": "#4e4e4e",
      "Uncommon": "#2e7d32",
      "Rare": "#1565c0",
      "Rare Holo": "#4527a0",
      "Rare Holo EX": "#6a1b9a",
      "Rare Ultra": "#ff8f00",
      "Rare Rainbow": "linear-gradient(to right, #ec407a, #673ab7, #3949ab)",
      "Rare Secret": "linear-gradient(to right, #ff9800, #f44336)"
    };
    
    return rarityColors[rarity] || "#4e4e4e";
  };

  const primaryTypeColor = card.types && card.types.length > 0 
    ? getTypeColor(card.types[0]) 
    : "#8A3F3F";

  const toggleFavorite = () => setIsFavorite(!isFavorite);

  const getRarityStyle = (rarity?: string) => {
    const colorValue = getRarityColor(rarity || "");
    
    if (colorValue.startsWith("linear-gradient")) {
      return { backgroundImage: colorValue, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" };
    }
    
    return { backgroundColor: colorValue, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" };
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ left: isMobile ? 0 : '240px' }}
    >
      <div 
        className="relative w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden"
        style={{ 
          background: "linear-gradient(to bottom, #2D2D2D, #1A1A1A)",
          maxHeight: "90vh" 
        }}
      >
        {/* Top bar */}
        <div className="flex justify-between items-center px-2 sm:px-4 py-2 sm:py-3" 
          style={{ 
            background: `linear-gradient(to right, #8A3F3F, ${primaryTypeColor})`,
            borderBottom: "1px solid rgba(255,255,255,0.1)" 
          }}>
          <div className="flex items-center">
            <span className="text-white font-bold text-sm sm:text-base">#{card.number}</span>
            {card.set && (
              <span className="text-white/70 ml-2 text-xs sm:text-sm hidden sm:inline">{card.set.name}</span>
            )}
          </div>
          
          <div className="text-base sm:text-xl text-white font-bold truncate max-w-[150px] sm:max-w-none">{card.name}</div>
          
          <div className="flex gap-1 sm:gap-3">
            <button
              onClick={toggleFavorite}
              className="p-1 sm:p-1.5 text-white/90 hover:text-white transition-colors"
              aria-label="Favorite"
            >
              <Heart size={isMobile ? 16 : 20} fill={isFavorite ? "white" : "none"} />
            </button>
            <button 
              onClick={onClose}
              className="p-1 sm:p-1.5 text-white/90 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X size={isMobile ? 16 : 20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row max-h-[calc(90vh-120px)]">
          {/* Card image */}
          <div 
            className="w-full md:w-2/5 p-3 sm:p-6 flex items-center justify-center"
            style={{ 
              background: `radial-gradient(circle, ${primaryTypeColor}30 0%, #1A1A1A 100%)`,
            }}
          >
            <div className="relative">
              <Image
                src={card.images.large || card.images.small}
                alt={card.name}
                width={400}
                height={560}
                className="max-h-[30vh] sm:max-h-[40vh] md:max-h-[55vh] object-contain drop-shadow-xl transform transition-transform duration-300 hover:scale-105"
                priority
              />
            </div>
          </div>

          {/* Card details */}
          <div className="w-full md:w-3/5 p-3 sm:p-6 overflow-y-auto" style={{ color: "#E0E0E0" }}>
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <div 
                className="py-1 px-2 sm:px-3 rounded-md inline-block text-xs sm:text-sm"
                style={{ 
                  background: `linear-gradient(to right, ${primaryTypeColor}, ${primaryTypeColor}80)`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.2)" 
                }}
              >
                <span className="text-white font-medium">
                  {card.supertype} {card.subtypes?.join(", ")}
                </span>
              </div>
              
              {/* Fixed rarity display */}
              {card.rarity && (
                <div 
                  className="py-1 px-2 sm:px-3 rounded-md text-xs sm:text-sm"
                  style={getRarityStyle(card.rarity)}
                >
                  <span className="text-white font-medium">
                    {card.rarity}
                  </span>
                </div>
              )}
            </div>
            
            {/* HP & Types */}
            {card.supertype === "Pokémon" && (
              <div className="mb-3 sm:mb-5 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: "rgba(40,40,40,0.6)" }}>
                {card.hp && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm sm:text-base">HP</span>
                    <span className="text-lg sm:text-xl font-bold" style={{ color: "#8A3F3F" }}>{card.hp}</span>
                  </div>
                )}
                {card.types && card.types.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm sm:text-base">Types</span>
                    <div className="flex gap-1 sm:gap-2">
                      {card.types.map(type => (
                        <span 
                          key={type} 
                          className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-white font-medium text-xs sm:text-sm"
                          style={{ backgroundColor: getTypeColor(type) }}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Evolution line */}
            {(card.evolvesFrom || (card.evolvesTo && card.evolvesTo.length > 0)) && (
              <div 
                className="mb-3 sm:mb-5 p-3 sm:p-4 rounded-lg" 
                style={{ 
                  background: "rgba(138, 63, 63, 0.15)",
                  border: "1px solid rgba(138, 63, 63, 0.3)" 
                }}
              >
                <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ color: "#8A3F3F" }}>Evolution Chain</h3>
                {card.evolvesFrom && (
                  <div className="flex gap-2 items-center mb-1">
                    <span className="text-gray-400 text-xs sm:text-sm">Evolves From:</span>
                    <span className="text-white font-medium text-xs sm:text-sm">{card.evolvesFrom}</span>
                  </div>
                )}
                {card.evolvesTo && card.evolvesTo.length > 0 && (
                  <div className="flex gap-2 items-center">
                    <span className="text-gray-400 text-xs sm:text-sm">Evolves To:</span>
                    <span className="text-white font-medium text-xs sm:text-sm">{card.evolvesTo.join(", ")}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Abilities */}
            {card.abilities && card.abilities.length > 0 && (
              <div className="mb-3 sm:mb-5">
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: "#8A3F3F" }}>Abilities</h3>
                {card.abilities.map((ability, index) => (
                  <div 
                    key={index} 
                    className="mb-2 sm:mb-3 p-3 sm:p-4 rounded-lg" 
                    style={{ 
                      background: "linear-gradient(to right, rgba(40,40,40,0.8), rgba(30,30,30,0.8))",
                      borderLeft: `4px solid ${primaryTypeColor}` 
                    }}
                  >
                    <div className="flex justify-between items-center mb-1 sm:mb-2">
                      <span className="font-medium text-white text-base sm:text-lg">{ability.name}</span>
                      <span 
                        className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded" 
                        style={{ 
                          backgroundColor: "rgba(138, 63, 63, 0.2)", 
                          color: "#8A3F3F" 
                        }}
                      >
                        {ability.type}
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm">{ability.text}</p>
                  </div>
                ))}
              </div>
            )}
            
            {/* Card market prices */}
            {card.cardmarket?.prices && (
              <div className="mb-3 sm:mb-4">
                <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: "#8A3F3F" }}>Market Prices</h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg text-xs sm:text-sm" style={{ backgroundColor: "rgba(40,40,40,0.6)" }}>
                  {card.cardmarket.prices.trendPrice !== undefined && (
                    <>
                      <div className="text-gray-300">Trend Price:</div>
                      <div className="text-right font-medium" style={{ color: "#7FC99F" }}>
                        {formatPrice(card.cardmarket.prices.trendPrice)}
                      </div>
                    </>
                  )}
                  
                  {card.cardmarket.prices.averageSellPrice !== undefined && (
                    <>
                      <div className="text-gray-300">Average Sell Price:</div>
                      <div className="text-right font-medium" style={{ color: "#7FC99F" }}>
                        {formatPrice(card.cardmarket.prices.averageSellPrice)}
                      </div>
                    </>
                  )}
                  
                  {card.cardmarket.prices.lowPrice !== undefined && (
                    <>
                      <div className="text-gray-300">Low Price:</div>
                      <div className="text-right font-medium" style={{ color: "#7FC99F" }}>
                        {formatPrice(card.cardmarket.prices.lowPrice)}
                      </div>
                    </>
                  )}
                  
                  {card.cardmarket.prices.reverseHoloTrend !== undefined && 
                   card.cardmarket.prices.reverseHoloTrend > 0 && (
                    <>
                      <div className="text-gray-300">Reverse Holo Trend:</div>
                      <div className="text-right font-medium" style={{ color: "#7FC99F" }}>
                        {formatPrice(card.cardmarket.prices.reverseHoloTrend)}
                      </div>
                    </>
                  )}
                </div>
                
                {card.cardmarket.updatedAt && (
                  <div className="text-xs text-gray-500 mt-1 sm:mt-2 text-right">
                    Prices updated: {new Date(card.cardmarket.updatedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom navigation bar */}
        <div className="flex items-center justify-between p-2 sm:p-4 border-t border-gray-800 bg-black/40">
          <button 
            onClick={goToPrevious}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded transition-all duration-200 text-xs sm:text-sm ${hasPrevious ? 'text-white hover:bg-gray-800' : 'text-gray-600 cursor-not-allowed'}`}
            disabled={!hasPrevious}
            aria-label="Previous card"
          >
            <ChevronLeft size={isMobile ? 16 : 20} />
            <span className="hidden sm:inline">Previous</span>
          </button>
          
          <div className="text-xs sm:text-sm text-gray-400">
            {currentIndex + 1} of {allCards.length}
          </div>
          
          <button 
            onClick={goToNext}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 rounded transition-all duration-200 text-xs sm:text-sm ${hasNext ? 'text-white hover:bg-gray-800' : 'text-gray-600 cursor-not-allowed'}`}
            disabled={!hasNext}
            aria-label="Next card"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={isMobile ? 16 : 20} />
          </button>
        </div>
      </div>
    </div>
  );
}