"use client";

import { useCallback, useEffect, useState } from "react";
import { useCollection } from "@/context/CollectionContext";
import { PokemonCard } from "@/app/lib/api";
import { X, ChevronLeft, ChevronRight, Heart, FileText, Info, Edit2, Trash2, Plus } from "lucide-react";
import Image from "next/image";
import FoilContainer from "./FoilContainer";
import toast from "react-hot-toast";
import { authApiClient } from '../lib/api/client';
import { createCardNote, getCardNotes, updateNote as updateNoteApi, deleteNote as deleteNoteApi } from '../lib/api/notes';
import { useAuth } from "@/context/AuthContext";

interface Attack {
  name: string;
  cost?: string[];
  convertedEnergyCost?: number;
  damage?: string;
  text?: string;
}

interface ExtendedPokemonCard extends PokemonCard {
  attacks?: Attack[];
}

interface CollectionPokemonCard extends PokemonCard {
  collection?: {
    id: number;
    quantity: number;
    is_foil: boolean;
    is_reverse_holo: boolean;
    collection_id: number;
    variants: Record<string, number>;
    notes?: string;
  };
  attacks?: Attack[];
  abilities?: {
    name: string;
    text: string;
    type: string;
  }[];
  notes?: string;
}

interface CardDetailsProps {
  card: CollectionPokemonCard;
  allCards: CollectionPokemonCard[];
  onClose: () => void;
  onNavigate: (card: CollectionPokemonCard) => void;
  baseRoute?: string;
  collectionMode?: boolean;
}

interface CardNote {
  id: string;
  text: string;
  createdAt: number;
  updatedAt: number;
  server_id?: number;
}

