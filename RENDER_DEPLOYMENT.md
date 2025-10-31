# Render Deployment Guide - UpSkillHub

This guide will help you deploy both the frontend and backend on Render.

## 🚀 Quick Deploy

### Option 1: Deploy Using render.yaml (Recommended)

1. **Push your code to GitHub** (already done ✅)
   ```bash
   git push origin master
   ```

2. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com/
   - Click **"New"** → **"Blueprint"**

3. **Connect Repository**
   - Select **"Connect a repository"**
   - Choose: `abhey-afk/UpSkillHub`
   - Render will automatically detect `render.yaml`

4. **Configure Environment Variables**
   
   The `render.yaml` will create two services:
   - `upskillhub-api` (Backend)
   - `upskillhub-frontend` (Frontend)

5. **Set Required Environment Variables**

   For **upskillhub-api** (Backend):
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
   JWT_SECRET=your_super_secret_jwt_key_here
   CLIENT_URL=https://upskillhub-frontend.onrender.com
   STRIPE_SECRET_KEY=sk_test_your_stripe_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   OPENAI_API_KEY=sk-your_openai_key
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

   For **upskillhub-frontend** (Frontend):
   ```
   VITE_API_URL=https://upskillhub-api.onrender.com/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

6. **Deploy**
   - Click **"Apply"**
   - Render will build and deploy both services

---

### Option 2: Manual Deployment

#### Deploy Backend (Already Done)
Your backend is already live at: `https://upskillhub-api.onrender.com`

#### Deploy Frontend

1. **Create New Static Site**
   - Go to: https://dashboard.render.com/
   - Click **"New"** → **"Static Site"**

2. **Connect Repository**
   - Repository: `abhey-afk/UpSkillHub`
   - Branch: `master`

3. **Configure Build Settings**
   ```
   Name: upskillhub-frontend
   Root Directory: client
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```

4. **Add Environment Variables**
   ```
   VITE_API_URL=https://upskillhub-api.onrender.com/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

5. **Configure Redirects**
   - Render will automatically use the `_redirects` file in the client folder
   - This ensures React Router works correctly

6. **Deploy**
   - Click **"Create Static Site"**
   - Wait for the build to complete

---

## 🔧 Post-Deployment Configuration

### Update Backend CORS

After frontend is deployed, update the backend's `CLIENT_URL`:

1. Go to **upskillhub-api** service on Render
2. Navigate to **Environment** tab
3. Update `CLIENT_URL` to your frontend URL:
   ```
   CLIENT_URL=https://upskillhub-frontend.onrender.com
   ```
4. Save changes (service will auto-redeploy)

### MongoDB Atlas IP Whitelist

1. Go to MongoDB Atlas Dashboard
2. Navigate to **Network Access**
3. Add IP Address: `0.0.0.0/0` (allows all IPs)
   - Or add Render's specific IP ranges

---

## 📋 Deployment Checklist

### Backend (API)
- [x] Deployed to Render
- [ ] Environment variables configured
- [ ] MongoDB connection working
- [ ] CORS configured with frontend URL
- [ ] Health check endpoint working: `/api/health`

### Frontend
- [ ] Static site created on Render
- [ ] Build command configured
- [ ] Environment variables set
- [ ] API URL pointing to backend
- [ ] Redirects configured for React Router
- [ ] Test deployment successful

---

## 🧪 Testing Your Deployment

### Test Backend
```bash
curl https://upskillhub-api.onrender.com/api/health
```

Expected response:
```json
{
  "status": "success",
  "message": "LMS API is running",
  "timestamp": "2025-10-31T...",
  "environment": "production"
}
```

### Test Frontend
1. Visit: `https://upskillhub-frontend.onrender.com`
2. Try to register/login
3. Check browser console for any API errors
4. Verify all pages load correctly

---

## 🔄 Continuous Deployment

Both services are configured for auto-deploy:
- **Push to GitHub** → Render automatically rebuilds and deploys
- **Backend**: Redeploys on code changes
- **Frontend**: Rebuilds static site on code changes

---

## 📊 Monitoring

### View Logs
1. Go to Render Dashboard
2. Select your service
3. Click **"Logs"** tab
4. Monitor real-time logs

### Check Build Status
- Green checkmark ✅ = Deployed successfully
- Red X ❌ = Build failed (check logs)
- Yellow circle 🟡 = Building/Deploying

---

## ⚠️ Common Issues

### Issue: Frontend can't connect to backend
**Solution:** 
- Check `VITE_API_URL` is correct
- Verify backend `CLIENT_URL` includes frontend URL
- Check CORS configuration

### Issue: 404 on page refresh
**Solution:** 
- Ensure `_redirects` file exists in client folder
- Verify it's included in the build

### Issue: Environment variables not working
**Solution:** 
- Vite requires `VITE_` prefix for env vars
- Rebuild after changing env vars
- Clear cache and redeploy

### Issue: Build fails
**Solution:** 
- Check Node version compatibility
- Verify all dependencies are in package.json
- Check build logs for specific errors

---

## 🎯 URLs After Deployment

- **Frontend**: `https://upskillhub-frontend.onrender.com`
- **Backend API**: `https://upskillhub-api.onrender.com/api`
- **Health Check**: `https://upskillhub-api.onrender.com/api/health`

---

## 💡 Tips

1. **Free Tier Limitations**
   - Services spin down after 15 minutes of inactivity
   - First request after spin-down may take 30-60 seconds
   - Consider upgrading for production use

2. **Custom Domain**
   - You can add a custom domain in Render settings
   - Update `CLIENT_URL` and `VITE_API_URL` accordingly

3. **Performance**
   - Enable caching for static assets
   - Use CDN for better global performance
   - Monitor build times and optimize if needed

---

## 📞 Support

If you encounter issues:
1. Check Render's status page: https://status.render.com/
2. Review deployment logs in Render dashboard
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
