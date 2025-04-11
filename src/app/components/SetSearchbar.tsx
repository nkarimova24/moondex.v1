"use client";

import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SetSearchbarProps {
  onSearch: (searchTerm: string) => void;
  value: string;
  placeholder?: string;
  isLoading?: boolean;
}

export default function SetSearchbar({ 
  onSearch, 
  value, 
  placeholder, 
  isLoading = false 
}: SetSearchbarProps) {
  const { t } = useLanguage();
  const [localSearchTerm, setLocalSearchTerm] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  
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
  
  const searchPlaceholder = placeholder || t("search.set.placeholder");
  
  return (
    <div className="w-full max-w-md">
      <div 
        className={`flex items-center rounded-md overflow-hidden transition-all duration-200 ${
          isFocused 
            ? 'ring-2 ring-opacity-50' 
            : 'ring-0'
        }`}
        style={{ 
          backgroundColor: "#2A2A2A",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
          border: "1px solid #3A3A3A",
        }}
      >
        <div className="flex items-center justify-center pl-3">
          {isLoading ? (
            <Loader2 size={18} className="text-gray-400 animate-spin" />
          ) : (
            <Search size={18} className="text-gray-400" />
          )}
        </div>
        
        <input
          type="text"
          value={localSearchTerm}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={searchPlaceholder}
          className="py-2.5 px-3 flex-grow outline-none text-white bg-transparent placeholder-gray-500 text-sm"
          aria-label={t("search.set.placeholder")}
          disabled={isLoading}
          style={{ caretColor: "#8A3F3F" }}
        />
        
        {localSearchTerm && (
          <button 
            onClick={handleClear}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            aria-label={t("search.clear")}
            disabled={isLoading}
            style={{ 
              backgroundColor: isLoading ? "transparent" : "rgba(0, 0, 0, 0.1)"
            }}
          >
            <X size={18} />
          </button>
        )}
        
        <button 
          onClick={() => onSearch(localSearchTerm)}
          className="py-2.5 px-4 transition-colors"
          aria-label={t("search.button")}
          disabled={isLoading}
          style={{ 
            backgroundColor: "#8A3F3F",
            color: "white",
            opacity: isLoading ? 0.7 : 1,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {t("search.button")}
        </button>
      </div>
    </div>
  );
}