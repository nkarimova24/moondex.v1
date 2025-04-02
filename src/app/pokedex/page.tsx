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
import HeaderToggleButton from "@/app/components/HeaderToggleButton";
import ToTopButton from "@/app/components/ToTopButton"; 
import CardFilters from "@/app/components/CardFilters";

export default function PokeDex() {
  const searchParams = useSearchParams();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [headerVisible, setHeaderVisible] = useState(true);
  
  const [setId, setSetId] = useState<string | null>(null);
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [setInfo, setSetInfo] = useState<PokemonSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [displayedCards, setDisplayedCards] = useState<PokemonCard[]>([]);
  const [sortOption, setSortOption] = useState("number-asc");
  
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
    if (!setId && !isGlobalSearch && !isPokemonSearch) return;
    
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      if (isPokemonSearch) {
        const results = await searchCardsByType(pokemonSearchTerm, "all", page, 24);
        const calculatedTotalPages = Math.ceil(results.totalCount / results.pageSize);
        
        if (append) {
          setCards(prev => [...prev, ...results.cards]);
        } else {
          setCards(results.cards);
        }
        
        setTotalPages(calculatedTotalPages);
        setTotalResults(results.totalCount);
        setHasMore(page < calculatedTotalPages);
      } else if (isGlobalSearch) {
        const results = await searchCardsByType(globalSearchTerm, "all", page, 24);
        const calculatedTotalPages = Math.ceil(results.totalCount / results.pageSize);
        
        if (append) {
          setCards(prev => [...prev, ...results.cards]);
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
    if (cards.length === 0) {
      setDisplayedCards([]);
      return;
    }
    
    let sortedCards = [...cards];
    
    switch (sortOption) {
      case 'number-asc':
        sortedCards.sort((a, b) => parseInt(a.number || '0') - parseInt(b.number || '0'));
        break;
      case 'number-desc':
        sortedCards.sort((a, b) => parseInt(b.number || '0') - parseInt(a.number || '0'));
        break;
      case 'name-asc':
        sortedCards.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sortedCards.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price-asc':
        sortedCards.sort((a, b) => {
          const priceA = a.cardmarket?.prices?.trendPrice || 
                       a.cardmarket?.prices?.averageSellPrice || 
                       a.cardmarket?.prices?.lowPrice || 0;
          const priceB = b.cardmarket?.prices?.trendPrice || 
                       b.cardmarket?.prices?.averageSellPrice || 
                       b.cardmarket?.prices?.lowPrice || 0;
          return priceA - priceB;
        });
        break;
      case 'price-desc':
        sortedCards.sort((a, b) => {
          const priceA = a.cardmarket?.prices?.trendPrice || 
                       a.cardmarket?.prices?.averageSellPrice || 
                       a.cardmarket?.prices?.lowPrice || 0;
          const priceB = b.cardmarket?.prices?.trendPrice || 
                       b.cardmarket?.prices?.averageSellPrice || 
                       b.cardmarket?.prices?.lowPrice || 0;
          return priceB - priceA;
        });
        break;
      case 'rarity':

      const rarityOrder: { [key: string]: number } = {
          'Common': 1,
          'Uncommon': 2,
          'Rare': 3,
          'Rare Holo': 4,
          'Rare Ultra': 5,
          'Rare Rainbow': 6,
          'Rare Secret': 7,
          'Promo': 8
        };
        
        sortedCards.sort((a, b) => {
          const rarityA = a.rarity ? rarityOrder[a.rarity] || 0 : 0;
          const rarityB = b.rarity ? rarityOrder[b.rarity] || 0 : 0;
          return rarityB - rarityA;
        });
        break;
      case 'hp-desc':
        sortedCards.sort((a, b) => parseInt(b.hp || '0', 10) - parseInt(a.hp || '0', 10));
        break;
    }

    setDisplayedCards(sortedCards);
    
    if (!loading && !loadingMore) {
      setIsSearching(false);
    }
  }, [cards, sortOption, loading, loadingMore]);
  
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
    setCurrentPage(nextPage);
    loadCards(nextPage, true);
  }, [currentPage, loadingMore, hasMore, loadCards]);

  const handleSortChange = (value: string) => {
    setSortOption(value);
  };

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
      <div className="sticky top-0 z-10 bg-[#1A1A1A]">
        {!isPokemonSearch && !isGlobalSearch && setInfo && (
          <div className="relative pt-0">
            {headerVisible && <SetHeader setInfo={setInfo} />}
            
            <HeaderToggleButton 
              isVisible={headerVisible} 
              onClick={() => setHeaderVisible(!headerVisible)}
              setName={setInfo.name}
            />
          </div>
        )}

        {isPokemonSearch ? (
          <h1 className="text-2xl font-bold mb-4 text-white">
            Zoekresultaten voor "{pokemonSearchTerm}"
          </h1>
        ) : isGlobalSearch ? (
          <h1 className="text-2xl font-bold mb-4 text-white">
            Zoekresultaten voor "{globalSearchTerm}"
          </h1>
        ) : null}
        
        {!isGlobalSearch && !isPokemonSearch && (
          <div className="pb-4">
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="w-full md:w-8/12">
                <SetSearchbar 
                  onSearch={handleSearch} 
                  value={searchTerm}
                  placeholder="Search for a card in this set..." 
                  isLoading={isSearching || loading}
                />
              </div>
              
              {!loading && cards.length > 0 && (
                <div className="w-full md:w-4/12">
                  <CardFilters
                    value={sortOption}
                    onChange={handleSortChange}
                    disabled={loading || loadingMore}
                  />
                </div>
              )}
            </div>
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
                  ? ` voor "${pokemonSearchTerm}"`
                  : isGlobalSearch 
                    ? ` voor "${globalSearchTerm}"` 
                    : searchTerm && ` voor "${searchTerm}"`}
                {totalResults > displayedCards.length && ` (${displayedCards.length} geladen)`}
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

      <ToTopButton />
    </div>
  );
}