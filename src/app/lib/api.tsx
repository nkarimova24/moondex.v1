
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

export const fetchCardsBySet = async (setId: string): Promise<PokemonCard[]> => {
  try {
    const response = await fetchWithAuth(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}`);
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