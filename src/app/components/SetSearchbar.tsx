"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update local state when parent value changes, but ONLY if it's different
  useEffect(() => {
    if (value !== localSearchTerm) {
      setLocalSearchTerm(value);
    }
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalSearchTerm(newValue);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set a new timeout
    timeoutRef.current = setTimeout(() => {
      onSearch(newValue);
    }, 500);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      onSearch(localSearchTerm);
    }
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
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
          ref={inputRef}
          type="text"
          value={localSearchTerm}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={searchPlaceholder}
          className="py-2.5 px-3 flex-grow outline-none text-white bg-transparent placeholder-gray-500 text-sm"
          aria-label={t("search.set.placeholder")}
          disabled={isLoading}
          style={{ caretColor: "#8A3F3F" }}
        />
        
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