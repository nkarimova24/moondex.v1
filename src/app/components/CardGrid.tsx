"use client";

import { useState } from "react";
import { PokemonCard } from "@/app/lib/api";
import CardDetails from "./CardDetails";
import Image from "next/image";

interface CardGridProps {
  cards: PokemonCard[];
}

export default function CardGrid({ cards }: CardGridProps) {
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null);
  
  const handleCardClick = (card: PokemonCard) => {
    setSelectedCard(card);
  };
  
  const handleCloseDetails = () => {
    setSelectedCard(null);
  };
  
  const handleNavigate = (card: PokemonCard) => {
    setSelectedCard(card);
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
  
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {cards.map((card) => (
          <div 
            key={card.id}
            className="relative rounded-lg bg-[#252525] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleCardClick(card)}
          >
            <div className="aspect-[63/88] relative">
              <Image
                src={card.images.small}
                alt={card.name}
                width={245}  
                height={342}
                className="w-full h-full object-contain transform transition-transform " //hover:scale-105
                loading="lazy"
              />
            </div>
            
            <div className="p-2">
              <div className="flex justify-between items-start">
                <h3 className="text-white font-medium text-sm truncate w-4/5">{card.name}</h3>
                <span className="text-xs text-gray-400">#{card.number}</span>
              </div>
              
              {card.cardmarket?.prices?.trendPrice && (
                <div className="mt-1">
                  <span 
                    className={`text-xs px-1.5 py-0.5 bg-[#8A3F3F] text-white text-xs px-1.5 py-0.5 rounded-full`}
                    title={`Trend price: $${card.cardmarket.prices.trendPrice.toFixed(2)}`}
                    >
                      ${card.cardmarket.prices.trendPrice.toFixed(2)}
                  </span>
                </div>
              )}
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