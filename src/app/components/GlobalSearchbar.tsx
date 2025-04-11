"use client";

import { useState, useEffect, Suspense } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

interface GlobalSearchbarProps {
  isLoading?: boolean;
}

export default function GlobalSearchbar({ isLoading = false }: GlobalSearchbarProps) {
  return (
    <Suspense fallback={<div className="text-gray-400">Loading search bar...</div>}>
      <InnerGlobalSearchbar isLoading={isLoading} />
    </Suspense>
  );
}

function InnerGlobalSearchbar({ isLoading }: GlobalSearchbarProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const isSetPage = searchParams.has('setId');
  
  const stickyClass = isSetPage ? '' : 'sticky top-0';
  
  useEffect(() => {
    setSearchTerm('');
  }, [pathname]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/pokedex?globalSearch=${encodeURIComponent(searchTerm.trim())}`);
    }
  };
  
  const handleClear = () => {
    setSearchTerm('');
  };
  
  return (
    <div 
      className={`w-full py-4 px-6 z-30 ${stickyClass}`}
      style={{ 
        borderBottom: "1px solid rgba(60, 60, 60, 0.6)", 
        height: "64px", 
        display: "flex", 
        alignItems: "center",
        backgroundColor: "#1A1A1A",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.15)"
      }}
    >
      <div className="flex items-center justify-end w-full">
        <div className="relative max-w-md ml-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div 
              className={`flex items-center rounded-md overflow-hidden transition-all duration-200 ${
                isFocused ? 'ring-2 ring-opacity-40' : 'ring-0'
              }`}
              style={{ 
                backgroundColor: "#2A2A2A",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={t("search.global.placeholder")}
                className="py-2 px-3 flex-grow outline-none text-white bg-transparent placeholder-gray-500 text-sm"
                aria-label={t("search.global.placeholder")}
                disabled={isLoading}
                style={{ caretColor: "#8A3F3F" }}
              />
              
              {searchTerm && (
                <button 
                  onClick={handleClear}
                  type="button"
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
                type="submit"
                className="py-2 px-4 transition-colors"
                disabled={isLoading || !searchTerm.trim()}
                aria-label={t("search.button")}
                style={{ 
                  backgroundColor: "#8A3F3F",
                  color: "white",
                  opacity: (isLoading || !searchTerm.trim()) ? 0.7 : 1,
                  cursor: (isLoading || !searchTerm.trim()) ? "not-allowed" : "pointer",
                }}
              >
                {t("search.button")}
              </button>
            </div>
            
            {isLoading && (
              <div 
                className="absolute bottom-0 left-0 h-0.5 animate-pulse" 
                style={{ 
                  width: "100%", 
                  backgroundColor: "#8A3F3F" 
                }}
              ></div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}