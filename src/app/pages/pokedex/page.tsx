"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchCardsBySet, PokemonCard } from "@/app/lib/api";

export default function PokeDex() {
  const searchParams = useSearchParams();
  const [setId, setSetId] = useState<string | null>(null);

  useEffect(() => {
    setSetId(searchParams.get("setId"));
  }, [searchParams]);

  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCards = async () => {
      if (!setId) return;
      setLoading(true);
      const fetchedCards = await fetchCardsBySet(setId);
      setCards(fetchedCards);
      setLoading(false);
    };

    loadCards();
  }, [setId]);

  if (!setId) return <p>No set selected.</p>;
  if (loading) return <p>Loading cards...</p>;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: "10px", padding: "20px" }}>
      {cards.map((card) => (
        <div key={card.id} style={{ textAlign: "center" }}>
          <img src={card.images.small} alt={card.name} style={{ width: "100%" }} />
          <p>{card.name}</p>
        </div>
      ))}
    </div>
  );
}
