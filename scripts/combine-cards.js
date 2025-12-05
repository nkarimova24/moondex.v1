// Script to combine all cards into a single file for faster global search
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

async function combineAllCards() {
  console.log('📦 Combining all cards into single file...');
  
  try {
    // Read index to get all sets
    const indexPath = path.join(DATA_DIR, 'index.json');
    const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    
    const allCards = [];
    let processedSets = 0;
    
    // Load cards from each set
    for (const set of index.sets) {
      try {
        const cardsPath = path.join(DATA_DIR, 'sets', set.id, 'cards.json');
        if (fs.existsSync(cardsPath)) {
          const setCards = JSON.parse(fs.readFileSync(cardsPath, 'utf8'));
          if (setCards.data && setCards.data.length > 0) {
            allCards.push(...setCards.data);
            processedSets++;
            console.log(`  ✅ Added ${setCards.data.length} cards from ${set.name}`);
          }
        }
      } catch (error) {
        console.warn(`  ⚠️ Skipped ${set.name}:`, error.message);
      }
    }
    
    // Save combined file
    const outputPath = path.join(DATA_DIR, 'all-cards.json');
    const outputData = {
      data: allCards,
      totalCount: allCards.length,
      generatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    
    console.log(`\n✅ Combined ${allCards.length} cards from ${processedSets} sets`);
    console.log(`💾 Saved to: ${outputPath}`);
    console.log(`📊 File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('❌ Error combining cards:', error);
    process.exit(1);
  }
}

combineAllCards();
