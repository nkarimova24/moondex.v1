// Pokemon TCG API functions
import { fetchWithAuth, POKEMON_TCG_API_URL } from './client';
import { PokemonSet, PokemonCard, SearchType } from './types';

/**
 * Fetch all Pokemon card sets grouped by series
 */
export const fetchPokemonSets = async (): Promise<{ [key: string]: PokemonSet[] }> => {
  try {
    const response = await fetchWithAuth(`${POKEMON_TCG_API_URL}/sets`);
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
};

/**
 * Fetch cards from a specific set
 */
export const fetchCardsBySet = async (
  setId: string, 
  searchTerm?: string, 
  cardType: SearchType = "all"
): Promise<PokemonCard[]> => {
  try {
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
    
    const response = await fetchWithAuth(`${POKEMON_TCG_API_URL}/cards?q=${encodeURIComponent(query)}&orderBy=number`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching cards:", error);
    return [];
  }
};

/**
 * Fetch details for a specific set
 */
export const fetchSetDetails = async (setId: string): Promise<PokemonSet | null> => {
  try {
    const response = await fetchWithAuth(`${POKEMON_TCG_API_URL}/sets/${setId}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching set details:", error);
    return null;
  }
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
  try {
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
    
    const response = await fetchWithAuth(
      `${POKEMON_TCG_API_URL}/cards?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}&orderBy=set.releaseDate,number`
    );
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