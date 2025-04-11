"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type Language = 'en' | 'nl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Maak een context voor de taal
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Vertaalsleutels voor beide talen
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Algemeen
    "app.name": "Moondex",
    "app.tagline": "Your ultimate Pokémon TCG collection tracker and card database",
    "app.backToHome": "Back to home",
    "button.back": "Back",
    
    // Navigatie
    "nav.home": "Home",
    "nav.allSets": "All Sets",
    "nav.changelog": "Changelog",
    "nav.browseBySeries": "Browse by Series",
    
    // Changelog
    "changelog.title": "Changelog",
    "changelog.description": "Find all updates and planned features for Moondex here.",
    "changelog.legend": "Legend",
    "changelog.added": "Added",
    "changelog.changed": "Changed",
    "changelog.fixed": "Fixed",
    "changelog.removed": "Removed",
    "changelog.upcoming": "Upcoming",
    "changelog.helpUs": "Help us improve",
    "changelog.inDevelopment": "Moondex is continuously being developed. Are you missing a feature or do you have suggestions? Let us know!",
    "changelog.sendFeedback": "Send Feedback",
    
    // Changelog data
    "changelog.entry.0.title": "First Release",
    "changelog.entry.0.added.0": "Search for Pokémon cards by name and number",
    "changelog.entry.0.added.1": "View all sets and their cards",
    "changelog.entry.0.added.2": "Detailed card information such as market prices, types, and rarities",
    "changelog.entry.0.added.3": "Sort and filter cards per set",
    "changelog.entry.0.added.4": "Mobile and desktop-friendly interface",
    "changelog.entry.0.added.5": "Language switcher for English and Dutch",
    
    "changelog.entry.0.upcoming.0": "Card prices and patterns for Prismatic Evolution set (coming soon)",
    "changelog.entry.0.upcoming.1": "Registration and login system for users",
    "changelog.entry.0.upcoming.2": "Personal collection tracking",
    "changelog.entry.0.upcoming.3": "Wishlist functionality",
    "changelog.entry.0.upcoming.4": "Statistics and progress tracking for collectors",
    
    "changelog.entry.1.title": "Beta Version",
    "changelog.entry.1.added.0": "First implementation of the Pokémon TCG API",
    "changelog.entry.1.added.1": "Basic layout and navigation",
    "changelog.entry.1.added.2": "Set overview page",
    "changelog.entry.1.fixed.0": "Performance issues when loading cards",
    "changelog.entry.1.fixed.1": "Layout issues on smaller screens",
    
    // Search
    "search.global.placeholder": "Search for any Pokémon card...",
    "search.set.placeholder": "Search for cards in this set...",
    "search.button": "Search",
    "search.clear": "Clear search",
    "search.loading": "Searching...",
    "search.noResults": "No cards found",
    "search.resultsFor": "Search results for",
    "search.cardsFound": "cards found",
    "search.found": "found",
    "search.for": "for",
    "search.loadMore": "Load more",
    "search.allCardsLoaded": "All cards loaded",
    "search.showing": "Showing",
    "search.of": "of",
    "search.loadingMore": "Loading more cards...",
    "search.showingAll": "Showing all",
    "search.typeCards": "type cards",
    "search.loaded": "loaded",
    "search.showAllTypes": "Show All Types",
    
    // Filter and Sort
    "filter.title": "Filters",
    "filter.reset": "Reset Filters",
    "filter.apply": "Apply Filters",
    "filter.sortBy": "Sort By",
    "filter.type": "Type",
    
    // Set Header
    "set.cards": "Cards",
    "set.value": "Value",
    "set.showDetails": "Show set details",
    "set.hideDetails": "Hide",
    
    // Sets Page
    "sets.title": "Pokémon TCG Sets",
    "sets.description": "Browse all Pokémon Trading Card Game sets organized by series",
    "sets.search": "Search sets or series...",
    "sets.expandAll": "Expand All",
    "sets.collapseAll": "Collapse All",
    "sets.totalSets": "sets across",
    "sets.series": "series",
    "sets.showing": "Showing",
    "sets.setsOutOf": "sets out of",
    "sets.total": "total",
    "sets.noMatchingSets": "No matching sets found",
    "sets.clearSearch": "Clear Search",
    
    // Buttons & Actions
    "button.previous": "Previous",
    "button.next": "Next",
    "button.loadMore": "Load More",
    "button.close": "Close",
    
    // Misc
    "misc.updatedAt": "Updated at",
    "misc.na": "N/A",
    "misc.loading": "Loading",
    "misc.noSetSelected": "No set selected, select a set to search for a specific card.",
    "misc.cardsAreLoading": "Cards are loading",
    "misc.searchingForCards": "Searching for cards",
    "misc.noImage": "No image",
    
    // Language toggle
    "language.switch": "Switch to Dutch",
    "language.current": "English",
  },
  nl: {
    // Algemeen
    "app.name": "Moondex",
    "app.tagline": "Jouw ultieme Pokémon TCG collectie tracker en kaarten database",
    "app.backToHome": "Terug naar home",
    "button.back": "Terug",
    
    // Navigatie
    "nav.home": "Home",
    "nav.allSets": "Alle Sets",
    "nav.changelog": "Wijzigingen",
    "nav.browseBySeries": "Bladeren per Serie",
    
    // Changelog
    "changelog.title": "Logboek",
    "changelog.description": "Hier vind je een overzicht van alle updates en geplande functies voor Moondex.",
    "changelog.legend": "Legenda",
    "changelog.added": "Toegevoegd",
    "changelog.changed": "Aangepast",
    "changelog.fixed": "Opgelost",
    "changelog.removed": "Verwijderd",
    "changelog.upcoming": "Binnenkort",
    "changelog.helpUs": "Help ons verbeteren",
    "changelog.inDevelopment": "Moondex is continu in ontwikkeling. Mis je een functie of heb je suggesties? Laat het ons weten!",
    "changelog.sendFeedback": "Stuur Feedback",
    
    // Changelog data
    "changelog.entry.0.title": "Eerste release",
    "changelog.entry.0.added.0": "Zoeken naar Pokémon kaarten op naam en nummer",
    "changelog.entry.0.added.1": "Bekijken van alle sets en hun kaarten",
    "changelog.entry.0.added.2": "Uitgebreide kaartdetails zoals marktprijzen, typen en rarities",
    "changelog.entry.0.added.3": "Sorteren en filteren van kaarten per set",
    "changelog.entry.0.added.4": "Mobiele en desktop-vriendelijke interface",

    "changelog.entry.2.title": "Update",
    "changelog.entry.2.added.0": "Wissel van taal tussen Engels en Nederlands",
    
    "changelog.entry.0.upcoming.0": "Kaartprijzen en patterns voor Prismatic Evolution set (binnenkort beschikbaar)",
    "changelog.entry.0.upcoming.1": "Registratie- en inlogsysteem voor gebruikers",
    "changelog.entry.0.upcoming.2": "Persoonlijke collecties maken en bijhouden",
    "changelog.entry.0.upcoming.3": "Wishlist functionaliteit",
    "changelog.entry.0.upcoming.4": "Statistieken en voortgangstracking voor verzamelaars",
    
    "changelog.entry.1.title": "Beta versie",
    "changelog.entry.1.added.0": "Eerste implementatie van de Pokémon TCG API",
    "changelog.entry.1.added.1": "Basis layout en navigatie",
    "changelog.entry.1.added.2": "Set overzicht pagina",
    "changelog.entry.1.fixed.0": "Performanceproblemen bij het laden van kaarten",
    "changelog.entry.1.fixed.1": "Layout issues op kleinere schermen",
    
    // Search
    "search.global.placeholder": "Zoek naar een Pokémon kaart...",
    "search.set.placeholder": "Zoek naar kaarten in deze set...",
    "search.button": "Zoeken",
    "search.clear": "Wissen",
    "search.loading": "Zoeken...",
    "search.noResults": "Geen kaarten gevonden",
    "search.resultsFor": "Zoekresultaten voor",
    "search.cardsFound": "kaarten gevonden",
    "search.found": "gevonden",
    "search.for": "voor",
    "search.loadMore": "Meer laden",
    "search.allCardsLoaded": "Alle kaarten zijn geladen",
    "search.showing": "Tonen",
    "search.of": "van",
    "search.loadingMore": "Meer kaarten laden...",
    "search.showingAll": "Alle",
    "search.typeCards": "type kaarten",
    "search.loaded": "geladen",
    "search.showAllTypes": "Toon Alle Types",
    
    // Filter and Sort
    "filter.title": "Filters",
    "filter.reset": "Filters resetten",
    "filter.apply": "Filters toepassen",
    "filter.sortBy": "Sorteren op",
    "filter.type": "Type",
    
    // Set Header
    "set.cards": "Kaarten",
    "set.value": "Waarde",
    "set.showDetails": "Toon set details",
    "set.hideDetails": "Verbergen",
    
    // Sets Page
    "sets.title": "Pokémon TCG Sets",
    "sets.description": "Blader door alle Pokémon Trading Card Game sets geordend per serie",
    "sets.search": "Zoek sets of series...",
    "sets.expandAll": "Alles uitklappen",
    "sets.collapseAll": "Alles inklappen",
    "sets.totalSets": "sets verdeeld over",
    "sets.series": "series",
    "sets.showing": "Tonen",
    "sets.setsOutOf": "sets van",
    "sets.total": "totaal",
    "sets.noMatchingSets": "Geen overeenkomende sets gevonden",
    "sets.clearSearch": "Zoekopdracht wissen",
    
    // Buttons & Actions
    "button.previous": "Vorige",
    "button.next": "Volgende",
    "button.loadMore": "Meer laden",
    "button.close": "Sluiten",
    
    // Misc
    "misc.updatedAt": "Bijgewerkt op",
    "misc.na": "N.v.t.",
    "misc.loading": "Laden",
    "misc.noSetSelected": "Geen set geselecteerd, selecteer een set om naar een specifieke kaart te zoeken.",
    "misc.cardsAreLoading": "Kaarten worden geladen",
    "misc.searchingForCards": "Zoeken naar kaarten",
    "misc.noImage": "Geen afbeelding",
    
    // Language toggle
    "language.switch": "Schakel naar Engels",
    "language.current": "Nederlands",
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  // Zet initiële taal op Engels of haal op uit localStorage
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Haal de taal op uit localStorage als die er is
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'nl')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Vertaalfunctie
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Functie om de taal te veranderen en op te slaan
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const contextValue = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook om de taalcontext te gebruiken
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};