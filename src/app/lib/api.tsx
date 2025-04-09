
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
  rarity?: string;
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
  tcgplayer?: {
    url?: string;
    updatedAt?: string;
    prices?: {
      normal?: {
        low?: number;
        mid?: number;
        high?: number;
        market?: number;
        directLow?: number;
      };
      holofoil?: {
        low?: number;
        mid?: number;
        high?: number;
        market?: number;
        directLow?: number;
      };
      reverseHolofoil?: {
        low?: number;
        mid?: number;
        high?: number;
        market?: number;
        directLow?: number;
      };
      "1stEditionHolofoil"?: {
        low?: number;
        mid?: number;
        high?: number;
        market?: number;
        directLow?: number;
      };
      "1stEditionNormal"?: {
        low?: number;
        mid?: number;
        high?: number;
        market?: number;
        directLow?: number;
      };
    };
  }
}

export type SearchType = "pokemon" | "trainer" | "energy" | "all";

// Define all Pokémon card types with their associated colors
export const POKEMON_TYPES = [
  "All Types",
  "Colorless",
  "Darkness",
  "Dragon",
  "Fairy",
  "Fighting",
  "Fire",
  "Grass",
  "Lightning",
  "Metal",
  "Psychic",
  "Water"
];

// Type color mapping for UI elements
export const TYPE_COLORS: { [key: string]: string } = {
  "All Types": "#777777",
  "Colorless": "#A8A878",
  "Darkness": "#705848",
  "Dragon": "#7038F8",
  "Fairy": "#EE99AC",
  "Fighting": "#C03028",
  "Fire": "#F08030",
  "Grass": "#78C850",
  "Lightning": "#F8D030",
  "Metal": "#B8B8D0",
  "Psychic": "#F85888",
  "Water": "#6890F0"
};

import axios from 'axios';
import Cookies from 'js-cookie';

const POKEMON_TCG_API_URL = 'https://api.pokemontcg.io/v2';
const LARAVEL_API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || 'http://localhost:8000/api';
const API_KEY = process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY;

const authApiClient = axios.create({
  baseURL: LARAVEL_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

authApiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const fetchWithAuth = async (url: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (API_KEY) {
    headers['X-Api-Key'] = API_KEY;
  }
  
  return fetch(url, { headers });
};

// ===== AUTH API FUNCTIONS =====

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResult {
  success: boolean;
  message?: string;
  errors?: Record<string, string>;
  user?: any;
  token?: string;
}

/**
 * Register a new user
 */
export const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
  try {
    const { data } = await authApiClient.post('/login', credentials);
    
    if (data.status === 'success' && data.data.token) {
      Cookies.set('auth_token', data.data.token, { expires: 7 });
      return { 
        success: true,
        user: {
          name: data.data.name,
          email: data.data.email
        },
        token: data.data.token
      };
    }
    return { success: false, message: 'Login failed' };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.error || 'Login failed',
      errors: error.response?.data?.error || {}
    };
  }
};

export const register = async (userData: RegisterData): Promise<AuthResult> => {
  try {
    const { data } = await authApiClient.post('/register', userData);
    
    if (data.status === 'success' && data.data.token) {
      Cookies.set('auth_token', data.data.token, { expires: 7 });
      return { 
        success: true,
        user: {
          name: data.data.name,
          email: data.data.email
        },
        token: data.data.token
      };
    }
    return { success: false, message: 'Registration failed' };
  } catch (error: any) {
    return { 
      success: false, 
      message: error.response?.data?.error || 'Registration failed',
      errors: error.response?.data?.error || {}
    };
  }
};
/**
 * Logout the current user
 */
export const logout = async (): Promise<boolean> => {
  try {
    await authApiClient.post('/logout');
    Cookies.remove('auth_token');
    return true;
  } catch (error) {
    console.error('Logout error:', error);
    Cookies.remove('auth_token');
    return false;
  }
};

/**
 * Get the current authenticated user
 */
export const getCurrentUser = async () => {
  try {
    const { data } = await authApiClient.get('/user');
    return { success: true, user: data };
  } catch (error) {
    Cookies.remove('auth_token');
    return { success: false };
  }
};

// ===== POKEMON TCG API FUNCTIONS =====

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

// Export the auth client for direct use
export { authApiClient };