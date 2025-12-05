# Deployment Debugging Guide

## Issue: Cards don't load on deployed website but work locally

### Step 1: Check Browser Console
1. Open your deployed website
2. Press `F12` to open Developer Tools
3. Go to the **Console** tab
4. Look for any red error messages
5. Take a screenshot and share what you see

### Step 2: Check Network Requests
1. In Developer Tools, go to the **Network** tab
2. Refresh the page
3. Look for requests to `api.pokemontcg.io`
4. Check if they're:
   - ✅ Status 200 (Success)
   - ❌ Status 429 (Rate Limited - need API key)
   - ❌ Status 403 (Forbidden)
   - ❌ Failed (CORS or network error)

### Step 3: Verify Environment Variables
Your deployment platform needs these environment variables:

```
NEXT_PUBLIC_POKEMON_TCG_API_KEY=your_api_key_here
NEXT_PUBLIC_LARAVEL_API_URL=your_backend_url_here
```

**How to set them:**
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Build & Deploy → Environment
- **GitHub Pages**: Not supported (use Vercel or Netlify instead)

### Step 4: Get a Pokemon TCG API Key (if you don't have one)
1. Go to https://pokemontcg.io/
2. Click "Get API Key"
3. Sign up for a free account
4. Copy your API key
5. Add it to your deployment environment variables as `NEXT_PUBLIC_POKEMON_TCG_API_KEY`

### Step 5: Check Build Output
Make sure your build completed successfully:
```bash
npm run build
```

Look for any errors during the build process.

### Common Issues & Solutions

#### Issue: "Failed to fetch" or CORS errors
**Cause**: Browser blocking cross-origin requests
**Solution**: This shouldn't happen with Pokemon TCG API, but if it does, you may need to add a proxy

#### Issue: 429 Rate Limited
**Cause**: No API key or too many requests
**Solution**: Add `NEXT_PUBLIC_POKEMON_TCG_API_KEY` to environment variables

#### Issue: Cards load slowly then disappear
**Cause**: Cache issues or state management
**Solution**: Check if `localStorage` is being cleared

#### Issue: Blank page with no errors
**Cause**: JavaScript not executing properly
**Solution**: Check if your hosting platform supports client-side JavaScript (most do)

### Quick Test
Add this to your browser console on the deployed site:

```javascript
// Test if API calls work
fetch('https://api.pokemontcg.io/v2/cards?page=1&pageSize=1')
  .then(r => r.json())
  .then(d => console.log('API Test Success:', d))
  .catch(e => console.error('API Test Failed:', e));
```

If this works, the issue is in your React code. If it fails, it's a network/CORS issue.
