"use client";

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GlobalSearchbarProps {
  isLoading?: boolean;
}

export default function GlobalSearchbar({ isLoading = false }: GlobalSearchbarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  
  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/pokedex?pokemonSearch=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  // Reset the search
  const handleClear = () => {
    setSearchTerm('');
  };
  
  return (
    <div className="w-full bg-[#1a1a1a] py-3 px-4 sticky top-0 z-10 border-b border-[#333]">
      <form onSubmit={handleSubmit}>
        <div className={`flex items-center border border-[#444] rounded-md overflow-hidden focus-within:border-[#666] bg-[#333] ${isLoading ? 'opacity-70' : ''}`}>
          <button 
            type="submit"
            className="p-2 text-gray-400 hover:text-white"
            disabled={isLoading}
            aria-label="Zoeken"
          >
            <Search size={20} />
          </button>
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Zoek Pokémon op naam..."
            className="py-2 px-3 flex-grow outline-none text-white bg-transparent"
            aria-label="Zoek Pokémon op naam"
            disabled={isLoading}
          />
          
          {searchTerm && (
            <button 
              onClick={handleClear}
              type="button"
              className="p-2 text-gray-400 hover:text-white"
              aria-label="Zoekopdracht wissen"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}