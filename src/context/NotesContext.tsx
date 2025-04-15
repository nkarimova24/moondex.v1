"use client";

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authApiClient } from '@/app/lib/api/client';
import toast from 'react-hot-toast';

export interface Note {
  id: number;
  user_id: number;
  card_id: string;
  collection_id: number | null;
  deck_id: number | null;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NotesContextType {
  notes: Note[];
  cardNotes: Record<string, Note[]>;
  loading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  fetchCardNotes: (cardId: string) => Promise<Note[]>;
  addNote: (cardId: string, content: string, collectionId?: number, deckId?: number) => Promise<Note | null>;
  updateNote: (noteId: number, content: string) => Promise<Note | null>;
  deleteNote: (noteId: number) => Promise<boolean>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider = ({ children }: { children: ReactNode }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [cardNotes, setCardNotes] = useState<Record<string, Note[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotes();
    } else {
      setNotes([]);
      setCardNotes({});
    }
  }, [isAuthenticated]);

  // Fetch all notes
  const fetchNotes = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApiClient.get<{ status: string; data: Note[] }>('/notes');
      
      if (response.data.status === 'success') {
        setNotes(response.data.data);
        
        // Organize notes by card_id for easy access
        const notesByCard: Record<string, Note[]> = {};
        response.data.data.forEach(note => {
          if (!notesByCard[note.card_id]) {
            notesByCard[note.card_id] = [];
          }
          notesByCard[note.card_id].push(note);
        });
        
        setCardNotes(notesByCard);
      }
    } catch (err: any) {
      console.error('Error fetching notes:', err);
      setError('Failed to fetch notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch notes for a specific card
  const fetchCardNotes = async (cardId: string): Promise<Note[]> => {
    setError(null);
    
    try {
      const response = await authApiClient.get<{ status: string; data: Note[] }>(`/notes/card/${cardId}`);
      
      if (response.data.status === 'success') {
        const fetchedNotes = response.data.data;
        
        // Update the card notes cache
        setCardNotes(prev => ({
          ...prev,
          [cardId]: fetchedNotes
        }));
        
        return fetchedNotes;
      }
      
      return [];
    } catch (err: any) {
      console.error(`Error fetching notes for card ${cardId}:`, err);
      setError('Failed to fetch card notes. Please try again.');
      return [];
    }
  };

  // Add a new note
  const addNote = async (
    cardId: string, 
    content: string, 
    collectionId?: number, 
    deckId?: number
  ): Promise<Note | null> => {
    setError(null);
    
    try {
      const response = await authApiClient.post<{ status: string; data: Note }>('/notes', {
        card_id: cardId,
        content,
        collection_id: collectionId,
        deck_id: deckId
      });
      
      if (response.data.status === 'success') {
        const newNote = response.data.data;
        
        // Update notes array
        setNotes(prev => [...prev, newNote]);
        
        // Update card notes
        setCardNotes(prev => ({
          ...prev,
          [cardId]: [...(prev[cardId] || []), newNote]
        }));
        
        toast.success('Note added successfully');
        return newNote;
      }
      
      return null;
    } catch (err: any) {
      console.error('Error adding note:', err);
      setError('Failed to add note. Please try again.');
      toast.error('Failed to add note');
      return null;
    }
  };

  // Update a note
  const updateNote = async (noteId: number, content: string): Promise<Note | null> => {
    setError(null);
    
    try {
      const response = await authApiClient.put<{ status: string; data: Note }>(`/notes/${noteId}`, {
        content
      });
      
      if (response.data.status === 'success') {
        const updatedNote = response.data.data;
        
        // Update notes array
        setNotes(prev => prev.map(note => 
          note.id === noteId ? updatedNote : note
        ));
        
        // Update card notes
        setCardNotes(prev => {
          const result = { ...prev };
          Object.keys(result).forEach(cardId => {
            result[cardId] = result[cardId].map(note => 
              note.id === noteId ? updatedNote : note
            );
          });
          return result;
        });
        
        toast.success('Note updated successfully');
        return updatedNote;
      }
      
      return null;
    } catch (err: any) {
      console.error('Error updating note:', err);
      setError('Failed to update note. Please try again.');
      toast.error('Failed to update note');
      return null;
    }
  };

  // Delete a note
  const deleteNote = async (noteId: number): Promise<boolean> => {
    setError(null);
    
    try {
      const response = await authApiClient.delete<{ status: string }>(`/notes/${noteId}`);
      
      if (response.data.status === 'success') {
        // Find the note to get its card_id before removing it
        const noteToDelete = notes.find(note => note.id === noteId);
        
        // Update notes array
        setNotes(prev => prev.filter(note => note.id !== noteId));
        
        // Update card notes if we found the note
        if (noteToDelete) {
          setCardNotes(prev => ({
            ...prev,
            [noteToDelete.card_id]: prev[noteToDelete.card_id].filter(note => note.id !== noteId)
          }));
        }
        
        toast.success('Note deleted successfully');
        return true;
      }
      
      return false;
    } catch (err: any) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note. Please try again.');
      toast.error('Failed to delete note');
      return false;
    }
  };

  const value = {
    notes,
    cardNotes,
    loading,
    error,
    fetchNotes,
    fetchCardNotes,
    addNote,
    updateNote,
    deleteNote
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};