export default function CardDetails({ card, allCards, onClose, onNavigate, baseRoute, collectionMode }: CardDetailsProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { updateCardInCollection, refreshCardData, fetchCollections, collections } = useCollection();
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'notes'>('details');
  const [notes, setNotes] = useState<CardNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const currentIndex = allCards.findIndex(c => c.id === card.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allCards.length - 1;
  
  const [currentCard, setCurrentCard] = useState<CollectionPokemonCard>(card);
  
  const [noteServerIds, setNoteServerIds] = useState<Record<string, number>>({});
  
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    const handleCardAddedToCollection = async (event: any) => {
      const { cardId, collectionCardId, collectionId, isFoil, isReverseHolo } = event.detail;
      
      if (cardId === currentCard.id) {
        console.log('Card was added to collection, updating card details:', event.detail);
        
        try {
          const refreshedCard = await refreshCardData(collectionId, collectionCardId);
          
          if (refreshedCard) {
            setCurrentCard(prevCard => ({
              ...prevCard,
              collection: {
                id: collectionCardId,
                collection_id: collectionId,
                is_foil: isFoil,
                is_reverse_holo: isReverseHolo,
                quantity: 1,
                variants: {
                  normal: !isFoil && !isReverseHolo ? 1 : 0,
                  holo: isFoil ? 1 : 0,
                  reverse_holo: isReverseHolo ? 1 : 0
                }
              }
            }));
            
            console.log('Updated card with collection info:', refreshedCard);
          } else {
            console.log('Could not refresh card data, but updating UI with collection info');
            setCurrentCard(prevCard => ({
              ...prevCard,
              collection: {
                id: collectionCardId,
                collection_id: collectionId,
                is_foil: isFoil,
                is_reverse_holo: isReverseHolo,
                quantity: 1,
                variants: {
                  normal: !isFoil && !isReverseHolo ? 1 : 0,
                  holo: isFoil ? 1 : 0,
                  reverse_holo: isReverseHolo ? 1 : 0
                }
              }
            }));
          }
        } catch (error) {
          console.error('Failed to fetch updated card data:', error);
          
          console.log('Error fetching card data, but updating UI with collection info');
          setCurrentCard(prevCard => ({
            ...prevCard,
            collection: {
              id: collectionCardId,
              collection_id: collectionId,
              is_foil: isFoil,
              is_reverse_holo: isReverseHolo,
              quantity: 1,
              variants: {
                normal: !isFoil && !isReverseHolo ? 1 : 0,
                holo: isFoil ? 1 : 0,
                reverse_holo: isReverseHolo ? 1 : 0
              }
            }
          }));
        }
      }
    };
    
    document.addEventListener('cardAddedToCollection', handleCardAddedToCollection);
    
    return () => {
      document.removeEventListener('cardAddedToCollection', handleCardAddedToCollection);
    };
  }, [currentCard.id, refreshCardData]);
  
  useEffect(() => {
    setCurrentCard(card);
  }, [card]);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const loadNotes = async () => {
      const localStorageKey = `card_notes_${card.id}`;
      const storedNotes = localStorage.getItem(localStorageKey);
      
      if (storedNotes) {
        try {
          const parsedNotes: CardNote[] = JSON.parse(storedNotes);
          setNotes(parsedNotes);
        } catch (e) {
          console.error('Error parsing stored notes:', e);
        }
      }
      
      try {
        if (isAuthenticated) {
          const backendNotes = await getCardNotes(card.id);
          if (backendNotes && Array.isArray(backendNotes) && backendNotes.length > 0) {
            const convertedNotes: CardNote[] = backendNotes.map((note: any) => ({
              id: `server_${note.id}`,
              text: note.content,
              createdAt: new Date(note.created_at).getTime(),
              updatedAt: new Date(note.updated_at).getTime(),
              server_id: note.id
            }));
            
            const serverIdMap: Record<string, number> = {};
            convertedNotes.forEach(note => {
              if (note.server_id) {
                serverIdMap[note.id] = note.server_id;
              }
            });
            setNoteServerIds(serverIdMap);
            
            setNotes(convertedNotes);
            
            localStorage.setItem(localStorageKey, JSON.stringify(convertedNotes));
          }
        }
      } catch (error) {
        console.error('Failed to load notes from server:', error);
      }
    };
    
    loadNotes();
  }, [card.id, isAuthenticated]);
  
  const saveNotes = useCallback(async (updatedNotes: CardNote[]) => {
    const localStorageKey = `card_notes_${currentCard.id}`;
    localStorage.setItem(localStorageKey, JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
    
    if (currentCard.collection?.id) {
      let saved = false;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (!saved && retryCount <= maxRetries) {
        try {
          const serializedNotes = JSON.stringify(updatedNotes);
          const result = await updateCardInCollection(
            currentCard.collection.collection_id,
            currentCard.collection.id,
            {
              notes: serializedNotes
            }
          );
          
          if (result !== null) {
            toast.success("Note saved!");
            saved = true;
          }
        } catch (error) {
          retryCount++;
          console.error(`Attempt ${retryCount}/${maxRetries + 1} failed:`, error);
          
          if (retryCount > maxRetries) {
            toast.error("Error saving notes. Your notes are saved locally.");
          } else {
            await new Promise(resolve => setTimeout(resolve, 500 * retryCount));
          }
        }
      }
    } else {
      console.log("Card not in collection, saving notes to backend API");
      
      if (isAuthenticated) {
        for (const note of updatedNotes) {
          if (!noteServerIds[note.id]) {
            try {
              const noteData = {
                card_id: currentCard.id,
                content: note.text
              };
              
              const result = await createCardNote(noteData);
              if (result && typeof result === 'object' && 'id' in result) {
                setNoteServerIds(prev => ({ ...prev, [note.id]: result.id as number }));
              }
            } catch (error) {
              console.error('Failed to save note to server:', error);
            }
          }
        }
        toast.success("Note added!");
      } else {
        toast.success("Notes saved to local storage!");
      }
    }
  }, [currentCard.id, currentCard.collection, updateCardInCollection, noteServerIds, isAuthenticated]);

  const addNote = () => {
    if (!newNoteText.trim()) {
      toast.error('Note cannot be empty');
      return;
    }
    
    const newNote: CardNote = {
      id: Date.now().toString(),
      text: newNoteText.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    
    const updatedNotes = [...notes, newNote];
    saveNotes(updatedNotes);
    setNewNoteText('');
    // toast.success('Note added successfully!');
  };

  const startEditingNote = (note: CardNote) => {
    setEditingNoteId(note.id);
    setEditingNoteText(note.text);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingNoteText('');
  };

  const saveEditedNote = () => {
    if (!editingNoteText.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    const updatedNotes = notes.map(note => 
      note.id === editingNoteId 
        ? {...note, text: editingNoteText.trim(), updatedAt: Date.now()} 
        : note
    );
    
    const noteToUpdate = notes.find(note => note.id === editingNoteId);
    if (noteToUpdate && noteServerIds[noteToUpdate.id]) {
      const serverId = noteServerIds[noteToUpdate.id];
      updateNoteApi(serverId, { content: editingNoteText.trim() })
        .catch((error: Error) => console.error('Failed to update note on server:', error));
    }
    
    saveNotes(updatedNotes);
    setEditingNoteId(null);
    toast.success('Note updated successfully!');
  };

  const deleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      if (noteServerIds[noteId]) {
        const serverId = noteServerIds[noteId];
        deleteNoteApi(serverId)
          .catch((error: Error) => console.error('Failed to delete note on server:', error));
        
        const updatedServerIds = { ...noteServerIds };
        delete updatedServerIds[noteId];
        setNoteServerIds(updatedServerIds);
      }
      
      const updatedNotes = notes.filter(note => note.id !== noteId);
      saveNotes(updatedNotes);
      toast.success('Note deleted successfully!');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

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
        className="relative w-full max-w-5xl rounded-lg shadow-2xl overflow-hidden"
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
            <span className="text-white font-bold text-sm sm:text-base">#{currentCard.number}</span>
            {currentCard.set && (
              <span className="text-white/70 ml-2 text-xs sm:text-sm hidden sm:inline">{currentCard.set.name}</span>
            )}
          </div>
          
          <div className="text-base sm:text-xl text-white font-bold truncate max-w-[150px] sm:max-w-none">{currentCard.name}</div>
          
          <div className="flex gap-1 sm:gap-3">
            <button
              onClick={() => setActiveTab('details')}
              className={`p-1 sm:p-1.5 text-white/90 hover:text-white transition-colors ${activeTab === 'details' ? 'bg-black/20 rounded' : ''}`}
              aria-label="Card Details"
              title="Card Details"
            >
              <Info size={isMobile ? 16 : 20} />
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`p-1 sm:p-1.5 text-white/90 hover:text-white transition-colors ${activeTab === 'notes' ? 'bg-black/20 rounded' : ''}`}
              aria-label="Card Notes"
              title="Card Notes"
            >
              <FileText size={isMobile ? 16 : 20} />
            </button>
            <button
              onClick={toggleFavorite}
              className="p-1 sm:p-1.5 text-white/90 hover:text-white transition-colors"
              aria-label="Favorite"
              title="Add to Wishlist"
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

        {activeTab === 'details' ? (
          <div className="flex flex-col md:flex-row max-h-[calc(90vh-120px)]">
            {/* Card image */}
            <div 
              className="w-full md:w-2/5 p-3 sm:p-6 flex items-center justify-center"
              style={{ 
                background: `radial-gradient(circle, ${primaryTypeColor}30 0%, #1A1A1A 100%)`,
              }}
            >
              <div className="relative flex items-center justify-center">
                <Image
                  src={currentCard.images.large || currentCard.images.small}
                  alt={currentCard.name}
                  width={500}
                  height={700}
                  className="max-h-[30vh] sm:max-h-[45vh] md:max-h-[65vh] object-contain drop-shadow-xl transform transition-transform duration-300 hover:scale-105"
                  priority
                  style={{ 
                    width: 'auto', 
                    maxWidth: isMobile ? '100%' : '500px' 
                  }}
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
                    {currentCard.supertype} {currentCard.subtypes?.join(", ")}
                  </span>
                </div>
                
                {/* Fixed rarity display */}
                {currentCard.rarity && (
                  <div 
                    className="py-1 px-2 sm:px-3 rounded-md text-xs sm:text-sm"
                    style={getRarityStyle(currentCard.rarity)}
                  >
                    <span className="text-white font-medium">
                      {currentCard.rarity}
                    </span>
                  </div>
                )}
              </div>
              
              {/* HP & Types */}
              {currentCard.supertype === "Pokémon" && (
                <div className="mb-3 sm:mb-5 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: "rgba(40,40,40,0.6)" }}>
                  {currentCard.hp && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 text-sm sm:text-base">HP</span>
                      <span className="text-lg sm:text-xl font-bold" style={{ color: "#8A3F3F" }}>{currentCard.hp}</span>
                    </div>
                  )}
                  {currentCard.types && currentCard.types.length > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm sm:text-base">Types</span>
                      <div className="flex gap-1 sm:gap-2">
                        {currentCard.types.map(type => (
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
              {(currentCard.evolvesFrom || (currentCard.evolvesTo && currentCard.evolvesTo.length > 0)) && (
                <div 
                  className="mb-3 sm:mb-5 p-3 sm:p-4 rounded-lg" 
                  style={{ 
                    background: "rgba(138, 63, 63, 0.15)",
                    border: "1px solid rgba(138, 63, 63, 0.3)" 
                  }}
                >
                  <h3 className="text-base sm:text-lg font-semibold mb-2" style={{ color: "#8A3F3F" }}>Evolution Chain</h3>
                  {currentCard.evolvesFrom && (
                    <div className="flex gap-2 items-center mb-1">
                      <span className="text-gray-400 text-xs sm:text-sm">Evolves From:</span>
                      <span className="text-white font-medium text-xs sm:text-sm">{currentCard.evolvesFrom}</span>
                    </div>
                  )}
                  {currentCard.evolvesTo && currentCard.evolvesTo.length > 0 && (
                    <div className="flex gap-2 items-center">
                      <span className="text-gray-400 text-xs sm:text-sm">Evolves To:</span>
                      <span className="text-white font-medium text-xs sm:text-sm">{currentCard.evolvesTo.join(", ")}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Abilities */}
              {currentCard.abilities && currentCard.abilities.length > 0 && (
                <div className="mb-3 sm:mb-5">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: "#8A3F3F" }}>Abilities</h3>
                  {currentCard.abilities.map((ability, index) => (
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
              
              {/* Attacks */}
              {currentCard.attacks && currentCard.attacks.length > 0 && (
                <div className="mb-3 sm:mb-5">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: "#8A3F3F" }}>Attacks</h3>
                  {currentCard.attacks.map((attack, index) => (
                    <div 
                      key={index} 
                      className="mb-2 sm:mb-3 p-3 sm:p-4 rounded-lg" 
                      style={{ 
                        background: "linear-gradient(to right, rgba(40,40,40,0.8), rgba(30,30,30,0.8))",
                        borderLeft: `4px solid ${primaryTypeColor}` 
                      }}
                    >
                      <div className="flex justify-between items-center mb-1 sm:mb-2">
                        <div className="flex items-center gap-2">
                          {/* Energy cost */}
                          {attack.cost && attack.cost.length > 0 && (
                            <div className="flex gap-1">
                              {attack.cost.map((energy, i) => (
                                <div 
                                  key={i} 
                                  className="w-5 h-5 rounded-full flex items-center justify-center"
                                  style={{ 
                                    backgroundColor: getTypeColor(energy),
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.3)"
                                  }}
                                  title={energy}
                                >
                                  <span className="text-xs font-bold text-white">{energy[0]}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <span className="font-medium text-white text-base sm:text-lg">{attack.name}</span>
                        </div>
                        
                        {attack.damage && (
                          <span 
                            className="text-sm px-2 py-1 rounded-md font-bold" 
                            style={{ 
                              backgroundColor: "rgba(138, 63, 63, 0.3)", 
                              color: "white" 
                            }}
                          >
                            {attack.damage}
                          </span>
                        )}
                      </div>
                      
                      {attack.text && (
                        <p className="text-gray-300 text-xs sm:text-sm mt-1">{attack.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Card variants / foil types */}
              {currentCard.tcgplayer?.prices ? (
                (() => {
                  const foilTypes = [];
                  if (currentCard.tcgplayer.prices.normal) foilTypes.push("normal");
                  if (currentCard.tcgplayer.prices.holofoil) foilTypes.push("holo");
                  if (currentCard.tcgplayer.prices.reverseHolofoil) foilTypes.push("reverse holo");
                  
                  return foilTypes.length > 0 ? (
                    <div className="mb-3 sm:mb-5">
                      <FoilContainer 
                        foilTypes={foilTypes} 
                        cardId={currentCard.id}
                        card={currentCard}
                        listStyle={true}
                      />
                    </div>
                  ) : (
                    <div className="mb-3 sm:mb-5">
                      <FoilContainer 
                        foilTypes={["normal"]} 
                        cardId={currentCard.id}
                        card={currentCard}
                        listStyle={true}
                      />
                    </div>
                  );
                })()
              ) : (
                !currentCard.collection ? (
                  <div className="mb-3 sm:mb-5">
                    <FoilContainer 
                      foilTypes={["darkgray"]} 
                      cardId={currentCard.id}
                      card={currentCard}
                      listStyle={true}
                    />
                  </div>
                ) : null
              )}
              
              {/* Card market prices */}
              {currentCard.cardmarket?.prices && (
                <div className="mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: "#8A3F3F" }}>Market Prices</h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4 p-3 sm:p-4 rounded-lg text-xs sm:text-sm" style={{ backgroundColor: "rgba(40,40,40,0.6)" }}>
                    {currentCard.cardmarket.prices.trendPrice !== undefined && (
                      <>
                        <div className="text-gray-300">Trend Price:</div>
                        <div className="text-right font-medium" style={{ color: "#7FC99F" }}>
                          {formatPrice(currentCard.cardmarket.prices.trendPrice)}
                        </div>
                      </>
                    )}
                    
                    {currentCard.cardmarket.prices.averageSellPrice !== undefined && (
                      <>
                        <div className="text-gray-300">Average Sell Price:</div>
                        <div className="text-right font-medium" style={{ color: "#7FC99F" }}>
                          {formatPrice(currentCard.cardmarket.prices.averageSellPrice)}
                        </div>
                      </>
                    )}
                    
                    {currentCard.cardmarket.prices.lowPrice !== undefined && (
                      <>
                        <div className="text-gray-300">Low Price:</div>
                        <div className="text-right font-medium" style={{ color: "#7FC99F" }}>
                          {formatPrice(currentCard.cardmarket.prices.lowPrice)}
                        </div>
                      </>
                    )}
                    
                    {currentCard.cardmarket.prices.reverseHoloTrend !== undefined && 
                     currentCard.cardmarket.prices.reverseHoloTrend > 0 && (
                      <>
                        <div className="text-gray-300">Reverse Holo Trend:</div>
                        <div className="text-right font-medium" style={{ color: "#7FC99F" }}>
                          {formatPrice(currentCard.cardmarket.prices.reverseHoloTrend)}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {currentCard.cardmarket.updatedAt && (
                    <div className="text-xs text-gray-500 mt-1 sm:mt-2 text-right">
                      Prices updated: {new Date(currentCard.cardmarket.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Notes Tab */
          <div className="flex flex-col md:flex-row max-h-[calc(90vh-120px)]">
            {/* Card image on the left side */}
            <div 
              className="w-full md:w-2/5 p-3 sm:p-6 flex items-center justify-center"
              style={{ 
                background: `radial-gradient(circle, ${primaryTypeColor}30 0%, #1A1A1A 100%)`,
              }}
            >
              <div className="relative flex items-center justify-center">
                <Image
                  src={currentCard.images.large || currentCard.images.small}
                  alt={currentCard.name}
                  width={500}
                  height={700}
                  className="max-h-[30vh] sm:max-h-[45vh] md:max-h-[65vh] object-contain drop-shadow-xl transition-transform duration-300 hover:scale-105 opacity-70"
                  priority
                  style={{ 
                    width: 'auto', 
                    maxWidth: isMobile ? '100%' : '500px' 
                  }}
                />
              </div>
            </div>

            {/* Notes section */}
            <div className="w-full md:w-3/5 p-3 sm:p-6 overflow-y-auto" style={{ color: "#E0E0E0" }}>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-semibold" style={{ color: "#8A3F3F" }}>Card Notes</h3>
                  <span className="text-gray-400 text-sm">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">Add your personal notes about this card.</p>
                
                {/* Add new note */}
                <div className="bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-700">
                  <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                    <Plus size={18} />
                    Add a new note
                  </h4>
                  <textarea 
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    className="w-full h-20 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:outline-none focus:border-[#8A3F3F] mb-3"
                    placeholder="Write your note here..."
                  />
                  
                  <button
                    onClick={addNote}
                    className="px-4 py-2 bg-[#8A3F3F] text-white rounded-md hover:bg-[#6E2F2F] transition-colors"
                  >
                    Add Note
                  </button>
                </div>
                
                {/* Existing notes */}
                {notes.length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="text-white font-medium mb-2">Your Notes</h4>
                    
                    {notes.map((note) => (
                      <div 
                        key={note.id} 
                        className="bg-gray-800/30 rounded-lg p-4 border border-gray-700"
                      >
                        {editingNoteId === note.id ? (
                          <>
                            <textarea 
                              value={editingNoteText}
                              onChange={(e) => setEditingNoteText(e.target.value)}
                              className="w-full h-28 p-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none focus:outline-none focus:border-[#8A3F3F] mb-3"
                            />
                            
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={cancelEditing}
                                className="px-3 py-1.5 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={saveEditedNote}
                                className="px-3 py-1.5 bg-[#8A3F3F] text-white rounded-md hover:bg-[#6E2F2F] transition-colors text-sm"
                              >
                                Save Changes
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="whitespace-pre-wrap text-white mb-3">{note.text}</div>
                            
                            <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                              <div>
                                {note.updatedAt !== note.createdAt ? (
                                  <span>Updated: {formatDate(note.updatedAt)}</span>
                                ) : (
                                  <span>Created: {formatDate(note.createdAt)}</span>
                                )}
                              </div>
                              
                              <div className="flex gap-3">
                                <button 
                                  onClick={() => startEditingNote(note)}
                                  className="text-gray-400 hover:text-white transition-colors"
                                  aria-label="Edit note"
                                  title="Edit note"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => deleteNote(note.id)}
                                  className="text-gray-400 hover:text-red-400 transition-colors"
                                  aria-label="Delete note"
                                  title="Delete note"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No notes yet. Add your first note above!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

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