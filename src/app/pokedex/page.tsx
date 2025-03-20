// app/pokedex/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { 
  fetchCardsBySet, 
  fetchSetDetails, 
  searchPokemonByName,
  searchCards, 
  PokemonCard, 
  PokemonSet 
} from "@/app/lib/api";
import CardGrid from "@/app/components/CardGrid";
import SetHeader from "@/app/components/SetHeader";
import SetSearchbar from "@/app/components/SetSearchbar";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PokeDex() {
  const searchParams = useSearchParams();
  
  const [setId, setSetId] = useState<string | null>(null);
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [setInfo, setSetInfo] = useState<PokemonSet | null>(null);
  const [loading, setLoading] = useState(true);
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
  
  const loadCards = useCallback(async () => {
    if (!setId && !isGlobalSearch && !isPokemonSearch) return;
    setLoading(true);
    
    try {
      if (isPokemonSearch) {

        const results = await searchPokemonByName(pokemonSearchTerm, currentPage, 24);
        setCards(results.cards);
        setTotalPages(results.totalPages);
        setTotalResults(results.totalCount);
      } else if (isGlobalSearch) {

        const results = await searchCards(globalSearchTerm, currentPage, 24);
        setCards(results.cards);
        setTotalPages(results.totalPages);
        setTotalResults(results.totalCount);
      } else {

        const fetchedCards = await fetchCardsBySet(setId!, searchTerm);
        setCards(fetchedCards);
        setTotalPages(1); 
        setTotalResults(fetchedCards.length);
      }
    } catch (error) {
      console.error("Error loading cards:", error);
    } finally {
      setLoading(false);
    }
  }, [setId, searchTerm, isGlobalSearch, isPokemonSearch, globalSearchTerm, pokemonSearchTerm, currentPage]);
  
  useEffect(() => {
    loadCards();
  }, [loadCards]);

  useEffect(() => {
    if (!loading) {
      setDisplayedCards(cards);
      setIsSearching(false);
    }
  }, [cards, loading]);
  
  const handleSearch = useCallback((term: string) => {
    if (isGlobalSearch || isPokemonSearch) return; 
    
    setIsSearching(true);
    setSearchTerm(term);
  }, [isGlobalSearch, isPokemonSearch]);
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const renderEmptyState = () => {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-300">
          {isPokemonSearch 
            ? `Geen Pokémon gevonden met naam "${pokemonSearchTerm}".`
            : isGlobalSearch 
              ? `Geen kaarten gevonden voor "${globalSearchTerm}".`
              : searchTerm 
                ? `Geen kaarten gevonden voor "${searchTerm}" in deze set.` 
                : "Geen kaarten gevonden voor deze set."}
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
            {isPokemonSearch || isGlobalSearch ? "Terug" : "Zoekopdracht wissen"}
          </button>
        )}
      </div>
    );
  };

  const renderLoadingState = () => {
    if (loading && !isSearching) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-300">Kaarten worden geladen...</p>
        </div>
      );
    }
    
    if (isSearching) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg text-gray-300">Zoeken naar kaarten...</p>
        </div>
      );
    }
    
    return null;
  };

  const renderPagination = () => {
    if ((!isGlobalSearch && !isPokemonSearch) || totalPages <= 1) return null;
    
    return (
      <div className="flex justify-center items-center mt-8 gap-4">
        <button 
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
          className={`flex items-center px-4 py-2 rounded-md ${
            currentPage === 1 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          <ArrowLeft size={16} className="mr-2" />
          Vorige
        </button>
        
        <span className="text-gray-300">
          Pagina {currentPage} van {totalPages}
        </span>
        
        <button 
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={`flex items-center px-4 py-2 rounded-md ${
            currentPage === totalPages 
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          Volgende
          <ArrowRight size={16} className="ml-2" />
        </button>
      </div>
    );
  };

  if (!setId && !isGlobalSearch && !isPokemonSearch) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-300">Geen set geselecteerd. Selecteer een set om kaarten te bekijken.</p>
      </div>
    );
  }

  const loadingState = renderLoadingState();
  
  return (
    <div className="container mx-auto px-4 py-4">
      {isPokemonSearch ? (
        <h1 className="text-2xl font-bold mb-4 text-white">
          Pokémon zoekresultaten voor "{pokemonSearchTerm}"
        </h1>
      ) : isGlobalSearch ? (
        <h1 className="text-2xl font-bold mb-4 text-white">
          Zoekresultaten voor "{globalSearchTerm}"
        </h1>
      ) : (
        setInfo && <SetHeader setInfo={setInfo} />
      )}
      
      {!isGlobalSearch && !isPokemonSearch && (
       <div className="grid grid-cols-12 gap-4 mb-6">
       <div className="col-span-4 col-start-1">
      <SetSearchbar 
        onSearch={handleSearch} 
        value={searchTerm}
        placeholder="Zoek naar kaarten in deze set..." 
        isLoading={isSearching || loading}
      />
    </div>
  </div>
      )}
      
      {loadingState || (
        <>
          {displayedCards.length === 0 ? (
            renderEmptyState()
          ) : (
            <div>
              <p className="mb-4 text-gray-400">
                {totalResults} {totalResults === 1 ? "kaart" : "kaarten"} gevonden
                {isPokemonSearch 
                  ? ` voor Pokémon "${pokemonSearchTerm}"`
                  : isGlobalSearch 
                    ? ` voor "${globalSearchTerm}"` 
                    : searchTerm && ` voor "${searchTerm}"`}
                {(isPokemonSearch || isGlobalSearch) && totalPages > 1 && ` - Pagina ${currentPage} van ${totalPages}`}
              </p>
              
              <CardGrid cards={displayedCards} />
              
              {renderPagination()}
            </div>
          )}
        </>
      )}
    </div>
  );
}