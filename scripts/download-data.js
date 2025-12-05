// Script to download all Pokemon TCG data to local JSON files
// Run this once to cache all data locally

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const API_KEY = process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY;
const BASE_URL = 'https://api.pokemontcg.io/v2';
const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

// Create data directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

async function fetchWithKey(url) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (API_KEY) {
    headers['X-Api-Key'] = API_KEY;
  }
  
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

async function downloadAllSets() {
  console.log('📦 Downloading all Pokemon sets...');
  
  try {
    const data = await fetchWithKey(`${BASE_URL}/sets`);
    const filePath = path.join(DATA_DIR, 'sets.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Downloaded ${data.data.length} sets to ${filePath}`);
    return data.data;
  } catch (error) {
    console.error('❌ Error downloading sets:', error);
    return [];
  }
}

async function downloadCardsForSet(setId, setName, retries = 3) {
  console.log(`📇 Downloading cards for set: ${setName} (${setId})...`);
  
  let allCards = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    let attempt = 0;
    let success = false;
    
    while (attempt < retries && !success) {
      try {
        const url = `${BASE_URL}/cards?q=set.id:${setId}&page=${page}&pageSize=250`;
        const data = await fetchWithKey(url);
        
        allCards = allCards.concat(data.data);
        
        console.log(`  Page ${page}: ${data.data.length} cards (Total: ${allCards.length}/${data.totalCount})`);
        
        hasMore = allCards.length < data.totalCount;
        page++;
        success = true;
        
        // Rate limiting - wait 200ms between successful requests
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        attempt++;
        console.error(`  ❌ Error on page ${page} (attempt ${attempt}/${retries}):`, error.message);
        
        if (attempt < retries) {
          // Wait longer before retry (exponential backoff)
          const waitTime = 1000 * Math.pow(2, attempt);
          console.log(`  ⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          console.error(`  ❌ Failed after ${retries} attempts, skipping remaining pages`);
          hasMore = false;
        }
      }
    }
    
    if (!success) {
      hasMore = false;
    }
  }
  
  // Save cards for this set
  const setDir = path.join(DATA_DIR, 'sets', setId);
  if (!fs.existsSync(setDir)) {
    fs.mkdirSync(setDir, { recursive: true });
  }
  
  const filePath = path.join(setDir, 'cards.json');
  fs.writeFileSync(filePath, JSON.stringify({ data: allCards, totalCount: allCards.length }, null, 2));
  console.log(`✅ Saved ${allCards.length} cards to ${filePath}`);
  
  return allCards.length;
}

async function main() {
  console.log('🚀 Starting Pokemon TCG data download...\n');
  
  if (!API_KEY) {
    console.error('❌ ERROR: NEXT_PUBLIC_POKEMON_TCG_API_KEY not set!');
    console.log('Please set your API key in .env.local and try again.');
    process.exit(1);
  }
  
  // Download all sets
  const sets = await downloadAllSets();
  
  if (sets.length === 0) {
    console.error('❌ No sets downloaded. Exiting.');
    process.exit(1);
  }
  
  console.log(`\n📊 Found ${sets.length} sets. Starting card downloads...\n`);
  
  // Download cards for each set
  let totalCards = 0;
  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];
    console.log(`\n[${i + 1}/${sets.length}] Processing: ${set.name}`);
    
    const cardCount = await downloadCardsForSet(set.id, set.name);
    totalCards += cardCount;
    
    // Progress update
    console.log(`Progress: ${((i + 1) / sets.length * 100).toFixed(1)}% complete\n`);
  }
  
  // Create index file
  const indexData = {
    downloadDate: new Date().toISOString(),
    totalSets: sets.length,
    totalCards: totalCards,
    sets: sets.map(s => ({ id: s.id, name: s.name, series: s.series, total: s.total }))
  };
  
  fs.writeFileSync(
    path.join(DATA_DIR, 'index.json'),
    JSON.stringify(indexData, null, 2)
  );
  
  console.log('\n✅ Download complete!');
  console.log(`📊 Total sets: ${sets.length}`);
  console.log(`📇 Total cards: ${totalCards}`);
  console.log(`💾 Data saved to: ${DATA_DIR}`);
  console.log('\n🎉 You can now use local data instead of API calls!');
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
