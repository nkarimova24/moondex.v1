"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  fetchCardsBySet, 
  fetchSetDetails, 
  searchCardsByType,
  PokemonCard, 
  PokemonSet
} from "@/app/lib/api";
import CardGrid from "@/app/components/CardGrid";
import SetHeader from "@/app/components/SetHeader";
import SetSearchbar from "@/app/components/SetSearchbar";

export default function PokeDex() {
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const [setId, setSetId] = useState<string | null>(null);
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [setInfo, setSetInfo] = useState<PokemonSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [displayedCards, setDisplayedCards] = useState<PokemonCard[]>([]);
  
  const [isPokemonSearch, setIsPokemonSearch] = useState(false);
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [pokemonSearchTerm, setPokemonSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const pokemonSearchParam = searchParams.get("pokemonSearch");
    if (pokemonSearchParam) {
      setPokemonSearchTerm(pokemonSearchParam);
      setIsPokemonSearch(true);
      setIsGlobalSearch(false);
      setSetId(null); 
    } 
    else {
      const globalSearchParam = searchParams.get("globalSearch");
      if (globalSearchParam) {
        setGlobalSearchTerm(globalSearchParam);
        setIsGlobalSearch(true);
        setIsPokemonSearch(false);
        setSetId(null); 
      } else {
        setIsGlobalSearch(false);
        setIsPokemonSearch(false);
        setGlobalSearchTerm('');
        setPokemonSearchTerm('');
        setSetId(searchParams.get("setId"));
      }
    }
    
    setCurrentPage(1);
    setCards([]);
    setDisplayedCards([]);
    setHasMore(false);
  }, [searchParams]);

  useEffect(() => {
    const loadSetInfo = async () => {
      if (!setId || isGlobalSearch || isPokemonSearch) {
        setSetInfo(null);
        return;
      }
      
      try {
        const fetchedSetInfo = await fetchSetDetails(setId);
        setSetInfo(fetchedSetInfo);
      } catch (error) {
        console.error("Error loading set info:", error);
      }
    };

    loadSetInfo();
  }, [setId, isGlobalSearch, isPokemonSearch]);
  
  const loadCards = useCallback(async (page = 1, append = false) => {
    console.log("Loading cards for page:", page, "append:", append);
    
    if (!setId && !isGlobalSearch && !isPokemonSearch) return;
    
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      if (isPokemonSearch) {
        const results = await searchCardsByType(pokemonSearchTerm, "all", page, 24);
        console.log(`Loaded ${results.cards.length} cards for page ${page}`, results);
        
        const calculatedTotalPages = Math.ceil(results.totalCount / results.pageSize);
        console.log(`API reported totalPages: ${results.totalPages}, Calculated totalPages: ${calculatedTotalPages}`);
        
        if (append) {
          setCards(prev => {
            const newCards = [...prev, ...results.cards];
            console.log(`Appended cards: ${prev.length} + ${results.cards.length} = ${newCards.length}`);
            return newCards;
          });
        } else {
          setCards(results.cards);
        }
        
        setTotalPages(calculatedTotalPages);
        setTotalResults(results.totalCount);
        setHasMore(page < calculatedTotalPages);
      } else if (isGlobalSearch) {
        const results = await searchCardsByType(globalSearchTerm, "all", page, 24);
        console.log(`Loaded ${results.cards.length} cards for page ${page}`, results);
        
        const calculatedTotalPages = Math.ceil(results.totalCount / results.pageSize);
        console.log(`API reported totalPages: ${results.totalPages}, Calculated totalPages: ${calculatedTotalPages}`);
        
        if (append) {
          setCards(prev => {
            const newCards = [...prev, ...results.cards];
            console.log(`Appended cards: ${prev.length} + ${results.cards.length} = ${newCards.length}`);
            return newCards;
          });
        } else {
          setCards(results.cards);
        }
        
        setTotalPages(calculatedTotalPages);
        setTotalResults(results.totalCount);
        setHasMore(page < calculatedTotalPages);
      } else {
        const fetchedCards = await fetchCardsBySet(setId!, searchTerm);
        setCards(fetchedCards);
        setTotalPages(1); 
        setTotalResults(fetchedCards.length);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading cards:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [
    setId, 
    searchTerm, 
    isGlobalSearch, 
    isPokemonSearch, 
    globalSearchTerm, 
    pokemonSearchTerm
  ]);
  
  useEffect(() => {
    loadCards(1, false);
  }, [loadCards]);

  useEffect(() => {
    console.log("Cards updated:", cards.length);
    if (!loading && !loadingMore) {
      setDisplayedCards(cards);
      setIsSearching(false);
    }
  }, [cards, loading, loadingMore]);
  
  const handleSearch = useCallback((term: string) => {
    if (isGlobalSearch || isPokemonSearch) return; 
    
    setIsSearching(true);
    setSearchTerm(term);

    setCurrentPage(1);
    setCards([]);
  }, [isGlobalSearch, isPokemonSearch]);

  const handleLoadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    
    const nextPage = currentPage + 1;
    console.log("Manually loading more cards, page:", nextPage);
    setCurrentPage(nextPage);
    loadCards(nextPage, true);
  }, [currentPage, loadingMore, hasMore, loadCards]);

  const renderEmptyState = () => {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-300">
          {isPokemonSearch 
            ? `No cards found for "${pokemonSearchTerm}".`
            : isGlobalSearch 
              ? `No cards found for "${globalSearchTerm}".`
              : searchTerm 
                ? `No cards found for"${searchTerm}" in this set.` 
                : "No cards found in this set."}
        </p>
        {(isPokemonSearch || isGlobalSearch || searchTerm) && (
          <button 
            onClick={() => {
              if (isPokemonSearch || isGlobalSearch) {
                window.history.back();
              } else {
                setSearchTerm('');
              }
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {isPokemonSearch || isGlobalSearch ? "Back" : "Delete searchterm"}
          </button>
        )}
      </div>
    );
  };

  const renderLoadingState = () => {
    if (loading && !loadingMore) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-300">Cards are loading</p>
        </div>
      );
    }
    
    if (isSearching) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-300">Searching for cards</p>
        </div>
      );
    }
    
    return null;
  };

  if (!setId && !isGlobalSearch && !isPokemonSearch) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-300">No set selected, select a set to search for a specific card.</p>
      </div>
    );
  }

  const loadingState = renderLoadingState();
  
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="sticky top-0 z-10 bg-[#262626] pb-4 pt-2">
        {isPokemonSearch ? (
          <h1 className="text-2xl font-bold mb-4 text-white">
            Searchresults for "{pokemonSearchTerm}"
          </h1>
        ) : isGlobalSearch ? (
          <h1 className="text-2xl font-bold mb-4 text-white">
            Searchresults for "{globalSearchTerm}"
          </h1>
        ) : (
          setInfo && <SetHeader setInfo={setInfo} />
        )}
        
        {!isGlobalSearch && !isPokemonSearch && (
          <div className="mb-2">
            <SetSearchbar 
              onSearch={handleSearch} 
              value={searchTerm}
              placeholder="Search cards in this set..." 
              isLoading={isSearching || loading}
            />
          </div>
        )}
      </div>
      
      {loadingState || (
        <>
          {displayedCards.length === 0 ? (
            renderEmptyState()
          ) : (
            <div>
              <p className="mb-4 text-gray-400">
                {totalResults} {totalResults === 1 ? "card" : "cards"} found
                {isPokemonSearch 
                  ? ` for "${pokemonSearchTerm}"`
                  : isGlobalSearch 
                    ? ` for "${globalSearchTerm}"` 
                    : searchTerm && ` for "${searchTerm}"`}
                {totalResults > displayedCards.length && ` (${displayedCards.length} displayed)`}
              </p>
              
              <CardGrid cards={displayedCards} />
              
              <div className="my-8">
              {totalResults > displayedCards.length && (
                <button
                  onClick={handleLoadMore}
                  className="w-full py-3 text-white bg-[#8A3F3F] rounded-md hover:bg-[#6E2F2F] disabled:bg-gray-600 disabled:text-gray-400"
                  disabled={loadingMore}
                >
                  {loadingMore 
                    ? "Loading more cards..." 
                    : `(${displayedCards.length} of ${totalResults})`}
                </button>
              )}
              
              {!loadingMore && displayedCards.length >= totalResults && totalResults > 0 && (
                <div className="text-center text-gray-500 mt-4">
                  All cards are loaded
                </div>
              )}
            </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}