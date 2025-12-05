// Script to re-download ONLY cards (uses existing sets.json)
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const API_KEY = process.env.NEXT_PUBLIC_POKEMON_TCG_API_KEY;
const BASE_URL = 'https://api.pokemontcg.io/v2';
const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

async function fetchWithKey(url) {
  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['X-Api-Key'] = API_KEY;
  
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function downloadCardsForSet(setId, setName, retries = 3) {
  console.log(`📇 ${setName} (${setId})`);
  
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
        console.log(`  Page ${page}: ${data.data.length} cards (${allCards.length}/${data.totalCount})`);
        
        hasMore = allCards.length < data.totalCount;
        page++;
        success = true;
        
        await new Promise(r => setTimeout(r, 300)); // 300ms delay
      } catch (error) {
        attempt++;
        if (attempt < retries) {
          const wait = 2000 * attempt;
          console.log(`  ⏳ Retry ${attempt}/${retries} in ${wait}ms...`);
          await new Promise(r => setTimeout(r, wait));
        } else {
          console.error(`  ❌ Failed: ${error.message}`);
          hasMore = false;
        }
      }
    }
    if (!success) hasMore = false;
  }
  
  const setDir = path.join(DATA_DIR, 'sets', setId);
  if (!fs.existsSync(setDir)) fs.mkdirSync(setDir, { recursive: true });
  
  const filePath = path.join(setDir, 'cards.json');
  fs.writeFileSync(filePath, JSON.stringify({ data: allCards, totalCount: allCards.length }, null, 2));
  console.log(`✅ ${allCards.length} cards saved\n`);
  
  return allCards.length;
}

async function main() {
  console.log('🚀 Re-downloading card data...\n');
  
  if (!API_KEY) {
    console.error('❌ API key not set!');
    process.exit(1);
  }
  
  // Read existing sets.json
  const setsPath = path.join(DATA_DIR, 'sets.json');
  if (!fs.existsSync(setsPath)) {
    console.error('❌ sets.json not found! Run download-data.js first.');
    process.exit(1);
  }
  
  const setsData = JSON.parse(fs.readFileSync(setsPath, 'utf8'));
  const sets = setsData.data;
  
  console.log(`📊 Found ${sets.length} sets\n`);
  
  let totalCards = 0;
  for (let i = 0; i < sets.length; i++) {
    const set = sets[i];
    console.log(`[${i + 1}/${sets.length}] ${set.name}`);
    
    const cardCount = await downloadCardsForSet(set.id, set.name);
    totalCards += cardCount;
    
    console.log(`Progress: ${((i + 1) / sets.length * 100).toFixed(1)}%\n`);
  }
  
  // Update index
  const indexData = {
    downloadDate: new Date().toISOString(),
    totalSets: sets.length,
    totalCards: totalCards,
    sets: sets.map(s => ({ id: s.id, name: s.name, series: s.series, total: s.total }))
  };
  
  fs.writeFileSync(path.join(DATA_DIR, 'index.json'), JSON.stringify(indexData, null, 2));
  
  console.log('\n✅ Download complete!');
  console.log(`📊 Sets: ${sets.length}`);
  console.log(`📇 Cards: ${totalCards}`);
}

main().catch(error => {
  console.error('❌ Fatal:', error);
  process.exit(1);
});
