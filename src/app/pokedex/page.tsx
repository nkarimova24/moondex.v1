"use client";

import { Suspense } from 'react';
import { useEffect, useState, useCallback} from "react";
import { useSearchParams } from "next/navigation";
import { 
  fetchCardsBySet, 
  fetchSetDetails, 
  searchCardsByType,
} from "@/app/lib/api/pokemon";
import { PokemonCard, PokemonSet } from "@/app/lib/api/types";
import { sortCards } from "@/app/lib/sortUtils";
import CardGrid from "@/app/components/CardGrid";
import SetHeader from "@/app/components/SetHeader";
import SetSearchbar from "@/app/components/SetSearchbar";
import HeaderToggleButton from "@/app/components/HeaderToggleButton";
import ToTopButton from "@/app/components/ToTopButton"; 
import CardFilters from "@/app/components/CardFilters";
import { useLanguage } from "@/context/LanguageContext";

function PokeDexContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
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
  const [selectedType, setSelectedType] = useState("All Types");
  
  const [isPokemonSearch, setIsPokemonSearch] = useState(false);
  const [isGlobalSearch, setIsGlobalSearch] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [pokemonSearchTerm, setPokemonSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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
        
        // Update document title when set info is loaded
        if (fetchedSetInfo && fetchedSetInfo.name) {
          document.title = `${fetchedSetInfo.name} - MoonDex`;
        }
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
        
        setTotalResults(results.totalCount);
        setHasMore(page < calculatedTotalPages);
      } else {
        const fetchedCards = await fetchCardsBySet(setId!, searchTerm);
        setCards(fetchedCards);
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
    
    let filteredCards = [...cards];
    
    if (selectedType !== "All Types") {
      filteredCards = filteredCards.filter(card => 
        card.types && card.types.includes(selectedType)
      );
    }
    
    const sortedCards = sortCards(filteredCards, sortOption);
    setDisplayedCards(sortedCards);
    
    if (!loading && !loadingMore) {
      setIsSearching(false);
    }
  }, [cards, sortOption, selectedType, loading, loadingMore]);
  
  useEffect(() => {
    // Update title based on search/set info
    if (setId && setInfo && setInfo.name) {
      document.title = `${setInfo.name} - MoonDex`;
    } else if (isPokemonSearch) {
      document.title = `${pokemonSearchTerm} - MoonDex`;
    } else if (isGlobalSearch) {
      document.title = `${globalSearchTerm} - MoonDex`;
    } else {
      document.title = "MoonDex";
    }
    
    return () => {
      // Reset title when component unmounts
      document.title = "MoonDex";
    };
  }, [setId, setInfo, isGlobalSearch, isPokemonSearch, pokemonSearchTerm, globalSearchTerm]);
  
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
  
  const handleTypeChange = (type: string) => {
    setSelectedType(type);
  };

  const renderEmptyState = () => {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-300">
          {isPokemonSearch 
            ? `${t("search.noResults")} "${pokemonSearchTerm}".`
            : isGlobalSearch 
              ? `${t("search.noResults")} "${globalSearchTerm}".`
              : selectedType !== "All Types"
                ? `${t("search.noResults")} ${selectedType} ${t("search.typeCards")}${searchTerm ? ` ${t("search.for")} "${searchTerm}"` : ""}.`
                : searchTerm 
                  ? `${t("search.noResults")} ${t("search.for")} "${searchTerm}".` 
                  : t("search.noResults")}
        </p>
        {(isPokemonSearch || isGlobalSearch || searchTerm || selectedType !== "All Types") && (
          <button 
            onClick={() => {
              if (isPokemonSearch || isGlobalSearch) {
                window.history.back();
              } else if (selectedType !== "All Types") {
                setSelectedType("All Types");
              } else {
                setSearchTerm('');
              }
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {isPokemonSearch || isGlobalSearch 
              ? t("app.backToHome") 
              : selectedType !== "All Types" 
                ? "Show All Types" 
                : t("search.clear")}
          </button>
        )}
      </div>
    );
  };

  const renderLoadingState = () => {
    if (loading && !loadingMore) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-300">{t("misc.cardsAreLoading")}</p>
        </div>
      );
    }
    
    if (isSearching) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-300">{t("misc.searchingForCards")}</p>
        </div>
      );
    }
    
    return null;
  };

  if (!setId && !isGlobalSearch && !isPokemonSearch) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-300 px-4 text-center">{t("misc.noSetSelected")}</p>
      </div>
    );
  }

  const loadingState = renderLoadingState();
  
  return (
    <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
      <div className="sticky top-0 z-10 bg-[#1A1A1A] pb-2 sm:pb-4">
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
          <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-white px-2">
            {t("search.resultsFor")} &quot;{pokemonSearchTerm}&quot;
          </h1>
        ) : isGlobalSearch ? (
          <h1 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-white px-2">
            {t("search.resultsFor")} &quot;{globalSearchTerm}&quot;
          </h1>
        ) : null}
        
        {!isGlobalSearch && !isPokemonSearch && (
          <div className="pb-2 sm:pb-4 px-2">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="w-full sm:w-8/12">
                <SetSearchbar 
                  onSearch={handleSearch} 
                  value={searchTerm}
                  placeholder={t("search.set.placeholder")}
                  isLoading={isSearching || loading}
                />
              </div>
              
              {!loading && cards.length > 0 && (
                <div className="w-full sm:w-4/12 flex justify-center sm:justify-end">
                  <CardFilters
                    value={sortOption}
                    onChange={handleSortChange}
                    selectedType={selectedType}
                    onTypeChange={handleTypeChange}
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
            <div className="px-2">
              <p className="mb-2 sm:mb-4 text-sm sm:text-base text-gray-400">
                {displayedCards.length} {displayedCards.length === 1 ? t("set.cards").slice(0, -1) : t("set.cards")} {t("search.found")}
                {selectedType !== "All Types" && ` (${selectedType} ${t("filter.type").toLowerCase()})`}
                {isPokemonSearch 
                  ? ` ${t("search.for")} "${pokemonSearchTerm}"`
                  : isGlobalSearch 
                    ? ` ${t("search.for")} "${globalSearchTerm}"` 
                    : searchTerm && ` ${t("search.for")} "${searchTerm}"`}
                {totalResults > displayedCards.length && selectedType === "All Types" && ` (${displayedCards.length} ${t("search.loaded")})`}
              </p>
              
              <CardGrid cards={displayedCards} />
              
              <div className="my-4 sm:my-8">
              {totalResults > displayedCards.length && selectedType === "All Types" && (
                <button
                  onClick={handleLoadMore}
                  className="w-full py-2 sm:py-3 text-white bg-[#8A3F3F] rounded-md hover:bg-[#6E2F2F] disabled:bg-gray-600 disabled:text-gray-400 text-sm sm:text-base"
                  disabled={loadingMore}
                >
                  {loadingMore 
                    ? t("search.loadingMore")
                    : `(${displayedCards.length} ${t("search.of")} ${totalResults})`}
                </button>
              )}
              
              {(!loadingMore && displayedCards.length >= totalResults && totalResults > 0 && selectedType === "All Types") || 
               (selectedType !== "All Types" && displayedCards.length > 0) ? (
                <div className="text-center text-gray-500 mt-4 text-sm sm:text-base">
                  {selectedType !== "All Types" 
                    ? `${t("search.showingAll")} ${selectedType} ${t("search.typeCards")}` 
                    : t("search.allCardsLoaded")}
                </div>
              ) : null}
            </div>
            </div>
          )}
        </>
      )}

      <ToTopButton />
    </div>
  );
}

export default function PokeDex() {
  return (
    <Suspense fallback={<div className="text-gray-400 text-center py-12">Loading PokeDex...</div>}>
      <PokeDexContent />
    </Suspense>
  );
}