# 🚀 Deployment Instructions for Strato

## Step 1: Add Your API Key

1. **Create a file** called `.env.local` in the root folder:
   - Location: `c:\Users\nkari\Documents\moondex\moondex.v1\.env.local`
   
2. **Add this content** (replace with your actual API key):

```env
NEXT_PUBLIC_POKEMON_TCG_API_KEY=your_actual_pokemon_tcg_api_key_here
NEXT_PUBLIC_LARAVEL_API_URL=https://your-backend-url.com/api
```

**Important:** 
- Replace `your_actual_pokemon_tcg_api_key_here` with the API key you got from pokemontcg.io
- If you don't have a Laravel backend yet, you can leave the second line as is

---

## Step 2: Rebuild Your Site

Open PowerShell in your project folder and run:

```powershell
npm run build
```

This will create a new `out` folder with your static website that includes the API key.

---

## Step 3: Upload to Strato

### Files to Upload:
Upload **ONLY** the contents of the `out` folder to your Strato web hosting:

1. Connect to Strato via FTP (using FileZilla, WinSCP, or Strato's file manager)
2. Navigate to your website's root directory (usually `public_html` or `htdocs`)
3. Upload **everything inside** the `out` folder:
   - `_next/` folder
   - `404.html`
   - `index.html`
   - All other HTML files and folders
   - `.nojekyll` file (if present)

### Important Notes:
- **Delete old files first** before uploading new ones (to avoid conflicts)
- Make sure to upload the `_next` folder - it contains all your JavaScript and CSS
- The upload may take a few minutes depending on your connection speed

---

## Step 4: Test Your Site

1. Visit https://moondex.nl
2. Navigate to a page with cards (like the Pokedex)
3. Cards should now load properly!

---

## Troubleshooting

### If cards still don't load:
1. **Clear your browser cache** (Ctrl + Shift + Delete)
2. **Check browser console** (F12 → Console tab) for errors
3. **Verify the upload** - make sure the `_next` folder was uploaded completely

### If you see "404 Not Found" errors:
- Make sure you uploaded to the correct directory
- Check that `index.html` is in the root of your web directory

### If you need to update the API key later:
1. Update `.env.local` file
2. Run `npm run build` again
3. Re-upload the `out` folder to Strato

---

## Quick Reference

**Build command:** `npm run build`  
**Upload folder:** `out/`  
**Strato directory:** Usually `public_html` or `htdocs`  
**Website URL:** https://moondex.nl
