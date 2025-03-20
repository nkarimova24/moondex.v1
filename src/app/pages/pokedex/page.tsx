"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchCardsBySet, PokemonCard } from "@/app/lib/api";
import CardGrid from "@/app/components/CardGrid";

export default function PokeDex() {
  const searchParams = useSearchParams();
  const [setId, setSetId] = useState<string | null>(null);
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSetId(searchParams.get("setId"));
  }, [searchParams]);

  useEffect(() => {
    const loadCards = async () => {
      if (!setId) return;
      setLoading(true);
      try {
        const fetchedCards = await fetchCardsBySet(setId);
        setCards(fetchedCards);
      } catch (error) {
        console.error("Error loading cards:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCards();
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
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold my-4">Pokemon Cards</h1>
      {cards.length === 0 ? (
        <p className="text-center text-lg text-gray-600">No cards found for this set.</p>
      ) : (
        <CardGrid cards={cards} />
      )}
    </div>
  );
}