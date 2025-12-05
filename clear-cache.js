// Clear MoonDex Cache Script
// Open browser console and paste this to clear all cached data

console.log('🧹 Clearing MoonDex cache...');

// Clear all MoonDex cache entries from localStorage
let clearedCount = 0;
Object.keys(localStorage)
  .filter(key => key.startsWith('moondex_cache_'))
  .forEach(key => {
    localStorage.removeItem(key);
    clearedCount++;
  });

console.log(`✅ Cleared ${clearedCount} cache entries`);
console.log('🔄 Please refresh the page now');
