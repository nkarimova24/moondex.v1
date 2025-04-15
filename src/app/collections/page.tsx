"use client";

import { useState, useEffect } from "react";
import { useCollection } from "@/context/CollectionContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import CardGrid from "@/app/components/CardGrid";
import { Filter } from "lucide-react";
import { PokemonCard } from "@/app/lib/api/types";

interface CollectionMetadata {
  id: number;
  quantity: number;
  is_foil: boolean;
  is_reverse_holo: boolean;
  collection_id: number;
  variants?: {
    normal?: number;
    holo?: number;
    reverse_holo?: number;
  };
}

interface Attack {
  name: string;
  cost?: string[];
  convertedEnergyCost?: number;
  damage?: string;
  text?: string;
}

interface Ability {
  name: string;
  text: string;
  type: string;
}

interface CollectionPokemonCard extends PokemonCard {
  collection?: {
    id: number;
    quantity: number;
    is_foil: boolean;
    is_reverse_holo: boolean;
    collection_id: number;
    variants?: {
      normal?: number;
      holo?: number;
      reverse_holo?: number;
    };
  };
  attacks?: Attack[];
  abilities?: Ability[];
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
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin");
      return;
    }
    
    if (collections.length > 0) {
      setDefaultCollection(collections[0]);
    }
  }, [isAuthenticated, collections, router]);
  
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
        
        for (const currentCardId of uniqueCardIds) {
          try {
            const response = await fetch(`https://api.pokemontcg.io/v2/cards/${currentCardId}`);
            if (!response.ok) {
              console.warn(`Failed to fetch card ${currentCardId}:`, response.status);
              continue;
            }
            const data = await response.json();
            
            const collectionCards = defaultCollection.cards.filter(
              (card: any) => card.card_id === currentCardId
            );
            
            const variants = {
              normal: 0,
              holo: 0,
              reverse_holo: 0
            };
            
            collectionCards.forEach((collectionCard: any) => {
              if (collectionCard.is_reverse_holo) {
                variants.reverse_holo += collectionCard.quantity;
              } else if (collectionCard.is_foil) {
                variants.holo += collectionCard.quantity;
              } else {
                variants.normal += collectionCard.quantity;
              }
            });
            
            const enrichedCard: CollectionPokemonCard = {
              ...data.data,
              collection: {
                id: collectionCards[0].id,
                quantity: Object.values(variants).reduce((a, b) => a + b, 0),
                is_foil: variants.holo > 0,
                is_reverse_holo: variants.reverse_holo > 0,
                collection_id: defaultCollection.id,
                variants: variants
              }
            };
            
            cardsWithQuantities.push(enrichedCard);
          } catch (cardError) {
            console.error(`Failed to fetch card ${currentCardId}:`, cardError);
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
  }, [defaultCollection?.id]);

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
      {/* <div className="mb-8"> */}
        {/* <h1 className="text-3xl font-bold text-white mb-2">My Collection</h1> */}
        {/* <p className="text-gray-400">
          {isAuthenticated ? 
            `Track and organize your Pokémon card collection.` : 
            `Sign in to track your Pokémon card collection.`}
        </p> */}
      {/* </div> */}
      
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
                        Normal Cards
                      </button>
                      <button 
                        className={`w-full text-left px-4 py-2 text-sm ${filter === 'holo' ? 'bg-[#8A3F3F]/20 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                        onClick={() => handleFilterSelect('holo')}
                      >
                        Holo Cards
                      </button>
                      <button 
                        className={`w-full text-left px-4 py-2 text-sm ${filter === 'reverse_holo' ? 'bg-[#8A3F3F]/20 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                        onClick={() => handleFilterSelect('reverse_holo')}
                      >
                        Reverse Holo Cards
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card Grid */}
          <CardGrid cards={filteredCards} />
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
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setCreateNewCollectionModal(false)}
                    className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 bg-[#8A3F3F] text-white rounded-md hover:bg-[#6E2F2F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? 'Creating...' : 'Create Collection'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setCreateNewCollectionModal(true)}
              className="px-5 py-2.5 bg-[#8A3F3F] text-white rounded-md hover:bg-[#6E2F2F] transition-colors"
            >
              Create Collection
            </button>
          )}
        </div>
      )}
    </div>
  );
}