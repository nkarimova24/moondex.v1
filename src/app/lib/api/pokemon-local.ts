// Local data API client
// This reads from local JSON files instead of fetching from the API

import { PokemonSet, PokemonCard, SearchType } from './types';

// Check if we should use local data (file exists in public/data/)
const USE_LOCAL_DATA = typeof window !== 'undefined';

/**
 * Fetch data from local JSON files
 */
async function fetchLocalData(path: string): Promise<any> {
    try {
        const response = await fetch(`/data/${path}`);
        if (!response.ok) {
            throw new Error(`Failed to load local data: ${path}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error loading local data from ${path}:`, error);
        throw error;
    }
}

/**
 * Fetch all Pokemon card sets from local data
 */
export const fetchPokemonSetsLocal = async (): Promise<{ [key: string]: PokemonSet[] }> => {
    try {
        const data = await fetchLocalData('sets.json');

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
        console.error("Error fetching local Pokémon sets:", error);
        return {};
    }
};

/**
 * Fetch cards from a specific set from local data
 */
export const fetchCardsBySetLocal = async (
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
    try {
        const data = await fetchLocalData(`sets/${setId}/cards.json`);
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
                // Search by number if it's a number
                if (/^\d+$/.test(term)) {
                    return card.number?.toLowerCase().includes(term);
                }
                // Otherwise search by name
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
    } catch (error) {
        console.error(`Error fetching local cards for set ${setId}:`, error);
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
 * Fetch details for a specific set from local data
 */
export const fetchSetDetailsLocal = async (setId: string): Promise<PokemonSet | null> => {
    try {
        const data = await fetchLocalData('sets.json');
        const set = data.data.find((s: PokemonSet) => s.id === setId);
        return set || null;
    } catch (error) {
        console.error(`Error fetching local set details for ${setId}:`, error);
        return null;
    }
};

/**
 * Search cards across all sets from local data
 */
export const searchCardsByTypeLocal = async (
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

    try {
        // Load index to get all set IDs
        const index = await fetchLocalData('index.json');
        const allCards: PokemonCard[] = [];

        // Load cards from all sets
        for (const set of index.sets) {
            try {
                const setData = await fetchLocalData(`sets/${set.id}/cards.json`);
                allCards.push(...(setData.data || []));
            } catch (error) {
                console.warn(`Skipping set ${set.id}:`, error);
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
    } catch (error) {
        console.error("Error searching local cards:", error);
        return {
            cards: [],
            totalCount: 0,
            page,
            pageSize,
            totalPages: 0
        };
    }
};
