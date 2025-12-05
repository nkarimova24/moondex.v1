// Pokemon TCG API functions - Using LOCAL DATA
import { fetchWithAuth, POKEMON_TCG_API_URL, cacheRequest, CACHE_DURATIONS } from './client';
import { PokemonSet, PokemonCard, SearchType } from './types';

/**
 * Fetch data from local JSON files
 */
async function fetchLocalData(path: string): Promise<any> {
  try {
    const response = await fetch(`/data/${path}`);
    if (!response.ok) {
      console.warn(`Failed to load local data: ${path}, falling back to API`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`Error loading local data from ${path}:`, error);
    return null;
  }
}

/**
 * Fetch all Pokemon card sets grouped by series
 */
export const fetchPokemonSets = async (): Promise<{ [key: string]: PokemonSet[] }> => {
  // Try local data first
  try {
    const data = await fetchLocalData('sets.json');
    if (data && data.data) {
      console.log('✅ Using local sets data');
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
    }
  } catch (error) {
    console.warn('Local sets data not available, using API');
  }

  // Fallback to API
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
    CACHE_DURATIONS.VERY_LONG
  );
};

/**
 * Fetch cards from a specific set
 */
export const fetchCardsBySet = async (
  setId: string,
  searchTerm?: string,
  cardType: SearchType = "all",
  page = 1,
  pageSize = 24
): Promise<{
  cards: PokemonCard[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> => {
  // Try local data first
  try {
    const data = await fetchLocalData(`sets/${setId}/cards.json`);
    if (data && data.data) {
      console.log(`✅ Using local cards data for set ${setId}`);
      let cards: PokemonCard[] = data.data || [];

      // Filter by card type
      if (cardType !== "all") {
        cards = cards.filter(card => {
          if (cardType === "pokemon") return card.supertype?.toLowerCase() === "pokémon";
          if (cardType === "trainer") return card.supertype?.toLowerCase() === "trainer";
          if (cardType === "energy") return card.supertype?.toLowerCase() === "energy";
          return true;
        });
      }

      // Filter by search term
      if (searchTerm && searchTerm.trim() !== '') {
        const term = searchTerm.trim().toLowerCase();
        cards = cards.filter(card => {
          if (/^\d+$/.test(term)) {
            return card.number?.toLowerCase().includes(term);
          }
          return card.name?.toLowerCase().includes(term);
        });
      }

      // Sort by number
      cards.sort((a, b) => {
        const numA = parseInt(a.number) || 0;
        const numB = parseInt(b.number) || 0;
        return numA - numB;
      });

      // Pagination
      const totalCount = cards.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedCards = cards.slice(startIndex, endIndex);

      return {
        cards: paginatedCards,
        totalCount,
        page,
        pageSize,
        totalPages
      };
    }
  } catch (error) {
    console.warn(`Local cards data not available for set ${setId}, using API`);
  }

  // Fallback to API
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

  const url = `${POKEMON_TCG_API_URL}/cards?q=${encodeURIComponent(query)}&orderBy=number&page=${page}&pageSize=${pageSize}`;

  const duration = searchTerm ? 0 : CACHE_DURATIONS.LONG;

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
        console.error("Error fetching cards:", error);
        return {
          cards: [],
          totalCount: 0,
          page,
          pageSize,
          totalPages: 0
        };
      }
    },
    duration
  );
};

/**
 * Fetch details for a specific set
 */
export const fetchSetDetails = async (setId: string): Promise<PokemonSet | null> => {
  // Try local data first
  try {
    const data = await fetchLocalData('sets.json');
    if (data && data.data) {
      const set = data.data.find((s: PokemonSet) => s.id === setId);
      if (set) {
        console.log(`✅ Using local set details for ${setId}`);
        return set;
      }
    }
  } catch (error) {
    console.warn(`Local set details not available for ${setId}, using API`);
  }

  // Fallback to API
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
    CACHE_DURATIONS.VERY_LONG
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

  // Try local search first
  try {
    const index = await fetchLocalData('index.json');
    if (index && index.sets) {
      console.log('✅ Using local search');
      const allCards: PokemonCard[] = [];

      // Load cards from all sets
      for (const set of index.sets) {
        try {
          const setData = await fetchLocalData(`sets/${set.id}/cards.json`);
          if (setData && setData.data) {
            allCards.push(...setData.data);
          }
        } catch (error) {
          // Skip sets that fail to load
        }
      }

      // Filter by search term
      const term = searchTerm.trim().toLowerCase();
      let filteredCards = allCards.filter(card => {
        if (/^\d+$/.test(term)) {
          return card.number?.toLowerCase().includes(term);
        }
        return card.name?.toLowerCase().includes(term);
      });

      // Filter by card type
      if (cardType !== "all") {
        filteredCards = filteredCards.filter(card => {
          if (cardType === "pokemon") return card.supertype?.toLowerCase() === "pokémon";
          if (cardType === "trainer") return card.supertype?.toLowerCase() === "trainer";
          if (cardType === "energy") return card.supertype?.toLowerCase() === "energy";
          return true;
        });
      }

      // Sort by release date and number
      filteredCards.sort((a, b) => {
        const dateA = new Date(a.set?.releaseDate || 0).getTime();
        const dateB = new Date(b.set?.releaseDate || 0).getTime();
        if (dateA !== dateB) return dateB - dateA;

        const numA = parseInt(a.number) || 0;
        const numB = parseInt(b.number) || 0;
        return numA - numB;
      });

      // Pagination
      const totalCount = filteredCards.length;
      const totalPages = Math.ceil(totalCount / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedCards = filteredCards.slice(startIndex, endIndex);

      return {
        cards: paginatedCards,
        totalCount,
        page,
        pageSize,
        totalPages
      };
    }
  } catch (error) {
    console.warn('Local search not available, using API');
  }

  // Fallback to API
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
    CACHE_DURATIONS.SHORT
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
