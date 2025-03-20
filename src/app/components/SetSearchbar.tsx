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
  placeholder = "Search", 
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
    <div className="relative w-full max-w-md mx-auto mb-6">
      <div className={`flex items-center border-2 border-gray-300 rounded-md overflow-hidden focus-within:border-blue-500 bg-white ${isLoading ? 'opacity-70' : ''}`}>
        <span className="p-2 text-gray-500">
          <Search size={20} />
        </span>
        
        <input
          type="text"
          value={localSearchTerm}
          onChange={handleChange}
          placeholder={placeholder}
          className="py-2 px-3 flex-grow outline-none text-gray-800"
          aria-label="Zoek naar kaarten"
          disabled={isLoading}
        />
        
        {localSearchTerm && (
          <button 
            onClick={handleClear}
            className="p-2 text-gray-500 hover:text-gray-700"
            aria-label="Zoekopdracht wissen"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
}