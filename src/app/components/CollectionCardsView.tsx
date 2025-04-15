"use client";

import { useState, useEffect } from "react";
import { useCollection } from "@/context/CollectionContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import CardGrid from "@/app/components/CardGrid";
import { Filter } from "lucide-react";
import { PokemonCard } from "@/app/lib/api/types";

// Extended type for cards with collection information
interface CollectionPokemonCard extends PokemonCard {
  collection?: {
    id: number;
    quantity: number;
    is_foil: boolean;
    is_reverse_holo: boolean;
    collection_id: number;
  };
  attacks?: {
    name: string;
    cost?: string[];
    convertedEnergyCost?: number;
    damage?: string;
    text?: string;
  }[];
  abilities?: {
    name: string;
    text: string;
    type: string;
  }[];
}

export default function CollectionPage() {
  const { collections, loading, createCollection } = useCollection();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [defaultCollection, setDefaultCollection] = useState<any>(null);
  const [pokemonCards, setPokemonCards] = useState<CollectionPokemonCard[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const [loadingCards, setLoadingCards] = useState(true);
  const [createNewCollectionModal, setCreateNewCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get the default collection
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }
    
    if (collections.length > 0) {
      // Use the first collection as the default
      setDefaultCollection(collections[0]);
    }
  }, [isAuthenticated, collections, router]);
  
  // Fetch card details once we have a collection
  useEffect(() => {
    if (!defaultCollection) return;
    
    setLoadingCards(true);
    
    const fetchCardDetails = async () => {
      try {
        const cardIds = defaultCollection.cards.map((card: any) => card.card_id);
        const uniqueCardIds = [...new Set(cardIds)];
        
        if (uniqueCardIds.length === 0) {
          setPokemonCards([]);
          setLoadingCards(false);
          return;
        }
        
        const cardsWithQuantities: CollectionPokemonCard[] = [];
        
        // Fetch each card's details and add collection information
        for (const cardId of uniqueCardIds) {
          try {
            const response = await fetch(`https://api.pokemontcg.io/v2/cards/${cardId}`);
            if (!response.ok) {
              console.warn(`Failed to fetch card ${cardId}:`, response.status);
              continue;
            }
            const data = await response.json();
            
            // Find all instances of this card in the collection
            const collectionCards = defaultCollection.cards.filter(
              (card: any) => card.card_id === cardId
            );
            
            // For each variant (normal, holo, reverse holo), create a card instance
            collectionCards.forEach((collectionCard: any) => {
              // Clone the card data
              const enrichedCard: CollectionPokemonCard = {
                ...data.data,
                // Add collection metadata
                collection: {
                  id: collectionCard.id,
                  quantity: collectionCard.quantity,
                  is_foil: collectionCard.is_foil,
                  is_reverse_holo: collectionCard.is_reverse_holo,
                  collection_id: defaultCollection.id
                }
              };
              
              cardsWithQuantities.push(enrichedCard);
            });
          } catch (cardError) {
            console.error(`Failed to fetch card ${cardId}:`, cardError);
          }
        }
        
        setPokemonCards(cardsWithQuantities);
      } catch (err) {
        console.error('Error fetching card details:', err);
        setError('Failed to load card details');
      } finally {
        setLoadingCards(false);
      }
    };
    
    fetchCardDetails();
  }, [defaultCollection]);

  // Handle creating a new collection
  const handleCreateCollection = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
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
        setNewCollectionName("");
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
  
  // Apply filters to cards if needed
  const filteredCards = filter 
    ? pokemonCards.filter(card => {
        if (!card.collection) return false;
        if (filter === 'normal') return !card.collection.is_foil && !card.collection.is_reverse_holo;
        if (filter === 'holo') return card.collection.is_foil;
        if (filter === 'reverse_holo') return card.collection.is_reverse_holo;
        return true;
      })
    : pokemonCards;
  
  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };
  
  const handleFilterSelect = (filterType: string | null) => {
    setFilter(filterType);
    setShowFilterMenu(false);
  };
  
  if (loading || loadingCards) {
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
          <a
            href="/signin"
            className="inline-block px-5 py-2.5 bg-[#8A3F3F] text-white rounded-md hover:bg-[#6E2F2F] transition-colors"
          >
            Sign In
          </a>
        </div>
      ) : defaultCollection ? (
        <div className="mb-8">
          {/* Collection Info */}
          <div className="bg-[#252525] rounded-lg p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-white">{defaultCollection.name}</h2>
                <p className="text-gray-400 text-sm mt-1">
                  {pokemonCards.length} {pokemonCards.length === 1 ? 'card' : 'cards'} in collection
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
            {pokemonCards.length === 0 ? (
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
              <CardGrid cards={filteredCards} />
            )}
          </div>
          
          {/* Collection Tips */}
          <div className="bg-[#2A2A2A] p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Collection Tips</h3>
            <ul className="text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Click the <strong>+</strong> button on any card to add it to your collection</span>
              </li>
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Use the filter to view cards by foil type (Normal, Holo, Reverse Holo)</span>
              </li>
              <li className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Click the trash icon to remove cards from your collection</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="bg-[#252525] rounded-lg p-8 text-center mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">No collections found</h2>
          <p className="text-gray-400 mb-6">
            You don't have any collections yet. Create your first collection to start tracking your cards.
          </p>
          
          {createNewCollectionModal ? (
            <div className="max-w-md mx-auto">
              <form onSubmit={handleCreateCollection} className="space-y-4">
                <div className="text-left">
                  <label htmlFor="collectionName" className="block text-sm font-medium text-gray-300 mb-1">
                    Collection Name
                  </label>
                  <input
                    type="text"
                    id="collectionName"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1A1A1A] border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3F3F] text-white"
                    placeholder="My Pokemon Collection"
                    autoFocus
                  />
                </div>
                
                <div className="flex gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => setCreateNewCollectionModal(false)}
                    className="px-4 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#8A3F3F] text-white rounded-md hover:bg-[#6E2F2F] transition-colors flex items-center gap-2"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      'Create Collection'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button 
              className="px-5 py-2.5 bg-[#8A3F3F] text-white rounded-md hover:bg-[#6E2F2F] transition-colors"
              onClick={() => setCreateNewCollectionModal(true)}
            >
              Create Collection
            </button>
          )}
        </div>
      )}
    </div>
  );
}