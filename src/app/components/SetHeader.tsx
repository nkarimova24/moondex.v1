"use client";

import { useEffect, useState } from "react";
import { PokemonSet, PokemonCard, fetchCardsBySet } from "@/app/lib/api";
import { formatDate } from "@/app/lib/utils";
import { CircularProgress } from "@mui/material";

interface SetHeaderProps {
  setInfo: PokemonSet;
}

export default function SetHeader({ setInfo }: SetHeaderProps) {
  const [totalValue, setTotalValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const calculateSetValue = async () => {
      setLoading(true);
      try {
        const cards = await fetchCardsBySet(setInfo.id);
        
        let sum = 0;
        let validPrices = 0;
        
        cards.forEach(card => {
          const price = card.cardmarket?.prices?.trendPrice || 
                        card.cardmarket?.prices?.averageSellPrice || 
                        card.cardmarket?.prices?.lowPrice;
          
          if (price && price > 0) {
            sum += price;
            validPrices++;
          }
        });
        
        if (validPrices > 0) {
          setTotalValue(sum);
        } else {
          setTotalValue(null);
        }
      } catch (error) {
        console.error("Error calculating set value:", error);
        setTotalValue(null);
      } finally {
        setLoading(false);
      }
    };

    calculateSetValue();
  }, [setInfo.id]);

  return (
    <div 
      className="mb-4 overflow-hidden rounded-b-lg p-4"
      style={{ 
        background: "#1E1E1E",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)",
        borderBottom: "1px solid #333",
        marginTop: "-25px",
        borderTop: "none"
      }}
    >
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Set Logo Coming Soooon */}
        <div className="flex-shrink-0">
          {setInfo.images?.logo && (
            <div className="h-16 md:h-20 relative">
              <img 
                src={setInfo.images.logo} 
                alt={`${setInfo.name} logo`} 
                className="h-full object-contain"
              />
            </div>
          )}
        </div>

        {/* Set Info */}
        <div className="flex-grow text-center md:text-left">
          <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
            {setInfo.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-400">
            <span>{setInfo.series}</span>
            <span>•</span>
            <span>Released {formatDate(setInfo.releaseDate)}</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4 mt-2 md:mt-0">
          <div className="text-center px-3">
            <span className="block text-sm text-gray-400">Cards</span>
            <span className="text-xl font-bold text-white">{setInfo.total}</span>
          </div>
          
          <div 
            className="text-center px-3"
            style={{ borderLeft: "1px solid #333" }}
          >
            <span className="block text-sm text-gray-400">Value</span>
            {loading ? (
              <div className="flex justify-center py-1">
                <CircularProgress size={18} thickness={4} style={{ color: "#8A3F3F" }} />
              </div>
            ) : totalValue !== null ? (
              <span className="text-xl font-bold" style={{ color: "#7FC99F" }}>
                €{totalValue.toFixed(2)}
              </span>
            ) : (
              <span className="text-xl font-bold text-gray-500">N/A</span>
            )}
          </div>
        </div>
      </div>
      
      {/* Legalities */}
      {setInfo.legalities && (
        <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
          {Object.entries(setInfo.legalities).map(([format, status]) => (
            <span 
              key={format}
              className={`px-2 py-0.5 text-xs rounded ${
                status === 'Legal' 
                  ? 'bg-green-900 bg-opacity-20 text-green-400 border border-green-800' 
                  : 'bg-red-900 bg-opacity-20 text-red-400 border border-red-800'
              }`}
            >
              {format.charAt(0).toUpperCase() + format.slice(1)}: {status}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}