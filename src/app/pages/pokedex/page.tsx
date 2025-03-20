"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { fetchCardsBySet, fetchSetDetails, PokemonCard, PokemonSet } from "@/app/lib/api";
import CardGrid from "@/app/components/CardGrid";
import SetHeader from "@/app/components/SetHeader";
import SetSearchbar from "@/app/components/SetSearchbar";

export default function PokeDex() {
  const searchParams = useSearchParams();
  
  const [setId, setSetId] = useState<string | null>(null);
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [setInfo, setSetInfo] = useState<PokemonSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [displayedCards, setDisplayedCards] = useState<PokemonCard[]>([]);

  useEffect(() => {
    setSetId(searchParams.get("setId"));
  }, [searchParams]);

  useEffect(() => {
    const loadSetInfo = async () => {
      if (!setId) return;
      
      try {
        const fetchedSetInfo = await fetchSetDetails(setId);
        setSetInfo(fetchedSetInfo);
      } catch (error) {
        console.error("Error loading set info:", error);
      }
    };

    loadSetInfo();
  }, [setId]);
  
  const loadCards = useCallback(async () => {
    if (!setId) return;
    setLoading(true);
    
    try {
      const fetchedCards = await fetchCardsBySet(setId, searchTerm);
      setCards(fetchedCards);
    } catch (error) {
      console.error("Error loading cards:", error);
    } finally {
      setLoading(false);
    }
  }, [setId, searchTerm]);
  
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
    setIsSearching(true);
    setSearchTerm(term);
  }, []);
  
  const renderEmptyState = () => {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">
          {searchTerm 
            ? `Geen kaarten gevonden voor "${searchTerm}" in deze set.` 
            : "Geen kaarten gevonden voor deze set."}
        </p>
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Zoekopdracht wissen
          </button>
        )}
      </div>
    );
  };

  const renderLoadingState = () => {
    if (loading && !isSearching) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Kaarten worden geladen...</p>
        </div>
      );
    }
    
    if (isSearching) {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Zoeken naar kaarten...</p>
        </div>
      );
    }
    
    return null;
  };

  const renderResults = () => {
    if (displayedCards.length === 0) {
      return renderEmptyState();
    }
    
    return (
      <div>
        <p className="mb-4 text-gray-600">
          {displayedCards.length} {displayedCards.length === 1 ? "kaart" : "kaarten"} gevonden
          {searchTerm && ` voor "${searchTerm}"`}
        </p>
        <CardGrid cards={displayedCards} />
      </div>
    );
  };

  if (!setId) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-600">Geen set geselecteerd. Selecteer een set om kaarten te bekijken.</p>
      </div>
    );
  }

  const loadingState = renderLoadingState();

  return (
    <div className="container mx-auto px-4">
      {setInfo && <SetHeader setInfo={setInfo} />}
      
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
      
      {loadingState || renderResults()}
    </div>
  );
}