// Pokemon TCG API functions
import { fetchWithAuth, POKEMON_TCG_API_URL, cacheRequest, CACHE_DURATIONS } from './client';
import { PokemonSet, PokemonCard, SearchType } from './types';

/**
 * Fetch all Pokemon card sets grouped by series
 */
export const fetchPokemonSets = async (): Promise<{ [key: string]: PokemonSet[] }> => {
  const url = `${POKEMON_TCG_API_URL}/sets`;
  
  return cacheRequest(
    url,
    async () => {
      try {
        const response = await fetchWithAuth(url);
        const data = await response.json();
    
        const validSets: PokemonSet[] = data.data.filter((set: PokemonSet) => set.releaseDate);
        const sortedSets = validSets.sort((a, b) => 
          new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );
    
        const groupedSets = sortedSets.reduce<{ [key: string]: PokemonSet[] }>((acc, set) => {
          if (!acc[set.series]) acc[set.series] = [];
          acc[set.series].push(set);
          return acc;
        }, {});
    
        return groupedSets;
      } catch (error) {
        console.error("Error fetching Pokémon sets:", error);
        return {};
      }
    },
    CACHE_DURATIONS.VERY_LONG // Sets don't change often, cache for 24 hours
  );
};

/**
 * Fetch cards from a specific set
 */
export const fetchCardsBySet = async (
  setId: string, 
  searchTerm?: string, 
  cardType: SearchType = "all"
): Promise<PokemonCard[]> => {
  let query = `set.id:${setId}`;
  
  if (cardType !== "all") {
    if (cardType === "pokemon") {
      query += " supertype:pokémon";
    } else if (cardType === "trainer") {
      query += " supertype:trainer";
    } else if (cardType === "energy") {
      query += " supertype:energy";
    }
  }
  
  if (searchTerm && searchTerm.trim() !== '') {
    const sanitizedTerm = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    if (/^\d+$/.test(sanitizedTerm)) {
      query += ` number:${sanitizedTerm}`;
    } else {
      query += ` name:"*${sanitizedTerm}*"`;
    }
  }
  
  const url = `${POKEMON_TCG_API_URL}/cards?q=${encodeURIComponent(query)}&orderBy=number`;
  
  // If there's a search term, don't cache as results are more specific
  const duration = searchTerm ? 0 : CACHE_DURATIONS.LONG;
  
  return cacheRequest(
    url,
    async () => {
      try {
        const response = await fetchWithAuth(url);
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error("Error fetching cards:", error);
        return [];
      }
    },
    duration
  );
};

/**
 * Fetch details for a specific set
 */
export const fetchSetDetails = async (setId: string): Promise<PokemonSet | null> => {
  const url = `${POKEMON_TCG_API_URL}/sets/${setId}`;
  
  return cacheRequest(
    url,
    async () => {
      try {
        const response = await fetchWithAuth(url);
        const data = await response.json();
        return data.data;
      } catch (error) {
        console.error("Error fetching set details:", error);
        return null;
      }
    },
    CACHE_DURATIONS.VERY_LONG // Set details rarely change
  );
};

/**
 * Search cards by type and term
 */
export const searchCardsByType = async (
  searchTerm: string,
  cardType: SearchType = "all",
  page = 1,
  pageSize = 20
): Promise<{
  cards: PokemonCard[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> => {
  if (!searchTerm || searchTerm.trim() === '') {
    return {
      cards: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 0
    };
  }
  
  const sanitizedTerm = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let query = "";
  
  if (/^\d+$/.test(sanitizedTerm)) {
    query = `number:${sanitizedTerm}`;
  } else {
    query = `name:"*${sanitizedTerm}*"`;
  }
  
  if (cardType !== "all") {
    if (cardType === "pokemon") {
      query += " supertype:pokémon";
    } else if (cardType === "trainer") {
      query += " supertype:trainer";
    } else if (cardType === "energy") {
      query += " supertype:energy";
    }
  }
  
  const url = `${POKEMON_TCG_API_URL}/cards?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}&orderBy=set.releaseDate,number`;
  
  // Search results are often unique, so cache briefly
  return cacheRequest(
    url,
    async () => {
      try {
        const response = await fetchWithAuth(url);
        const data = await response.json();
        
        return {
          cards: data.data || [],
          totalCount: data.totalCount || 0,
          page: data.page || page,
          pageSize: data.pageSize || pageSize,
          totalPages: data.totalPages || 0
        };
      } catch (error) {
        console.error("Error searching cards:", error);
        return {
          cards: [],
          totalCount: 0,
          page,
          pageSize,
          totalPages: 0
        };
      }
    },
    CACHE_DURATIONS.SHORT // Search results should be fresher
  );
};

/**
 * Search Pokemon cards by name
 */
export const searchPokemonByName = async (
  pokemonName: string, 
  page = 1, 
  pageSize = 20
): Promise<{
  cards: PokemonCard[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> => {
  return searchCardsByType(pokemonName, "pokemon", page, pageSize);
};

/**
 * Search all cards by term
 */
export const searchCards = async (
  searchTerm: string, 
  page = 1, 
  pageSize = 20
): Promise<{
  cards: PokemonCard[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> => {
  return searchCardsByType(searchTerm, "all", page, pageSize);
};