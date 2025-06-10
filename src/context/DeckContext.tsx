"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authApiClient } from '@/app/lib/api/client';
import { useAuth } from './AuthContext';

// Define card types
interface DeckCard {
  id: number;
  deck_id: number;
  card_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

// Define types
interface Deck {
  id: number;
  name: string;
  description?: string;
  type: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  cards: DeckCard[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T[];
  deck?: Deck;
  message?: string;
}

interface DeckContextType {
  decks: Deck[];
  loading: boolean;
  error: string | null;
  fetchDecks: () => Promise<void>;
  createDeck: (name: string, description: string, type: string) => Promise<Deck | null>;
  updateDeck: (id: number, name: string, description: string, type: string, isPublic: boolean) => Promise<Deck | null>;
  deleteDeck: (id: number) => Promise<boolean>;
}

interface DeckProviderProps {
  children: ReactNode;
}

const DeckContext = createContext<DeckContextType | undefined>(undefined);

export const DeckProvider = ({ children }: DeckProviderProps) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const fetchDecks = async () => {
    if (!isAuthenticated) {
      setDecks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await authApiClient.get<ApiResponse<Deck>>('/decks');
      setDecks(response.data.data || []);
    } catch (err) {
      console.error('Error fetching decks:', err);
      setError('Failed to fetch your decks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const createDeck = async (name: string, description: string, type: string): Promise<Deck | null> => {
    try {
      const response = await authApiClient.post<ApiResponse<Deck>>('/decks', {
        name,
        description,
        type
      });
      
      if (response.data.success) {
        await fetchDecks(); // Refresh the decks list
        return response.data.deck || null;
      }
      return null;
    } catch (err) {
      console.error('Error creating deck:', err);
      return null;
    }
  };

  const updateDeck = async (
    id: number, 
    name: string, 
    description: string, 
    type: string,
    isPublic: boolean
  ): Promise<Deck | null> => {
    try {
      const response = await authApiClient.put<ApiResponse<Deck>>(`/decks/${id}`, {
        name,
        description,
        type,
        is_public: isPublic
      });
      
      if (response.data.success) {
        await fetchDecks(); // Refresh the decks list
        return response.data.deck || null;
      }
      return null;
    } catch (err) {
      console.error('Error updating deck:', err);
      return null;
    }
  };

  const deleteDeck = async (id: number): Promise<boolean> => {
    try {
      const response = await authApiClient.delete<ApiResponse<never>>(`/decks/${id}`);
      
      if (response.data.success) {
        await fetchDecks(); // Refresh the decks list
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting deck:', err);
      return false;
    }
  };

  // Initialize by fetching decks when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchDecks();
    }
  }, [isAuthenticated]);

  const value = {
    decks,
    loading,
    error,
    fetchDecks,
    createDeck,
    updateDeck,
    deleteDeck
  };

  return (
    <DeckContext.Provider value={value}>
      {children}
    </DeckContext.Provider>
  );
};

export const useDeck = (): DeckContextType => {
  const context = useContext(DeckContext);
  if (context === undefined) {
    throw new Error('useDeck must be used within a DeckProvider');
  }
  return context;
}; 