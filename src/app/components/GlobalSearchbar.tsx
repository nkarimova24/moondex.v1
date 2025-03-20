"use client";

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface GlobalSearchbarProps {
  isLoading?: boolean;
}

export default function GlobalSearchbar({ isLoading = false }: GlobalSearchbarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    setSearchTerm('');
  }, [pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/pokedex?pokemonSearch=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  const handleClear = () => {
    setSearchTerm('');
  };
  
  return (
    <div className="w-full py-3 px-4 border-b border-[#333]">
      <div className="flex justify-end">
        <div className="relative w-full max-w-md">
          <form onSubmit={handleSubmit} className="relative">
            <div 
              className={`flex items-center border-2 rounded-full overflow-hidden transition-all duration-200 ${
                isFocused 
                  ? 'bg-[#262626] shadow-lg' 
                  : 'border-[#444] bg-[#333] shadow'
              }`}
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search.."
                className="py-2 px-3 pl-4 flex-grow outline-none text-white bg-transparent text-lg"
                aria-label="Zoek kaarten"
                disabled={isLoading}
              />
              
              {searchTerm && (
                <button 
                  onClick={handleClear}
                  type="button"
                  className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                  aria-label="Zoekopdracht wissen"
                  disabled={isLoading}
                >
                  <X size={20} />
                </button>
              )}
              
              <button 
                type="submit"
                className="p-2 pr-4 text-gray-400 hover:text-blue-400 transition-colors"
                disabled={isLoading}
                aria-label="Zoeken"
              >
                <Search size={20} />
              </button>
            </div>
            
            {isLoading && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 animate-pulse"></div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}