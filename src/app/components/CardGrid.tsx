"use client";

import { PokemonCard } from "@/app/lib/api";

interface CardGridProps {
  cards: PokemonCard[];
}

export default function CardGrid({ cards }: CardGridProps) {
  const formatPrice = (price?: number) => {
    if (price === undefined || price === 0) return "N/A";
    return `€${price.toFixed(2)}`;
  };

  const getCardPrice = (card: PokemonCard) => {
    if (!card.cardmarket?.prices) return "N/A";
    
    return formatPrice(
      card.cardmarket.prices.trendPrice || 
      card.cardmarket.prices.averageSellPrice || 
      card.cardmarket.prices.lowPrice
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <div 
          key={card.id} 
          className="flex flex-col rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-800"
        >
          <div className="relative">
            <img 
              src={card.images.small} 
              alt={card.name} 
              className="w-full object-contain"
              loading="lazy"
            />
          </div>
          
          <div className="p-2 mt-auto">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium text-gray-200 truncate" title={card.name}>
                {card.name}
              </div>
              <div className="text-sm font-medium text-green-400">
                {getCardPrice(card)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}