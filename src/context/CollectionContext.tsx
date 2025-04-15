"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApiClient } from '@/app/lib/api/client';

// Define types for our collection data
export interface CollectionCard {
  id: number;
  collection_id: number;
  card_id: string;
  quantity: number;
  condition: 'mint' | 'near_mint' | 'excellent' | 'good' | 'played' | null;
  is_foil: boolean;
  is_reverse_holo: boolean;
  acquired_date: string | null;
  purchase_price: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Collection {
  id: number;
  user_id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  cards: CollectionCard[];
}

interface CollectionContextType {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  fetchCollections: () => Promise<void>;
  createCollection: (name: string, description?: string) => Promise<Collection | null>;
  updateCollection: (id: number, name: string, description?: string) => Promise<Collection | null>;
  deleteCollection: (id: number) => Promise<boolean>;
  addCardToCollection: (collectionId: number, cardData: Partial<CollectionCard>) => Promise<CollectionCard | null>;
  updateCardInCollection: (collectionId: number, cardId: number, cardData: Partial<CollectionCard>) => Promise<CollectionCard | null>;
  removeCardFromCollection: (collectionId: number, cardId: number) => Promise<boolean>;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export const CollectionProvider = ({ children }: { children: ReactNode }) => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Fetch collections when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCollections();
    } else {
      setCollections([]);
    }
  }, [isAuthenticated]);

  // Fetch all collections
  const fetchCollections = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApiClient.get<{ status: string; data: Collection[] }>('/collections');
      
      if (response.data.status === 'success') {
        setCollections(response.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching collections:', err);
      setError('Failed to fetch collections. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Create a new collection
const createCollection = async (name: string, description?: string): Promise<Collection | null> => {
  setError(null);
  console.log("Creating collection with name:", name);
  
  try {
    const response = await authApiClient.post<{ status: string; data: Collection }>('/collections', {
      name,
      description
    });
    
    console.log("Collection creation response:", response.data);
    
    if (response.data.status === 'success') {
      const newCollection = response.data.data;
      setCollections([...collections, newCollection]);
      return newCollection;
    }
    
    console.error("Collection creation failed with response:", response.data);
    return null;
  } catch (err: any) {
    console.error("Error creating collection:", err.response?.data || err.message);
    setError('Failed to create collection. Please try again.');
    return null;
  }
};

  // Update a collection
  const updateCollection = async (id: number, name: string, description?: string): Promise<Collection | null> => {
    setError(null);
    
    try {
      const response = await authApiClient.put<{ status: string; data: Collection }>(`/collections/${id}`, {
        name,
        description
      });
      
      if (response.data.status === 'success') {
        const updatedCollection = response.data.data;
        setCollections(collections.map(collection => 
          collection.id === id ? updatedCollection : collection
        ));
        return updatedCollection;
      }
      
      return null;
    } catch (err: any) {
      console.error('Error updating collection:', err);
      setError('Failed to update collection. Please try again.');
      return null;
    }
  };

  // Delete a collection
  const deleteCollection = async (id: number): Promise<boolean> => {
    setError(null);
    
    try {
      const response = await authApiClient.delete<{ status: string }>('/collections/${id}');
      
      if (response.data.status === 'success') {
        setCollections(collections.filter(collection => collection.id !== id));
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('Error deleting collection:', err);
      setError('Failed to delete collection. Please try again.');
      return false;
    }
  };

  // Add a card to a collection
  const addCardToCollection = async (collectionId: number, cardData: Partial<CollectionCard>): Promise<CollectionCard | null> => {
    setError(null);
    
    try {
      const response = await authApiClient.post<{ status: string; data: CollectionCard }>(`/collections/${collectionId}/cards`, cardData);
      
      if (response.data.status === 'success') {
        const newCard = response.data.data;
        
        setCollections(prevCollections => prevCollections.map(collection => {
          if (collection.id === collectionId) {
            // If the card already exists with the same id, replace it
            const cardIndex = collection.cards.findIndex(card => card.id === newCard.id);
            
            if (cardIndex >= 0) {
              const updatedCards = [...collection.cards];
              updatedCards[cardIndex] = newCard;
              return { ...collection, cards: updatedCards };
            }
            
            // Otherwise add it as a new card
            return { ...collection, cards: [...collection.cards, newCard] };
          }
          return collection;
        }));
        
        return newCard;
      }
      
      return null;
    } catch (err: any) {
      console.error('Error adding card to collection:', err);
      setError('Failed to add card to collection. Please try again.');
      return null;
    }
  };

  // Update a card in a collection
  const updateCardInCollection = async (collectionId: number, cardId: number, cardData: Partial<CollectionCard>): Promise<CollectionCard | null> => {
    setError(null);
    
    try {
      const response = await authApiClient.put<{ status: string; data: CollectionCard }>(`/collections/${collectionId}/cards/${cardId}`, cardData);
      
      if (response.data.status === 'success') {
        const updatedCard = response.data.data;
        
        setCollections(prevCollections => prevCollections.map(collection => {
          if (collection.id === collectionId) {
            const updatedCards = collection.cards.map(card => 
              card.id === cardId ? updatedCard : card
            );
            return { ...collection, cards: updatedCards };
          }
          return collection;
        }));
        
        return updatedCard;
      }
      
      return null;
    } catch (err: any) {
      console.error('Error updating card in collection:', err);
      setError('Failed to update card. Please try again.');
      return null;
    }
  };

  // Remove a card from a collection
  const removeCardFromCollection = async (collectionId: number, cardId: number): Promise<boolean> => {
    setError(null);
    
    try {
      const response = await authApiClient.delete<{ status: string }>(`/collections/${collectionId}/cards/${cardId}`);
      
      if (response.data.status === 'success') {
        setCollections(prevCollections => prevCollections.map(collection => {
          if (collection.id === collectionId) {
            const updatedCards = collection.cards.filter(card => card.id !== cardId);
            return { ...collection, cards: updatedCards };
          }
          return collection;
        }));
        
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('Error removing card from collection:', err);
      setError('Failed to remove card from collection. Please try again.');
      return false;
    }
  };

  const value = {
    collections,
    loading,
    error,
    fetchCollections,
    createCollection,
    updateCollection,
    deleteCollection,
    addCardToCollection,
    updateCardInCollection,
    removeCardFromCollection
  };

  return (
    <CollectionContext.Provider value={value}>
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollection = (): CollectionContextType => {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error('useCollection must be used within a CollectionProvider');
  }
  return context;
};