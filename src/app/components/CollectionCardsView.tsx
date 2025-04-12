"use client";

import React, { useState, useEffect } from 'react';
import { useCollection } from '@/context/CollectionContext';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import { getCardPrice } from '@/app/lib/sortUtils';
import { PokemonCard } from '@/app/lib/api/types';
import { Filter, Trash2, Check, X } from 'lucide-react';

interface CollectionCardsViewProps {
  collectionId: number;
}

export default function CollectionCardsView({ collectionId }: CollectionCardsViewProps) {
  const { collections, removeCardFromCollection } = useCollection();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collectionCards, setCollectionCards] = useState<any[]>([]);
  const [pokemonCards, setPokemonCards] = useState<{[key: string]: PokemonCard}>({});
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filter, setFilter] = useState<string | null>(null); // 'normal', 'holo', 'reverse_holo'
  
  useEffect(() => {
    setLoading(true);
    
    // Get collection data from context
    const collection = collections.find(c => c.id === collectionId);
    
    if (!collection) {
      setError('Collection not found');
      setLoading(false);
      return;
    }
    
    setCollectionCards(collection.cards);
    
    // Fetch card details from Pokemon API
    const fetchCards = async () => {
      try {
        const cardIds = collection.cards.map(card => card.card_id);
        const uniqueCardIds = [...new Set(cardIds)];
        
        const cardDetails: {[key: string]: PokemonCard} = {};
        
        // In a real app, this would be better implemented as a batch API request
        // For this example, we're just mocking the data
        for (const cardId of uniqueCardIds) {
          try {
            const response = await fetch(`https://api.pokemontcg.io/v2/cards/${cardId}`);
            const data = await response.json();
            cardDetails[cardId] = data.data;
          } catch (cardError) {
            console.error(`Failed to fetch card ${cardId}:`, cardError);
            // Continue with other cards even if one fails
          }
        }
        
        setPokemonCards(cardDetails);
      } catch (err) {
        console.error('Error fetching card details:', err);
        setError('Failed to load card details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCards();
  }, [collections, collectionId]);
  
  // Filter cards based on current filter
  const filteredCards = filter 
    ? collectionCards.filter(card => {
        if (filter === 'normal') return !card.is_foil && !card.is_reverse_holo;
        if (filter === 'holo') return card.is_foil;
        if (filter === 'reverse_holo') return card.is_reverse_holo;
        return true;
      })
    : collectionCards;
  
  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };
  
  const handleFilterSelect = (filterType: string | null) => {
    setFilter(filterType);
    setShowFilterMenu(false);
  };
  
  const getFoilLabel = (card: any) => {
    if (card.is_reverse_holo) return 'Reverse Holo';
    if (card.is_foil) return 'Holo';
    return 'Normal';
  };
  
  const getFoilColor = (card: any) => {
    if (card.is_reverse_holo) return 'text-red-600 border-red-600';
    if (card.is_foil) return 'text-blue-600 border-blue-600';
    return 'text-green-600 border-green-600';
  };
  
  const handleRemoveCard = async (cardId: number) => {
    if (window.confirm('Are you sure you want to remove this card from your collection?')) {
      try {
        await removeCardFromCollection(collectionId, cardId);
      } catch (err) {
        console.error('Error removing card:', err);
        setError('Failed to remove card from collection');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center my-8">
        <div className="w-8 h-8 border-4 border-[#8A3F3F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="my-8 p-6 bg-[#2A2A2A] rounded-lg">
        <p className="text-red-400 text-center">{error}</p>
      </div>
    );
  }
  
  if (filteredCards.length === 0) {
    return (
      <div className="my-8 p-8 bg-[#2A2A2A] rounded-lg text-center">
        <h3 className="text-xl font-semibold text-white mb-3">
          {filter ? 'No cards match the selected filter' : 'No cards in this collection yet'}
        </h3>
        {filter ? (
          <button 
            className="mt-4 px-4 py-2 border border-[#8A3F3F] text-[#8A3F3F] rounded hover:bg-[#8A3F3F]/10 transition-colors"
            onClick={() => setFilter(null)}
          >
            Clear Filter
          </button>
        ) : (
          <p className="text-gray-400 text-sm">
            Browse the card database and click the + button to add cards to your collection
          </p>
        )}
      </div>
    );
  }
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">
          {filteredCards.length} {filteredCards.length === 1 ? 'Card' : 'Cards'} in Collection
        </h3>
        
        <div className="relative">
          <button
            className={`flex items-center gap-1 px-3 py-1.5 rounded text-sm transition-colors ${
              filter 
                ? "bg-[#8A3F3F]/30 text-white border border-[#8A3F3F]/50" 
                : "bg-transparent text-gray-300 border border-gray-700 hover:border-gray-500"
            }`}
            onClick={toggleFilterMenu}
          >
            <Filter size={16} />
            <span>Filter {filter && '(1)'}</span>
          </button>
          
          {showFilterMenu && (
            <div className="absolute right-0 mt-1 w-48 rounded-md shadow-lg bg-[#2A2A2A] z-50 overflow-hidden">
              <div className="py-1">
                <button 
                  className={`w-full text-left px-4 py-2 text-sm ${filter === null ? 'bg-[#8A3F3F]/20 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                  onClick={() => handleFilterSelect(null)}
                >
                  All Cards
                </button>
                <button 
                  className={`w-full text-left px-4 py-2 text-sm ${filter === 'normal' ? 'bg-[#8A3F3F]/20 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                  onClick={() => handleFilterSelect('normal')}
                >
                  Normal
                </button>
                <button 
                  className={`w-full text-left px-4 py-2 text-sm ${filter === 'holo' ? 'bg-[#8A3F3F]/20 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                  onClick={() => handleFilterSelect('holo')}
                >
                  Holo
                </button>
                <button 
                  className={`w-full text-left px-4 py-2 text-sm ${filter === 'reverse_holo' ? 'bg-[#8A3F3F]/20 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                  onClick={() => handleFilterSelect('reverse_holo')}
                >
                  Reverse Holo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredCards.map(card => {
          const pokemonCard = pokemonCards[card.card_id];
          
          return (
            <div 
              key={card.id}
              className="bg-[#252525] rounded-lg overflow-hidden transition-transform hover:translate-y-[-4px] hover:shadow-lg"
            >
              <div className="relative">
                {pokemonCard ? (
                  <Image
                    src={pokemonCard.images.small}
                    alt={pokemonCard.name}
                    width={180}
                    height={250}
                    className="w-full h-auto"
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center bg-[#1E1E1E]">
                    <p className="text-gray-500">Loading card...</p>
                  </div>
                )}
                
                <div className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-0.5">
                  <span className="text-xs text-white">
                    x{card.quantity}
                  </span>
                </div>
                
                <div className="absolute bottom-2 right-2 flex gap-1">
                  <button
                    className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-700/80 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCard(card.id);
                    }}
                    title="Remove from collection"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              <div className="p-2">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-white text-sm font-medium truncate w-2/3">
                    {pokemonCard?.name || 'Loading...'}
                  </p>
                  
                  {pokemonCard?.number && (
                    <span className="text-xs text-gray-400">
                      #{pokemonCard.number}
                    </span>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <span 
                    className={`text-[10px] px-1.5 py-0.5 border rounded-sm ${getFoilColor(card)}`}
                  >
                    {getFoilLabel(card)}
                  </span>
                  
                  {pokemonCard && (
                    <span className="text-xs text-[#7FC99F]">
                      ${getCardPrice(pokemonCard).toFixed(2)}
                    </span>
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