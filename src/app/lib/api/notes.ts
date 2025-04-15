import { authApiClient } from './client';

export interface Note {
  id: number;
  user_id: number;
  card_id: string;
  collection_id?: number | null;
  deck_id?: number | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteData {
  card_id: string;
  collection_id?: number | null;
  deck_id?: number | null;
  content: string;
}

export interface UpdateNoteData {
  content: string;
}

/**
 * Get all notes for a card
 */
export const getCardNotes = async (cardId: string) => {
  try {
    const response = await authApiClient.get(`/notes/card/${cardId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch card notes:', error);
    throw error;
  }
};

/**
 * Create a new note for a card (with or without collection)
 */
export const createCardNote = async (data: CreateNoteData) => {
  try {
    const response = await authApiClient.post('/notes', data);
    return response.data;
  } catch (error) {
    console.error('Failed to create card note:', error);
    throw error;
  }
};

/**
 * Update an existing note
 */
export const updateNote = async (noteId: number, data: UpdateNoteData) => {
  try {
    const response = await authApiClient.put(`/notes/${noteId}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update note:', error);
    throw error;
  }
};

/**
 * Delete a note
 */
export const deleteNote = async (noteId: number) => {
  try {
    const response = await authApiClient.delete(`/notes/${noteId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to delete note:', error);
    throw error;
  }
}; 