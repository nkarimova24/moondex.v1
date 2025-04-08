// sortUtils.js
// This file contains all utility functions for sorting Pokemon cards

/**
 * Sorts cards by their number in ascending order
 * @param {Array} cards - Array of PokemonCard objects
 * @returns {Array} Sorted array of cards
 */
export const sortByNumberAsc = (cards) => {
  return [...cards].sort((a, b) => {
    const numA = parseInt(a.number) || 0;
    const numB = parseInt(b.number) || 0;
    return numA - numB;
  });
};

/**
 * Sorts cards by their number in descending order
 * @param {Array} cards - Array of PokemonCard objects
 * @returns {Array} Sorted array of cards
 */
export const sortByNumberDesc = (cards) => {
  return [...cards].sort((a, b) => {
    const numA = parseInt(a.number) || 0;
    const numB = parseInt(b.number) || 0;
    return numB - numA;
  });
};

/**
 * Sorts cards by their name in ascending order (A-Z)
 * @param {Array} cards - Array of PokemonCard objects
 * @returns {Array} Sorted array of cards
 */
export const sortByNameAsc = (cards) => {
  return [...cards].sort((a, b) => {
    return (a.name || '').localeCompare(b.name || '');
  });
};

/**
 * Sorts cards by their name in descending order (Z-A)
 * @param {Array} cards - Array of PokemonCard objects
 * @returns {Array} Sorted array of cards
 */
export const sortByNameDesc = (cards) => {
  return [...cards].sort((a, b) => {
    return (b.name || '').localeCompare(a.name || '');
  });
};

/**
 * Gets the price for a card considering multiple price sources
 * @param {Object} card - PokemonCard object
 * @returns {number} Card price or 0 if not available
 */
export const getCardPrice = (card) => {
  return card.cardmarket?.prices?.trendPrice ||
    card.cardmarket?.prices?.averageSellPrice ||
    card.cardmarket?.prices?.lowPrice ||
    card.tcgplayer?.prices?.normal?.market ||
    card.tcgplayer?.prices?.normal?.low || 
    0;
};

/**
 * Sorts cards by their price in ascending order (low to high)
 * @param {Array} cards - Array of PokemonCard objects
 * @returns {Array} Sorted array of cards
 */
export const sortByPriceAsc = (cards) => {
  return [...cards].sort((a, b) => {
    const priceA = getCardPrice(a);
    const priceB = getCardPrice(b);
    return priceA - priceB;
  });
};

/**
 * Sorts cards by their price in descending order (high to low)
 * @param {Array} cards - Array of PokemonCard objects
 * @returns {Array} Sorted array of cards
 */
export const sortByPriceDesc = (cards) => {
  return [...cards].sort((a, b) => {
    const priceA = getCardPrice(a);
    const priceB = getCardPrice(b);
    return priceB - priceA;
  });
};

// Official rarity order mapping based on provided hierarchy
const RARITY_ORDER = {
  // Common
  'Common': 10,
  
  // Uncommon
  'Uncommon': 20,
  
  // Rare
  'Rare': 30,
  
  // Double Rare
  'Double Rare': 40,
  'Rare Holo': 40,
  'Rare Holographic': 40,
  'Holo Rare': 40,
  
  // ACE SPEC Rare
  'ACE SPEC Rare': 50,
  'ACE SPEC': 50,
  
  // Illustration Rare
  'Illustration Rare': 60,
  'Illustration': 60,
  'Alternate Art': 60,
  
  // Ultra Rare
  'Ultra Rare': 70,
  'Rare Ultra': 70,
  'V': 70,
  'VMAX': 70,
  'VSTAR': 70,
  'EX': 70,
  'ex': 70,
  'GX': 70,
  
  // Shiny Rare
  'Shiny Rare': 80,
  'Shiny': 80,
  'Shining': 80,
  
  // Shiny Ultra Rare
  'Shiny Ultra Rare': 90,
  'Shiny EX': 90,
  'Shiny GX': 90,
  'Shiny V': 90,
  
  // Special Illustration Rare
  'Special Illustration Rare': 100,
  'Special Illustration': 100,
  'Special Art': 100,
  'SA': 100,
  
  // Hyper Rare
  'Hyper Rare': 110,
  'Rainbow Rare': 110,
  'Rare Rainbow': 110,
  'Gold': 110,
  'Rare Secret': 110,
  'Secret Rare': 110
};

/**
 * Gets the rarity value for sorting using fuzzy matching if exact match not found
 * @param {Object} card 
 * @returns {number} 
 */
export const getRarityValue = (card) => {
  if (!card.rarity) return 0;
  
  if (RARITY_ORDER[card.rarity]) {
    return RARITY_ORDER[card.rarity];
  }
  
  const rarity = card.rarity.toLowerCase();
  
  if (rarity.includes('special illustration') || rarity.includes('sa rare')) return 100;
  if (rarity.includes('shiny ultra') || rarity.includes('shiny ex') || rarity.includes('shiny gx') || rarity.includes('shiny v')) return 90;
  if (rarity.includes('shiny') || rarity.includes('shining')) return 80;
  if (rarity.includes('ultra rare') || rarity.includes('rare ultra')) return 70;
  if (rarity.includes('illustration rare') || rarity.includes('alternate art')) return 60;
  if (rarity.includes('ace spec')) return 50;
  if (rarity.includes('double rare') || rarity.includes('holo rare') || rarity.includes('holographic')) return 40;
  if (rarity.includes('hyper') || rarity.includes('rainbow') || rarity.includes('gold') || rarity.includes('secret')) return 110;
  
  if (rarity.includes(' ex') || rarity.includes('ex ') || rarity.includes(' v') || rarity.includes('gx') || 
      rarity.includes('vmax') || rarity.includes('vstar')) return 70;
  
  if (rarity.includes('rare')) return 30;
  if (rarity.includes('uncommon')) return 20;
  if (rarity.includes('common')) return 10;
  
  return 0;
};

/**
 * Sorts cards by their rarity in ascending order (common to rare)
 * @param {Array} cards 
 * @returns {Array} 
 */
export const sortByRarityAsc = (cards) => {
  return [...cards].sort((a, b) => {
    const rarityA = getRarityValue(a);
    const rarityB = getRarityValue(b);
    return rarityA - rarityB;
  });
};

/**
 * Sorts cards by their rarity in descending order (rare to common)
 * @param {Array} cards 
 * @returns {Array} 
 */
export const sortByRarityDesc = (cards) => {
  return [...cards].sort((a, b) => {
    const rarityA = getRarityValue(a);
    const rarityB = getRarityValue(b);
    return rarityB - rarityA;
  });
};

/**
 * Sorts cards based on the provided sort option
 * @param {Array} cards -
 * @param {string} sortOption 
 * @returns {Array} 
 */
export const sortCards = (cards, sortOption) => {
  switch (sortOption) {
    case 'number-asc':
      return sortByNumberAsc(cards);
    case 'number-desc':
      return sortByNumberDesc(cards);
    case 'name-asc':
      return sortByNameAsc(cards);
    case 'name-desc':
      return sortByNameDesc(cards);
    case 'price-asc':
      return sortByPriceAsc(cards);
    case 'price-desc':
      return sortByPriceDesc(cards);
    case 'rarity-asc':
      return sortByRarityAsc(cards);
    case 'rarity-desc':
      return sortByRarityDesc(cards);
    default:
      return sortByNumberAsc(cards);
  }
};