"use client";

import { useState, useEffect } from "react";
import { useDeck } from "@/context/DeckContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Plus, Settings, Trash2, Copy, ListIcon, EyeIcon, EyeOffIcon, Edit2, Loader 
} from "lucide-react";
import toast from "react-hot-toast";

export default function DecksPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { 
    decks, 
    loading, 
    createDeck, 
    deleteDeck, 
    updateDeck,
    fetchDecks,
    error 
  } = useDeck();
  
  const [showNewDeckModal, setShowNewDeckModal] = useState(false);
  const [editingDeck, setEditingDeck] = useState<number | null>(null);
  const [deckName, setDeckName] = useState("");
  const [deckDescription, setDeckDescription] = useState("");
  const [deckType, setDeckType] = useState("deck");
  const [isPublic, setIsPublic] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/signin");
    } else {
      fetchDecks();
    }
  }, [isAuthenticated, router, fetchDecks]);
  
  // Helper to get the deck type label
  const getDeckTypeLabel = (type: string) => {
    switch (type) {
      case 'deck':
        return 'Deck';
      case 'collection':
        return 'Collection';
      case 'wishlist':
        return 'Wishlist';
      case 'trading':
        return 'Trading';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  // Helper to get the deck type color
  const getDeckTypeColor = (type: string) => {
    switch (type) {
      case 'deck':
        return '#8A3F3F';
      case 'collection':
        return '#388E3C';
      case 'wishlist':
        return '#1976D2';
      case 'trading':
        return '#F57C00';
      default:
        return '#8A3F3F';
    }
  };
  
  const handleCreateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deckName.trim()) {
      toast.error("Please enter a deck name");
      return;
    }
    
    setIsCreating(true);
    
    try {
      const newDeck = await createDeck(deckName, deckDescription, deckType);
      
      if (newDeck) {
        toast.success(`Deck "${deckName}" created successfully!`);
        setShowNewDeckModal(false);
        setDeckName("");
        setDeckDescription("");
        setDeckType("deck");
        setIsPublic(false);
        
        // Go to the deck builder for the new deck
        router.push(`/decks/${newDeck.id}`);
      } else {
        toast.error("Failed to create deck");
      }
    } catch (err) {
      console.error("Error creating deck:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleUpdateDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deckName.trim() || !editingDeck) {
      toast.error("Please enter a deck name");
      return;
    }
    
    setIsCreating(true);
    
    try {
      const updatedDeck = await updateDeck(
        editingDeck, 
        deckName, 
        deckDescription, 
        deckType,
        isPublic
      );
      
      if (updatedDeck) {
        toast.success(`Deck "${deckName}" updated successfully!`);
        setEditingDeck(null);
        setDeckName("");
        setDeckDescription("");
        setDeckType("deck");
        setIsPublic(false);
      } else {
        toast.error("Failed to update deck");
      }
    } catch (err) {
      console.error("Error updating deck:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleDelete = async (id: number) => {
    try {
      const success = await deleteDeck(id);
      
      if (success) {
        toast.success("Deck deleted successfully");
      } else {
        toast.error("Failed to delete deck");
      }
    } catch (err) {
      console.error("Error deleting deck:", err);
      toast.error("An error occurred while deleting the deck");
    } finally {
      setConfirmDeleteId(null);
    }
  };
  
  const handleEditDeck = (deck: any) => {
    setEditingDeck(deck.id);
    setDeckName(deck.name);
    setDeckDescription(deck.description || "");
    setDeckType(deck.type || "deck");
    setIsPublic(deck.is_public);
  };
  
  const handleDuplicateDeck = async (deck: any) => {
    try {
      const newDeck = await createDeck(
        `${deck.name} (Copy)`, 
        deck.description, 
        deck.type
      );
      
      if (newDeck) {
        toast.success(`Deck "${deck.name}" duplicated successfully!`);
      } else {
        toast.error("Failed to duplicate deck");
      }
    } catch (err) {
      console.error("Error duplicating deck:", err);
      toast.error("An error occurred while duplicating the deck");
    }
  };
  
  const togglePublic = async (deck: any) => {
    try {
      const updatedDeck = await updateDeck(
        deck.id,
        deck.name,
        deck.description,
        deck.type,
        !deck.is_public
      );
      
      if (updatedDeck) {
        toast.success(`Deck ${updatedDeck.is_public ? 'is now public' : 'is now private'}`);
      } else {
        toast.error("Failed to update deck visibility");
      }
    } catch (err) {
      console.error("Error updating deck visibility:", err);
      toast.error("An error occurred");
    }
  };
  
  const handleViewDeck = (deckId: number) => {
    router.push(`/decks/${deckId}`);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader className="animate-spin text-[#8A3F3F]" size={32} />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Decks</h1>
          <p className="text-gray-400 mt-1">
            Create and manage your Pokémon card decks
          </p>
        </div>
        
        <button
          onClick={() => setShowNewDeckModal(true)}
          className="px-4 py-2 bg-[#8A3F3F] text-white rounded-md hover:bg-[#6E2F2F] transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Create Deck
        </button>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-lg">
          {error}
        </div>
      )}
      
      {/* Decks Grid */}
      {decks.length === 0 ? (
        <div className="bg-[#252525] rounded-lg p-8 text-center mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">No decks found</h2>
          <p className="text-gray-400 mb-6">
            You don't have any decks yet. Create your first deck to start organizing your cards.
          </p>
          
          <button
            onClick={() => setShowNewDeckModal(true)}
            className="px-5 py-2.5 bg-[#8A3F3F] text-white rounded-md hover:bg-[#6E2F2F] transition-colors"
          >
            <Plus className="inline mr-2" size={18} />
            Create Your First Deck
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {decks.map(deck => (
            <div 
              key={deck.id}
              className="bg-[#252525] rounded-lg overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors"
            >
              {/* Header with type banner */}
              <div 
                className="p-4 flex justify-between items-center"
                style={{ 
                  background: `linear-gradient(to right, ${getDeckTypeColor(deck.type)}, rgba(40, 40, 40, 1))`,
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                <div className="flex items-center gap-2">
                  <span 
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white"
                    style={{ border: `2px solid ${getDeckTypeColor(deck.type)}` }}
                  >
                    <ListIcon size={16} />
                  </span>
                  <span className="text-white font-medium">
                    {getDeckTypeLabel(deck.type)}
                  </span>
                </div>
                
                <div className="flex items-center">
                  {deck.is_public ? (
                    <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <EyeIcon size={12} />
                      Public
                    </span>
                  ) : (
                    <span className="text-xs bg-black/30 text-gray-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <EyeOffIcon size={12} />
                      Private
                    </span>
                  )}
                </div>
              </div>
              
              {/* Main content */}
              <div className="p-4">
                <h3 
                  className="text-xl font-bold text-white mb-2 hover:text-[#8A3F3F] transition-colors cursor-pointer"
                  onClick={() => handleViewDeck(deck.id)}
                >
                  {deck.name}
                </h3>
                
                {deck.description && (
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {deck.description}
                  </p>
                )}
                
                {/* Stats */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <span className="text-xs bg-[#333] text-gray-300 px-2 py-1 rounded">
                      {deck.cards.length} cards
                    </span>
                    
                    <span className="text-xs bg-[#333] text-gray-300 px-2 py-1 rounded">
                      {new Date(deck.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="p-3 border-t border-gray-800 flex justify-between gap-1">
                <button 
                  className="flex-1 flex justify-center items-center gap-1 py-1.5 px-2 bg-[#333] hover:bg-[#444] transition-colors rounded text-sm text-white"
                  onClick={() => handleViewDeck(deck.id)}
                >
                  <EyeIcon size={14} />
                  View
                </button>
                
                <button 
                  className="flex-1 flex justify-center items-center gap-1 py-1.5 px-2 bg-[#333] hover:bg-[#444] transition-colors rounded text-sm text-white"
                  onClick={() => handleEditDeck(deck)}
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                
                <div className="relative flex-1">
                  <button 
                    className="w-full flex justify-center items-center gap-1 py-1.5 px-2 bg-[#333] hover:bg-[#444] transition-colors rounded text-sm text-white"
                    onClick={() => setConfirmDeleteId(confirmDeleteId === deck.id ? null : deck.id)}
                  >
                    <Settings size={14} />
                    More
                  </button>
                  
                  {confirmDeleteId === deck.id && (
                    <div className="absolute right-0 bottom-full mb-1 w-36 bg-[#1A1A1A] border border-gray-800 rounded-md shadow-lg z-10">
                      <button 
                        className="w-full text-left px-3 py-2 hover:bg-[#252525] text-white text-sm flex items-center gap-2"
                        onClick={() => togglePublic(deck)}
                      >
                        {deck.is_public ? (
                          <>
                            <EyeOffIcon size={14} />
                            Make Private
                          </>
                        ) : (
                          <>
                            <EyeIcon size={14} />
                            Make Public
                          </>
                        )}
                      </button>
                      
                      <button 
                        className="w-full text-left px-3 py-2 hover:bg-[#252525] text-white text-sm flex items-center gap-2"
                        onClick={() => handleDuplicateDeck(deck)}
                      >
                        <Copy size={14} />
                        Duplicate
                      </button>
                      
                      <button 
                        className="w-full text-left px-3 py-2 hover:bg-[#252525] text-red-400 text-sm flex items-center gap-2"
                        onClick={() => handleDelete(deck.id)}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Create New Deck Modal */}
      {showNewDeckModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E1E] rounded-lg max-w-md w-full p-6 relative">
            <button 
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
              onClick={() => setShowNewDeckModal(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <h2 className="text-xl font-bold text-white mb-4">Create New Deck</h2>
            
            <form onSubmit={handleCreateDeck} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Deck Name*
                </label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2A2A2A] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#8A3F3F]"
                  placeholder="My Awesome Deck"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2A2A2A] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#8A3F3F] min-h-20"
                  placeholder="A brief description of your deck..."
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Deck Type
                </label>
                <select
                  value={deckType}
                  onChange={(e) => setDeckType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2A2A2A] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#8A3F3F]"
                >
                  <option value="deck">Deck</option>
                  <option value="collection">Collection</option>
                  <option value="wishlist">Wishlist</option>
                  <option value="trading">Trading Binder</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewDeckModal(false)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8A3F3F] text-white rounded-md hover:bg-[#6E2F2F] transition-colors flex items-center gap-2"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Create Deck
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Deck Modal */}
      {editingDeck !== null && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1E1E1E] rounded-lg max-w-md w-full p-6 relative">
            <button 
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
              onClick={() => setEditingDeck(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <h2 className="text-xl font-bold text-white mb-4">Edit Deck</h2>
            
            <form onSubmit={handleUpdateDeck} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Deck Name*
                </label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2A2A2A] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#8A3F3F]"
                  placeholder="My Awesome Deck"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2A2A2A] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#8A3F3F] min-h-20"
                  placeholder="A brief description of your deck..."
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Deck Type
                </label>
                <select
                  value={deckType}
                  onChange={(e) => setDeckType(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2A2A2A] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#8A3F3F]"
                >
                  <option value="deck">Deck</option>
                  <option value="collection">Collection</option>
                  <option value="wishlist">Wishlist</option>
                  <option value="trading">Trading Binder</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded bg-[#2A2A2A] border-gray-700 text-[#8A3F3F] focus:ring-[#8A3F3F]"
                />
                <label htmlFor="isPublic" className="ml-2 text-sm text-gray-300">
                  Make this deck public
                </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingDeck(null)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8A3F3F] text-white rounded-md hover:bg-[#6E2F2F] transition-colors flex items-center gap-2"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}