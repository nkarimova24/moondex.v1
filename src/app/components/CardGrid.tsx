"use client";

import { PokemonCard } from "@/app/lib/api";

interface CardGridProps {
  cards: PokemonCard[];
}

export default function CardGrid({ cards }: CardGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
      {cards.map((card) => (
        <div key={card.id} className="flex flex-col items-center rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
          <img 
            src={card.images.small} 
            alt={card.name} 
            className="w-full object-contain"
            loading="lazy"
          />
          <p className="text-center py-2 px-1 text-sm font-medium truncate w-full">
            {card.name}
          </p>
        </div>
      ))}
    </div>
  );
}