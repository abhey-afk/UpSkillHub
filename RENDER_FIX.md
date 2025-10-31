# 🔧 Fix Render Deployment - 404 Errors

## Problem
You're seeing 404 errors for JavaScript files like `ui-fZaehrL9.js` because the build output isn't being served correctly.

## ✅ Solution - Updated Configuration

I've fixed the `vite.config.js` with proper asset configuration. Now follow these steps:

### Step 1: Commit and Push the Fix

```bash
git add client/vite.config.js
git commit -m "Fix Vite build configuration for Render deployment"
git push origin master
```

### Step 2: Trigger Rebuild on Render

**Option A: Manual Deploy**
1. Go to your Render dashboard
2. Select your `upskillhub-frontend` service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

**Option B: Clear Cache and Rebuild**
1. Go to your service settings
2. Click **"Manual Deploy"** → **"Clear build cache & deploy"**

### Step 3: Verify Build Settings

Make sure your Render static site has these **EXACT** settings:

```
Root Directory: client
Build Command: npm install && npm run build
Publish Directory: dist
```

**NOT:**
- ❌ `./dist`
- ❌ `client/dist`
- ✅ `dist` (correct)

### Step 4: Check Environment Variables

Ensure these are set in Render:

```
VITE_API_URL=https://upskillhub-api.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

---

## 🔍 What Was Fixed

### Before (Broken):
```js
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    // Missing base path and asset configuration
  },
})
```

### After (Fixed):
```js
export default defineConfig({
  plugins: [react()],
  base: '/',  // ← Added: Correct base path
  build: {
    outDir: 'dist',
    assetsDir: 'assets',  // ← Added: Asset directory
    emptyOutDir: true,    // ← Added: Clean build
    rollupOptions: {
      output: {
        // ← Added: Proper file naming for assets
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
})
```

---

## 🧪 After Deployment - Test

1. **Clear Browser Cache**
   - Press `Ctrl + Shift + R` (Windows/Linux)
   - Press `Cmd + Shift + R` (Mac)

2. **Check Build Output**
   - In Render logs, you should see:
   ```
   vite v5.0.0 building for production...
   ✓ built in XXXms
   dist/index.html                   X.XX kB
   dist/assets/vendor-XXXXX.js       XXX.XX kB
   dist/assets/ui-XXXXX.js           XXX.XX kB
   dist/assets/index-XXXXX.js        XXX.XX kB
   ```

3. **Visit Your Site**
   - Open: `https://your-site.onrender.com`
   - Open DevTools (F12) → Network tab
   - Refresh page
   - All assets should load with 200 status

---

## 🚨 Still Not Working?

### Check 1: Verify Publish Directory
1. Go to Render dashboard → Your service
2. Click **Settings**
3. Scroll to **Build & Deploy**
4. Ensure "Publish Directory" is exactly: `dist`

### Check 2: Check Build Logs
1. Go to **Logs** tab
2. Look for the build output
3. Verify files are created in `dist/` folder
4. Should see: `dist/index.html` and `dist/assets/` files

### Check 3: Verify _redirects File
The `_redirects` file should be in `client/public/` and contain:
```
/*    /index.html   200
```

This file will be copied to `dist/` during build.

---

## 📝 Quick Checklist

- [ ] Updated `vite.config.js` pushed to GitHub
- [ ] Triggered rebuild on Render
- [ ] Build completed successfully (check logs)
- [ ] Publish directory is `dist` (not `./dist`)
- [ ] Root directory is `client`
- [ ] Environment variables are set
- [ ] Cleared browser cache
- [ ] Site loads without 404 errors

---

## 💡 Why This Happens

Vite needs explicit configuration for:
1. **Base path** - Where assets are served from
2. **Asset directory** - Where to put JS/CSS files
3. **File naming** - How to name the output files

Without this, Render doesn't know where to find the built files, causing 404 errors.

---

## ✅ Expected Result

After the fix:
- ✅ Site loads correctly
- ✅ No 404 errors in console
- ✅ All JavaScript files load
- ✅ React app renders properly
- ✅ Routing works on all pages
