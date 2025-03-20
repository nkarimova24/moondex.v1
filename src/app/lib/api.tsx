export interface PokemonSet {
  id: string;
  name: string;
  series: string;
  releaseDate: string;
  printedTotal?: number;
  total?: number;
  legalities?: {
    unlimited?: string;
    standard?: string;
    expanded?: string;
  };
  ptcgoCode?: string;
  updatedAt?: string;
  images?: {
    symbol?: string;
    logo?: string;
  };
}

export interface PokemonCard {
  id: string;
  name: string;
  images: { small: string; large: string };
  supertype?: string;
  subtypes?: string[];
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  evolvesTo?: string[];
  abilities?: {
    name: string;
    text: string;
    type: string;
  }[];
}

const API_KEY = process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY;

const fetchWithAuth = async (url: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (API_KEY) {
    headers['X-Api-Key'] = API_KEY;
  }
  
  return fetch(url, { headers });
};

export const fetchPokemonSets = async (): Promise<{ [key: string]: PokemonSet[] }> => {
  try {
    const response = await fetchWithAuth("https://api.pokemontcg.io/v2/sets");
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

export const fetchCardsBySet = async (setId: string, searchTerm?: string): Promise<PokemonCard[]> => {
  try {
    let query = `set.id:${setId}`;
    
    if (searchTerm && searchTerm.trim() !== '') {
      const sanitizedTerm = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query += ` name:"*${sanitizedTerm}*"`;
    }
    
    const response = await fetchWithAuth(`https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching cards:", error);
    return [];
  }
};

export const fetchSetDetails = async (setId: string): Promise<PokemonSet | null> => {
  try {
    const response = await fetchWithAuth(`https://api.pokemontcg.io/v2/sets/${setId}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching set details:", error);
    return null;
  }
};

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
  try {
    if (!pokemonName || pokemonName.trim() === '') {
      return {
        cards: [],
        totalCount: 0,
        page,
        pageSize,
        totalPages: 0
      };
    }
    
    const sanitizedName = pokemonName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // We voegen supertype:Pokémon toe om alleen Pokémon kaarten te krijgen (geen trainers, energie, etc.)
    const query = `name:"*${sanitizedName}*" supertype:pokémon`;
    
    const response = await fetchWithAuth(
      `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}&orderBy=name`
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
    console.error("Error searching Pokémon:", error);
    return {
      cards: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 0
    };
  }
};

export const searchCards = async (searchTerm: string, page = 1, pageSize = 20): Promise<{
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
    const query = `name:"*${sanitizedTerm}*"`;
    
    const response = await fetchWithAuth(
      `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`
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