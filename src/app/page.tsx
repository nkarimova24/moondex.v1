"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchPokemonSets } from "@/app/lib/api/pokemon";
import { PokemonSet } from "@/app/lib/api/types";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [recentSets, setRecentSets] = useState<PokemonSet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadRecentSets = async () => {
      try {
        const setsData = await fetchPokemonSets();
        const allSets = Object.values(setsData).flat();
        const recent = allSets.slice(0, 5);
        setRecentSets(recent);
      } catch (error) {
        console.error("Error loading recent sets:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentSets();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/pokedex?globalSearch=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center"
        style={{
          background: "linear-gradient(to bottom, #8A3F3F, #612B2B)",
          borderRadius: "0 0 20px 20px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{ 
            backgroundImage: `url('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png')`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right -50px center",
            backgroundSize: "300px 300px"
          }}></div>
        </div>
        
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {t("app.name")}
          </h1>
          <p className="text-lg sm:text-xl text-white/80 mb-8">
            {t("app.tagline")}
          </p>
          
          <form onSubmit={handleSearch} className="max-w-lg mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("search.global.placeholder")}
                className="w-full py-3 px-5 pr-12 rounded-full bg-white/10 border border-white/30 text-white placeholder-white/60 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                style={{ backdropFilter: "blur(5px)" }}
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <Search size={20} />
              </button>
            </div>
          </form>
          
       
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
            {t("home.explore")}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#252525] rounded-lg p-6 shadow-lg transition-transform hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-[#8A3F3F] rounded-full mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t("home.feature1.title")}</h3>
              <p className="text-gray-400">
                {t("home.feature1.description")}
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-[#252525] rounded-lg p-6 shadow-lg transition-transform hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-[#8A3F3F] rounded-full mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M3 6h18"></path>
                  <path d="M3 12h18"></path>
                  <path d="M3 18h18"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t("home.feature2.title")}</h3>
              <p className="text-gray-400">
                {t("home.feature2.description")}
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-[#252525] rounded-lg p-6 shadow-lg transition-transform hover:transform hover:scale-105">
              <div className="w-12 h-12 bg-[#8A3F3F] rounded-full mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{t("home.feature3.title")}</h3>
              <p className="text-gray-400">
                {t("home.feature3.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Sets Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#1E1E1E] rounded-lg mx-4 my-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-white">{t("home.latestSets")}</h2>
            <Link 
              href="/sets" 
              className="text-[#8A3F3F] hover:text-[#612B2B] transition-colors"
            >
              {t("home.viewAllSets")} →
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-[#8A3F3F] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-5">
              {recentSets.map((set) => (
                <Link
                  key={set.id}
                  href={`/pokedex?setId=${set.id}`}
                  className="block bg-[#252525] rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105"
                >
                  <div className="h-32 bg-gradient-to-r from-[#3A3A3A] to-[#2A2A2A] flex items-center justify-center p-4">
                    {set.images?.logo ? (
                      <Image 
                        src={set.images.logo} 
                        alt={set.name}
                        width={200}
                        height={100}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <div className="text-gray-500 text-center">{t("misc.noImage")}</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-medium text-lg truncate">{set.name}</h3>
                    <p className="text-gray-400 text-sm">{set.releaseDate}</p>
                    <div className="mt-2 text-xs font-medium px-2 py-1 bg-[#8A3F3F]/20 text-[#8A3F3F] rounded-full inline-block">
                      {set.total} {t("set.cards")}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      {!isAuthenticated && (
        <section className="py-16 px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{t("home.cta.title")}</h2>
            <p className="text-gray-400 mb-8">
              {t("home.cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/signin" 
                className="px-6 py-3 bg-[#8A3F3F] text-white font-medium rounded-lg hover:bg-[#612B2B] transition-colors"
              >
                {t("home.cta.signIn")}
              </Link>
              <Link 
                href="/signup" 
                className="px-6 py-3 bg-transparent border border-[#8A3F3F] text-[#8A3F3F] font-medium rounded-lg hover:bg-[#8A3F3F]/10 transition-colors"
              >
                {t("home.cta.createAccount")}
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}