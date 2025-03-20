"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchCardsBySet, fetchSetDetails, PokemonCard, PokemonSet } from "@/app/lib/api";
import CardGrid from "@/app/components/CardGrid";
import SetHeader from "@/app/components/SetHeader";


export default function PokeDex() {
  const searchParams = useSearchParams();
  const [setId, setSetId] = useState<string | null>(null);
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [setInfo, setSetInfo] = useState<PokemonSet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSetId(searchParams.get("setId"));
  }, [searchParams]);

  useEffect(() => {
    const loadData = async () => {
      if (!setId) return;
      setLoading(true);
      
      try {
        // Parallel data fetching voor betere performance
        const [fetchedCards, fetchedSetInfo] = await Promise.all([
          fetchCardsBySet(setId),
          fetchSetDetails(setId)
        ]);
        
        setCards(fetchedCards);
        setSetInfo(fetchedSetInfo);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [setId]);

  if (!setId) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-600">No set selected. Please select a set to view cards.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg">Loading cards...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {setInfo && <SetHeader setInfo={setInfo} />}
      
      {cards.length === 0 ? (
        <p className="text-center text-lg text-gray-600 my-12">Geen kaarten gevonden voor deze set.</p>
      ) : (
        <CardGrid cards={cards} />
      )}
    </div>
  );
}