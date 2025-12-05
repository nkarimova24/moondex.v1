# 🚀 Local Data Setup Guide

## Why Use Local Data?

Instead of fetching from the Pokemon TCG API every time (slow), download all the data once and serve it locally (fast!).

**Benefits:**
- ⚡ **10-100x faster** loading times
- 💰 No API rate limits
- 🌐 Works offline
- 💾 Perfect for static hosting (Strato)

---

## Step 1: Download All Data

Run this command to download all Pokemon sets and cards:

```powershell
node scripts/download-data.js
```

**This will:**
- Download all Pokemon sets (~100 sets)
- Download all cards for each set (~20,000+ cards)
- Save everything to `public/data/`
- Take about 10-15 minutes (one-time only!)

**Progress will show:**
```
📦 Downloading all Pokemon sets...
✅ Downloaded 120 sets
📇 Downloading cards for set: Base Set (base1)...
  Page 1: 102 cards
✅ Saved 102 cards
[1/120] Progress: 0.8% complete
...
```

---

## Step 2: Update Your Code to Use Local Data

I'll create a new API client that uses local JSON files instead of fetching from the API.

---

## Step 3: Build and Deploy

```powershell
npm run build
```

Upload the `out/` folder to Strato. The `public/data/` folder will be included automatically!

---

## File Structure After Download

```
public/
  data/
    index.json              # Summary of all data
    sets.json               # All Pokemon sets
    sets/
      base1/
        cards.json          # All cards in Base Set
      base2/
        cards.json          # All cards in Jungle
      ...
```

---

## Updating Data

To get new sets/cards, just run the download script again:

```powershell
node scripts/download-data.js
```

It will overwrite old data with fresh data from the API.

---

## Disk Space

- **Total size:** ~50-100 MB (all sets + cards)
- **Compressed:** ~10-20 MB when deployed

This is totally fine for Strato hosting!

---

## Next Steps

1. Run the download script
2. I'll update your API client to use local files
3. Rebuild and deploy
4. Enjoy blazing fast loading! ⚡
