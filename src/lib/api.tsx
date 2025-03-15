export interface PokemonSet {
    id: string;
    name: string;
    series: string;
    releaseDate: string;
  }
  
  export const fetchPokemonSets = async (): Promise<{ [key: string]: PokemonSet[] }> => {
    try {
      const response = await fetch("https://api.pokemontcg.io/v2/sets");
      const data = await response.json();
  
      const validSets: PokemonSet[] = data.data.filter((set: PokemonSet) => set.releaseDate);
  
      const sortedSets = validSets.sort((a, b) => {
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      });
  
      const groupedSets = sortedSets.reduce<{ [key: string]: PokemonSet[] }>((acc, set) => {
        if (!acc[set.series]) acc[set.series] = [];
        acc[set.series].push(set);
        return acc;
      }, {});
  
      const sortedSeries = Object.entries(groupedSets).sort(([_, setsA], [__, setsB]) => {
        const latestSetA = new Date(setsA[0].releaseDate).getTime();
        const latestSetB = new Date(setsB[0].releaseDate).getTime();
        return latestSetB - latestSetA;
      });
  
      return Object.fromEntries(sortedSeries);
    } catch (error) {
      console.error("Error fetching Pokémon sets:", error);
      return {}; 
    }
  };
  