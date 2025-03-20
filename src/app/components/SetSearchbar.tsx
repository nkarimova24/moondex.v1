"use client";

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface SetSearchbarProps {
  onSearch: (searchTerm: string) => void;
  value: string;
  placeholder?: string;
  isLoading?: boolean;
}

export default function SetSearchbar({ 
  onSearch, 
  value, 
  placeholder = "Searching for cards in this set..", 
  isLoading = false 
}: SetSearchbarProps) {
  const [localSearchTerm, setLocalSearchTerm] = useState(value);
  
  useEffect(() => {
    setLocalSearchTerm(value);
  }, [value]);
  
  useEffect(() => {
    if (localSearchTerm === value) return;
    
    const timer = setTimeout(() => {
      onSearch(localSearchTerm);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [localSearchTerm, onSearch, value]);
  
  const handleClear = () => {
    setLocalSearchTerm('');
    onSearch('');
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
  };
  
  return (
    <div className="w-full">
      <div className={`flex items-center border-2 border-gray-700 rounded-md overflow-hidden focus-within:border-blue-500 bg-[#333] ${isLoading ? 'opacity-70' : ''}`}>
        <input
          type="text"
          value={localSearchTerm}
          onChange={handleChange}
          placeholder={placeholder}
          className="py-2 px-3 pl-4 flex-grow outline-none text-white bg-transparent"
          aria-label="Zoek naar kaarten"
          disabled={isLoading}
        />
        
        {localSearchTerm && (
          <button 
            onClick={handleClear}
            className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
            aria-label="Zoekopdracht wissen"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        )}
        
        <button 
          onClick={() => onSearch(localSearchTerm)}
          className="p-2 pr-4 text-gray-400 hover:text-blue-400 transition-colors"
          aria-label="Zoeken"
          disabled={isLoading}
        >
          <Search size={20} />
        </button>
      </div>
    </div>
  );
}