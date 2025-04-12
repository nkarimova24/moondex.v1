"use client";

import { useState, useEffect } from "react";
import { useCollection } from "@/context/CollectionContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Filter, Trash2, Check, X } from "lucide-react";
import { getCardPrice } from "@/app/lib/sortUtils";
import { PokemonCard } from "@/app/lib/api/types";

export default function CollectionPage() {
  const { collections, loading, createCollection, removeCardFromCollection } = useCollection();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  
  const [defaultCollection, setDefaultCollection] = useState<any>(null);
  const [pokemonCards, setPokemonCards] = useState<{[key: string]: PokemonCard}>({});
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filter, setFilter] = useState<string | null>(null); // 'normal', 'holo', 'reverse_holo'
  const [loadingCards, setLoadingCards] = useState(true);
  const [createNewCollectionModal, setCreateNewCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get or create the default collection
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }
    
    const createDefaultCollection = async () => {
      try {
        setIsCreating(true);
        // Create a default collection automatically without user input
        const result = await createCollection("My Collection");
        if (result) {
          setDefaultCollection(result);
        } else {
          setError("Failed to create default collection");
        }
      } catch (err) {
        console.error("Error creating default collection:", err);
        setError("Failed to create default collection");
      } finally {
        setIsCreating(false);
      }
    };
    
    if (collections.length > 0) {
      // Use the first collection as the default
      setDefaultCollection(collections[0]);
    } else if (!loading) {
      // Automatically create a default collection
      createDefaultCollection();
    }
  }, [isAuthenticated, collections, loading, router, createCollection]);
  
  // Fetch card details once we have a collection
  useEffect(() => {
    if (!defaultCollection) return;
    
    setLoadingCards(true);
    
    const fetchCardDetails = async () => {
      try {
        const cardIds = defaultCollection.cards.map((card: any) => card.card_id);
        const uniqueCardIds = [...new Set(cardIds)];
        
        if (uniqueCardIds.length === 0) {
          setLoadingCards(false);
          return;
        }
        
        const cardDetails: {[key: string]: PokemonCard} = {};
        
        // In a real app, this would be better implemented as a batch API request
        // or loading from your database directly
        for (const cardId of uniqueCardIds) {
          try {
            const response = await fetch(`https://api.pokemontcg.io/v2/cards/${cardId}`);
            if (!response.ok) {
              console.warn(`Failed to fetch card ${cardId}:`, response.status);
              continue;
            }
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
        setLoadingCards(false);
      }
    };
    
    fetchCardDetails();
  }, [defaultCollection]);
  
  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCollectionName.trim()) {
      setError("Please enter a collection name");
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      const result = await createCollection(newCollectionName);
      
      if (result) {
        setDefaultCollection(result);
        setCreateNewCollectionModal(false);
      } else {
        setError("Failed to create collection");
      }
    } catch (err) {
      console.error("Error creating collection:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  };
  
  // Filter cards based on current filter
  const filteredCards = !defaultCollection ? [] : filter 
    ? defaultCollection.cards.filter((card: any) => {
        if (filter === 'normal') return !card.is_foil && !card.is_reverse_holo;
        if (filter === 'holo') return card.is_foil;
        if (filter === 'reverse_holo') return card.is_reverse_holo;
        return true;
      })
    : defaultCollection.cards;
  
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
    if (!defaultCollection) return;
    
    if (window.confirm('Are you sure you want to remove this card from your collection?')) {
      try {
        await removeCardFromCollection(defaultCollection.id, cardId);
      } catch (err) {
        console.error('Error removing card:', err);
        setError('Failed to remove card from collection');
      }
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-[#8A3F3F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Collection</h1>
        <p className="text-gray-400">
          {isAuthenticated ? 
            `Track and organize your Pokémon card collection.` : 
            `Sign in to track your Pokémon card collection.`}
        </p>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-lg">
          {error}
        </div>
      )}
      
      {!isAuthenticated ? (
        <div className="bg-[#252525] rounded-lg p-8 text-center mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Sign in to view your collection</h2>
          <Link
            href="/signin"
            className="inline-block px-5 py-2.5 bg-[#8A3F3F] text-white rounded-md hover:bg-[#6E2F2F] transition-colors"
          >
            Sign In
          </Link>
        </div>
      ) : isCreating ? (
        <div className="bg-[#252525] rounded-lg p-8 text-center mb-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-[#8A3F3F] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white">Setting up your collection...</p>
          </div>
        </div>
      ) : defaultCollection ? (
        <div className="mb-8">
          {/* Collection Info */}
          <div className="bg-[#252525] rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">My Collection</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {defaultCollection.cards.length} {defaultCollection.cards.length === 1 ? 'card' : 'cards'} in collection
                </p>
              </div>
              
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
            
            {/* Card Grid */}
            {loadingCards ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-10 h-10 border-4 border-[#8A3F3F] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-white mb-4">
                  {filter ? 'No cards match the selected filter' : 'Your collection is empty'}
                </p>
                {filter ? (
                  <button 
                    className="px-4 py-2 bg-[#8A3F3F] text-white rounded-md hover:bg-[#6E2F2F] transition-colors"
                    onClick={() => setFilter(null)}
                  >
                    Clear Filter
                  </button>
                ) : (
                  <p className="text-gray-400">
                    Browse cards and click the + button to add them to your collection
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredCards.map((collectionCard: any) => {
                  const pokemonCard = pokemonCards[collectionCard.card_id];
                  
                  return (
                    <div 
                      key={collectionCard.id}
                      className="bg-[#1E1E1E] rounded-lg overflow-hidden transition-transform hover:translate-y-[-4px] hover:shadow-lg"
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
                            x{collectionCard.quantity}
                          </span>
                        </div>
                        
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          <button
                            className="w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-red-700/80 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCard(collectionCard.id);
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
                            className={`text-[10px] px-1.5 py-0.5 border rounded-sm ${getFoilColor(collectionCard)}`}
                          >
                            {getFoilLabel(collectionCard)}
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
            )}
          </div>
          
          {/* Collection Tips */}
          <div className="bg-[#2A2A2A] p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Collection Tips</h3>
            <ul className="text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>Click the <strong>+</strong> button on any card to add it to your collection</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>Use the filter to view cards by foil type (Normal, Holo, Reverse Holo)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                <span>Click the trash icon to remove cards from your collection</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-[#252525] rounded-lg p-8 text-center mb-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-[#8A3F3F] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white">Setting up your collection...</p>
          </div>
        </div>
      )}
    </div>
  );
}