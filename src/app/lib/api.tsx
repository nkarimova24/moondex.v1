export interface PokemonSet {
  id: string;
  name: string;
  series: string;
  releaseDate: string;
}

export interface PokemonCard {
  id: string;
  name: string;
  images: { small: string; large: string };
}


// # Fetching Sets & Series # //
export const fetchPokemonSets = async (): Promise<{ [key: string]: PokemonSet[] }> => {
  try {
    const response = await fetch("https://api.pokemontcg.io/v2/sets");
    const data = await response.json();

    const validSets: PokemonSet[] = data.data.filter((set: PokemonSet) => set.releaseDate);
    const sortedSets = validSets.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

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

// # Fetching Cards # //
export const fetchCardsBySet = async (setId: string): Promise<PokemonCard[]> => {
  try {
    const response = await fetch(`https://api.pokemontcg.io/v2/cards?q=set.id:${setId}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching cards:", error);
    return [];
  }
};
