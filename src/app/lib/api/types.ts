// Pokemon API types
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
  
  export interface User {
    id?: number;
    name: string;
    email: string;
    avatar?: string;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface AuthResult {
    success: boolean;
    message?: string;
    errors?: Record<string, string>;
    user?: User;
    token?: string;
  }

  // Notes API interfaces
  export interface CardNote {
    id: number;
    user_id: number;
    card_id: string;
    collection_id?: number | null;
    deck_id?: number | null;
    content: string;
    created_at: string;
    updated_at: string;
  }

  export interface CreateNoteRequest {
    card_id: string;
    collection_id?: number | null;
    deck_id?: number | null;
    content: string;
  }

  export interface UpdateNoteRequest {
    content: string;
  }

  export interface NoteResponse {
    id: number;
    user_id: number;
    card_id: string;
    collection_id?: number | null;
    deck_id?: number | null;
    content: string;
    created_at: string;
    updated_at: string;
  }

  export interface UpdateProfileData {
    name?: string;
    avatar?: File;
  }