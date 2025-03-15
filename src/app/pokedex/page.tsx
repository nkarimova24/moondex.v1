"use client";

import { useEffect, useState } from "react";
import { fetchCardsBySet, PokemonCard } from "@/app/lib/api";

interface PokeDexProps {
  setId: string;
}

export default function PokeDex({ setId }: PokeDexProps) {
  const [cards, setCards] = useState<PokemonCard[]>([]);
  const [loading, setLoading] = useState(true);

  if (!setId) return null;

  useEffect(() => {
    const loadCards = async () => {
      setLoading(true);
      const fetchedCards = await fetchCardsBySet(setId);
      setCards(fetchedCards);
      setLoading(false);
    };

    loadCards();
  }, [setId]);

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
