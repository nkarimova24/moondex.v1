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
  number: string;
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
  set?: {
    id: string;
    name: string;
    series: string;
    printedTotal?: number;
    total?: number;
    ptcgoCode?: string;
    releaseDate?: string;
    updatedAt?: string;
    images?: {
      symbol?: string;
      logo?: string;
    };
  }
  cardmarket?: {
    url?: string;
    updatedAt?: string;
    prices?: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
      germanProLow?: number;
      suggestedPrice?: number;
      reverseHoloSell?: number;
      reverseHoloLow?: number;
      reverseHoloTrend?: number;
      lowPriceExPlus?: number;
      avg1?: number;
      avg7?: number;
      avg30?: number;
      reverseHoloAvg1?: number;
      reverseHoloAvg7?: number;
      reverseHoloAvg30?: number;
    };
  };
}

export type SearchType = "pokemon" | "trainer" | "energy" | "all";

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
    
    const response = await fetchWithAuth(`https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&orderBy=number`);
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
      `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}&orderBy=set.releaseDate,number`
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

