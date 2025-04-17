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
    "nav.collections": "Collections",
    "nav.decks": "Decks",
    "nav.profile": "Profile",
    
    // Home page
    "home.explore": "Explore the World of Moondex",
    "home.feature1.title": "Search Cards",
    "home.feature1.description": "Find any Pokémon card by name, type, or set. Our comprehensive database makes it easy to discover cards.",
    "home.feature2.title": "Browse Sets",
    "home.feature2.description": "Explore complete Pokémon card sets from every generation, organized by series and release date.",
    "home.feature3.title": "Track Collection",
    "home.feature3.description": "Coming soon: Track your Pokémon card collection, manage your wishlist, and keep track of card values.",
    "home.latestSets": "Latest Sets",
    "home.viewAllSets": "View all sets",
    "home.cta.title": "Ready to start your collection?",
    "home.cta.description": "Moondex makes it easy to find, organize, and track your Pokémon card collection.",
    "home.cta.signIn": "Sign In",
    "home.cta.createAccount": "Create Account",
    
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
    
    // Nieuwste changelog entry (v0.8.0)
    "changelog.entry.3.title": "Update",
    "changelog.entry.3.added.0": "User registration and login system",
    "changelog.entry.3.added.1": "Personal collection tracking functionality",
    "changelog.entry.3.added.2": "Card notes feature for adding personal notes to cards",
    "changelog.entry.3.added.3": "Profile page with account settings",
    // "changelog.entry.3.added.4": "Profile page with account settings",
    "changelog.entry.3.fixed.0": "Fixed issue with card pricing not displaying correctly",
    // "changelog.entry.3.fixed.1": "Fixed mobile navigation issues on smaller screens",
    "changelog.entry.3.upcoming.0": "Collection statistics and analytics",
    "changelog.entry.3.upcoming.1": "Create and manage decks and lists",
    "changelog.entry.3.upcoming.2": "Add friends and visit their profile",
    
    // Changelog data voor v0.7.1
    "changelog.entry.2.title": "Update",
    "changelog.entry.2.added.0": "Language switcher for English and Dutch",
    
    // Changelog data voor v0.7.0
    "changelog.entry.0.title": "First Release",
    "changelog.entry.0.added.0": "Search for Pokémon cards by name and number",
    "changelog.entry.0.added.1": "View all sets and their cards",
    "changelog.entry.0.added.2": "Detailed card information such as market prices, types, and rarities",
    "changelog.entry.0.added.3": "Sort and filter cards per set",
    "changelog.entry.0.added.4": "Mobile and desktop-friendly interface",
    
    "changelog.entry.0.upcoming.0": "Card prices and patterns for Prismatic Evolution set",
    "changelog.entry.0.upcoming.1": "Registration and login system for users",
    "changelog.entry.0.upcoming.2": "Personal collection tracking",
    "changelog.entry.0.upcoming.3": "Wishlist functionality",
    "changelog.entry.0.upcoming.4": "Statistics and progress tracking for collectors",
    "changelog.entry.0.upcoming.5": "Japanese cards and sets",

    // Changelog data voor v0.5.0
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
    "button.add": "Add",
    "button.save": "Save",
    "button.cancel": "Cancel",
    "button.delete": "Delete",
    "button.edit": "Edit",
    
    // Collection features
    "collection.title": "My Collection",
    "collection.description": "Track and organize your Pokémon card collection",
    "collection.empty": "You don't have any cards in your collection yet",
    "collection.create": "Create Collection",
    "collection.addFirst": "Add your first card",
    "collection.cardAdded": "Card added to collection!",
    "collection.cardRemoved": "Card removed from collection",
    "collection.filter.all": "All Cards",
    "collection.filter.normal": "Normal Cards",
    "collection.filter.holo": "Holo Cards",
    "collection.filter.reverseHolo": "Reverse Holo Cards",
    "collection.variants": "Card Variants",
    "collection.addToCollection": "Add to Collection",
    
    // Card Details
    "card.details": "Card Details",
    "card.notes": "Card Notes",
    "card.addNote": "Add a new note",
    "card.noteAdded": "Note added successfully!",
    "card.noteUpdated": "Note updated successfully!",
    "card.noteDeleted": "Note deleted successfully!",
    "card.evolution": "Evolution Chain",
    "card.evolvesFrom": "Evolves From",
    "card.evolvesTo": "Evolves To",
    "card.abilities": "Abilities",
    "card.attacks": "Attacks",
    "card.marketPrices": "Market Prices",
    "card.pricesUpdated": "Prices updated",
    "card.addToWishlist": "Add to Wishlist",
    "card.yourNotes": "Your Notes",
    "card.noNotes": "No notes yet. Add your first note above!",
    
    // Authentication
    "auth.signIn": "Sign In",
    "auth.signUp": "Sign Up",
    "auth.email": "Email Address",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm Password",
    "auth.username": "Username",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.signOut": "Sign Out",
    "auth.createAccount": "Create Account",
    
    // Profile
    "profile.title": "Profile",
    "profile.collections": "Collections",
    "profile.settings": "Settings",
    "profile.editProfile": "Edit Profile",
    "profile.accountSecurity": "Account Security",
    "profile.changePassword": "Change Password",
    "profile.myCollections": "My Collections",
    "profile.addCollection": "Add Collection",
    "profile.collectionsEmpty": "You haven't created any collections yet",
    "profile.createFirstCollection": "Create your first collection",
    "profile.comingSoon": "Coming soon...",
    "profile.lists": "Lists",
    "profile.decks": "Decks",
    
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
    
    // Sidebar
    "sidebar.goToProfile": "Go to profile",
    "sidebar.signIn": "Sign In",
    "sidebar.signUp": "Sign Up",
    "sidebar.logout": "Logout",
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
    "nav.collections": "Collecties",
    "nav.decks": "Decks",
    "nav.profile": "Profiel",
    
    // Home page
    "home.explore": "Ontdek de Wereld van Moondex",
    "home.feature1.title": "Zoek Kaarten",
    "home.feature1.description": "Vind elke Pokémon kaart op naam, type of set. Onze uitgebreide database maakt het gemakkelijk om kaarten te ontdekken.",
    "home.feature2.title": "Blader door Sets",
    "home.feature2.description": "Verken complete Pokémon kaartsets van elke generatie, georganiseerd per serie en releasedatum.",
    "home.feature3.title": "Beheer Collectie",
    "home.feature3.description": "Binnenkort beschikbaar: Houd je Pokémon kaartencollectie bij, beheer je wishlist en houd kaartwaarden in de gaten.",
    "home.latestSets": "Nieuwste Sets",
    "home.viewAllSets": "Bekijk alle sets",
    "home.cta.title": "Klaar om je collectie te starten?",
    "home.cta.description": "Moondex maakt het eenvoudig om je Pokémon kaarten te vinden, te organiseren en bij te houden.",
    "home.cta.signIn": "Inloggen",
    "home.cta.createAccount": "Account Aanmaken",
    
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
    
    // Nieuwste changelog entry (v0.8.0)
    "changelog.entry.3.title": "Update",
    "changelog.entry.3.added.0": "Gebruikersregistratie en inlogsysteem",
    "changelog.entry.3.added.1": "Persoonlijke collectie bijhoud-functionaliteit",
    "changelog.entry.3.added.2": "Kaartnotities functie voor het toevoegen van persoonlijke notities aan kaarten",
    "changelog.entry.3.added.3": "Profielpagina met accountinstellingen",
    // "changelog.entry.3.fixed.0": "Probleem opgelost met kaartprijzen die niet correct werden weergegeven",
    // "changelog.entry.3.fixed.1": "Problemen met mobiele navigatie op kleinere schermen opgelost",
    "changelog.entry.3.upcoming.0": "Collectie statistieken en analyses",
    "changelog.entry.3.upcoming.1": "Decks en lists bouwen",
    
    // Changelog data voor v0.7.1
    "changelog.entry.2.title": "Update",
    "changelog.entry.2.added.0": "Taalschakelaar voor Engels en Nederlands",
    
    // Changelog data voor v0.7.0
    "changelog.entry.0.title": "Eerste release",
    "changelog.entry.0.added.0": "Zoeken naar Pokémon kaarten op naam en nummer",
    "changelog.entry.0.added.1": "Bekijken van alle sets en hun kaarten",
    "changelog.entry.0.added.2": "Uitgebreide kaartdetails zoals marktprijzen, typen en rarities",
    "changelog.entry.0.added.3": "Sorteren en filteren van kaarten per set",
    "changelog.entry.0.added.4": "Mobiele en desktop-vriendelijke interface",
    
    "changelog.entry.0.upcoming.0": "Kaartprijzen en patterns voor Prismatic Evolution set (binnenkort beschikbaar)",
    "changelog.entry.0.upcoming.1": "Registratie- en inlogsysteem voor gebruikers",
    "changelog.entry.0.upcoming.2": "Persoonlijke collecties maken en bijhouden",
    "changelog.entry.0.upcoming.3": "Wishlist functionaliteit",
    "changelog.entry.0.upcoming.4": "Statistieken en voortgangstracking voor verzamelaars",
    "changelog.entry.0.upcoming.5": "Japanse kaarten en sets",
    
    // Changelog data voor v0.5.0
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
    "button.add": "Toevoegen",
    "button.save": "Opslaan",
    "button.cancel": "Annuleren",
    "button.delete": "Verwijderen",
    "button.edit": "Bewerken",
    
    // Collection features
    "collection.title": "Mijn Collectie",
    "collection.description": "Beheer en organiseer je Pokémon kaartencollectie",
    "collection.empty": "Je hebt nog geen kaarten in je collectie",
    "collection.create": "Collectie Aanmaken",
    "collection.addFirst": "Voeg je eerste kaart toe",
    "collection.cardAdded": "Kaart toegevoegd aan collectie!",
    "collection.cardRemoved": "Kaart verwijderd uit collectie",
    "collection.filter.all": "Alle Kaarten",
    "collection.filter.normal": "Normale Kaarten",
    "collection.filter.holo": "Holo Kaarten",
    "collection.filter.reverseHolo": "Reverse Holo Kaarten",
    "collection.variants": "Kaartvarianten",
    "collection.addToCollection": "Toevoegen aan Collectie",
    
    // Card Details
    "card.details": "Kaartdetails",
    "card.notes": "Kaartnotities",
    "card.addNote": "Voeg een nieuwe notitie toe",
    "card.noteAdded": "Notitie succesvol toegevoegd!",
    "card.noteUpdated": "Notitie succesvol bijgewerkt!",
    "card.noteDeleted": "Notitie succesvol verwijderd!",
    "card.evolution": "Evolutieketen",
    "card.evolvesFrom": "Evolueert van",
    "card.evolvesTo": "Evolueert naar",
    "card.abilities": "Vaardigheden",
    "card.attacks": "Aanvallen",
    "card.marketPrices": "Marktprijzen",
    "card.pricesUpdated": "Prijzen bijgewerkt",
    "card.addToWishlist": "Toevoegen aan Wishlist",
    "card.yourNotes": "Jouw Notities",
    "card.noNotes": "Nog geen notities. Voeg hierboven je eerste notitie toe!",
    
    // Authentication
    "auth.signIn": "Inloggen",
    "auth.signUp": "Registreren",
    "auth.email": "E-mailadres",
    "auth.password": "Wachtwoord",
    "auth.confirmPassword": "Bevestig Wachtwoord",
    "auth.username": "Gebruikersnaam",
    "auth.noAccount": "Nog geen account?",
    "auth.hasAccount": "Heb je al een account?",
    "auth.signOut": "Uitloggen",
    "auth.createAccount": "Account Aanmaken",
    
    // Profile
    "profile.title": "Profiel",
    "profile.collections": "Collecties",
    "profile.settings": "Instellingen",
    "profile.editProfile": "Profiel Bewerken",
    "profile.accountSecurity": "Accountbeveiliging",
    "profile.changePassword": "Wachtwoord Wijzigen",
    "profile.myCollections": "Mijn Collecties",
    "profile.addCollection": "Collectie Toevoegen",
    "profile.collectionsEmpty": "Je hebt nog geen collecties aangemaakt",
    "profile.createFirstCollection": "Maak je eerste collectie aan",
    "profile.comingSoon": "Binnenkort beschikbaar...",
    "profile.lists": "Lijsten",
    "profile.decks": "Decks",
    
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
    
    // Sidebar
    "sidebar.goToProfile": "Ga naar profiel",
    "sidebar.signIn": "Inloggen",
    "sidebar.signUp": "Registreren",
    "sidebar.logout": "Uitloggen",
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