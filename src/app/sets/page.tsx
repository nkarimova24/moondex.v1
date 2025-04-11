"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchPokemonSets } from "@/app/lib/api/pokemon";
import { PokemonSet } from "@/app/lib/api/types";
import { formatDate } from "@/app/lib/utils";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import ToTopButton from "@/app/components/ToTopButton";
import { useLanguage } from "@/context/LanguageContext";

export default function SetsPage() {
  const { t } = useLanguage();
  const [groupedSets, setGroupedSets] = useState<{ [key: string]: PokemonSet[] }>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSeries, setExpandedSeries] = useState<string[]>([]);
  const [filteredSeries, setFilteredSeries] = useState<string[]>([]);

  useEffect(() => {
    const loadSets = async () => {
      setLoading(true);
      try {
        const sets = await fetchPokemonSets();
        setGroupedSets(sets);
        
        // Initialize with all series expanded
        const seriesNames = Object.keys(sets);
        setExpandedSeries(seriesNames);
        setFilteredSeries(seriesNames);
      } catch (error) {
        console.error("Error loading sets:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSets();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredSeries(Object.keys(groupedSets));
      return;
    }

    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    const filtered = Object.keys(groupedSets).filter(series => {
      // Check if series name matches
      if (series.toLowerCase().includes(lowerSearchTerm)) return true;
      
      // Check if any set in the series matches
      return groupedSets[series].some(set => 
        set.name.toLowerCase().includes(lowerSearchTerm)
      );
    });
    
    setFilteredSeries(filtered);
    
    // Auto-expand any series that matches the search
    setExpandedSeries(prev => {
      const newExpanded = [...prev];
      filtered.forEach(series => {
        if (!newExpanded.includes(series)) {
          newExpanded.push(series);
        }
      });
      return newExpanded;
    });
  }, [searchTerm, groupedSets]);

  const toggleSeries = (series: string) => {
    setExpandedSeries(prev => 
      prev.includes(series) 
        ? prev.filter(s => s !== series) 
        : [...prev, series]
    );
  };

  const expandAll = () => {
    setExpandedSeries(filteredSeries);
  };

  const collapseAll = () => {
    setExpandedSeries([]);
  };

  // Function to count total sets
  const getTotalSetsCount = () => {
    return Object.values(groupedSets).reduce(
      (total, sets) => total + sets.length, 
      0
    );
  };

  // Function to get visible sets count based on search/filter
  const getVisibleSetsCount = () => {
    return filteredSeries.reduce((total, series) => {
      return total + groupedSets[series].length;
    }, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t("sets.title")}</h1>
        <p className="text-gray-400">
          {t("sets.description")}
        </p>
      </div>

      {/* Search and Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-1/2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("sets.search")}
            className="w-full py-2 px-4 pr-10 rounded-md bg-[#252525] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#8A3F3F] focus:border-transparent"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <Search size={18} />
          </div>
        </div>
        
        <div className="flex gap-2 ml-auto">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white text-sm rounded-md flex items-center gap-1 transition-colors"
          >
            <ChevronDown size={16} />
            <span>{t("sets.expandAll")}</span>
          </button>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white text-sm rounded-md flex items-center gap-1 transition-colors"
          >
            <ChevronUp size={16} />
            <span>{t("sets.collapseAll")}</span>
          </button>
        </div>
      </div>

      {/* Sets Count */}
      <div className="mb-6 text-sm text-gray-400">
        {searchTerm ? (
          <p>
            {t("sets.showing")} {getVisibleSetsCount()} {t("sets.setsOutOf")} {getTotalSetsCount()} {t("sets.total")}
          </p>
        ) : (
          <p>
            {getTotalSetsCount()} {t("sets.totalSets")} {Object.keys(groupedSets).length} {t("sets.series")}
          </p>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-12 h-12 border-4 border-[#8A3F3F] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredSeries.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-300 mb-4">{t("sets.noMatchingSets")}</p>
              <button
                onClick={() => setSearchTerm("")}
                className="px-4 py-2 bg-[#8A3F3F] text-white rounded-md hover:bg-[#612B2B] transition-colors"
              >
                {t("sets.clearSearch")}
              </button>
            </div>
          ) : (
            filteredSeries.map((series) => (
              <div key={series} className="rounded-lg overflow-hidden bg-[#1E1E1E] shadow-lg">
                {/* Series Header */}
                <button
                  onClick={() => toggleSeries(series)}
                  className="w-full px-6 py-4 flex justify-between items-center transition-colors hover:bg-[#2A2A2A]"
                  style={{
                    background: "linear-gradient(to right, rgba(138, 63, 63, 0.2), rgba(138, 63, 63, 0))",
                    borderLeft: "4px solid #8A3F3F"
                  }}
                >
                  <div>
                    <h2 className="text-xl font-bold text-white">{series}</h2>
                    <p className="text-gray-400 text-sm">{groupedSets[series].length} sets</p>
                  </div>
                  {expandedSeries.includes(series) ? (
                    <ChevronUp className="text-[#8A3F3F]" size={24} />
                  ) : (
                    <ChevronDown className="text-[#8A3F3F]" size={24} />
                  )}
                </button>
                
                {/* Sets Grid */}
                {expandedSeries.includes(series) && (
                  <div className="p-4 bg-[#1A1A1A]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {groupedSets[series].map((set) => {
                        const matchesSearch = searchTerm.trim() === "" || 
                          set.name.toLowerCase().includes(searchTerm.toLowerCase().trim());
                        
                        return (
                          <Link
                            key={set.id}
                            href={`/pokedex?setId=${set.id}`}
                            className={`block rounded-md overflow-hidden bg-[#252525] hover:bg-[#2D2D2D] transition-colors shadow ${!matchesSearch && searchTerm.trim() !== "" ? "opacity-50" : ""}`}
                          >
                            <div className="h-28 relative bg-gradient-to-r from-[#3A3A3A] to-[#2A2A2A] flex items-center justify-center p-3">
                              {set.images?.logo ? (
                                <Image 
                                  src={set.images.logo} 
                                  alt={set.name}
                                  width={160}
                                  height={80} 
                                  className="max-h-full max-w-full object-contain"
                                />
                              ) : (
                                <div className="text-gray-500 text-center text-xs">{t("misc.noImage")}</div>
                              )}
                              {set.images?.symbol && (
                                <div className="absolute right-2 bottom-2 w-8 h-8 rounded-full bg-[#1A1A1A] p-1 flex items-center justify-center">
                                  <Image 
                                    src={set.images.symbol} 
                                    alt={`${set.name} symbol`}
                                    width={24}
                                    height={24}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="p-3">
                              <h3 className="text-white font-medium text-sm mb-1 truncate">{set.name}</h3>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">{formatDate(set.releaseDate)}</span>
                                <span className="text-xs bg-[#8A3F3F]/20 text-[#8A3F3F] px-2 py-0.5 rounded-full">
                                  {set.total || set.printedTotal || 0} cards
                                </span>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
      
      <ToTopButton />
    </div>
  );
}