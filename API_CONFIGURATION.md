# API Configuration Guide

## ✅ Changes Made

### Client-Side Updates

1. **Updated `client/src/services/api.js`**
   - Changed API URL to use environment variable with fallback
   - Now uses: `import.meta.env.VITE_API_URL || 'https://upskillhub-api.onrender.com/api'`

2. **Fixed `client/src/components/course/LectureForm.jsx`**
   - Replaced direct `axios` import with centralized `api` service
   - Updated endpoint from `/api/v1/courses/${courseId}/lectures` to `/courses/${courseId}/lectures`
   - Now uses the same base URL configuration as all other components

3. **Updated `client/.env`**
   ```env
   VITE_API_URL=https://upskillhub-api.onrender.com/api
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
   ```

4. **Updated `client/.env.example`**
   - Changed default API URL from `http://localhost:5000/api` to `https://upskillhub-api.onrender.com/api`

### Server-Side Configuration Needed

**IMPORTANT:** Update your production server's environment variables on Render:

1. Go to your Render dashboard for `upskillhub-api`
2. Navigate to **Environment** section
3. Add/Update the following variable:
   ```
   CLIENT_URL=https://your-frontend-url.com
   ```
   Replace with your actual frontend URL (e.g., Netlify, Vercel, or wherever you deploy the client)

4. Ensure MongoDB Atlas IP whitelist includes:
   - Your Render server's IP address, OR
   - `0.0.0.0/0` to allow all IPs (for development/testing only)

## 📋 Verification Checklist

- [x] Client API service uses environment variable
- [x] All components use centralized API service
- [x] Client `.env` file configured with production URL
- [ ] Server `CLIENT_URL` environment variable set on Render
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Stripe keys configured (if using payments)
- [ ] Test API connection after deployment

## 🚀 Deployment Steps

### Client Deployment
1. Build the client:
   ```bash
   cd client
   npm run build
   ```

2. Deploy the `dist` folder to your hosting service (Netlify, Vercel, etc.)

3. Set environment variables on your hosting platform:
   - `VITE_API_URL=https://upskillhub-api.onrender.com/api`
   - `VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key`

### Server Configuration on Render
1. Ensure the following environment variables are set:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `CLIENT_URL` - Your frontend URL (for CORS)
   - `JWT_SECRET` - Secret key for JWT tokens
   - `STRIPE_SECRET_KEY` - Your Stripe secret key (if using payments)
   - `NODE_ENV=production`

## 🔍 Testing

Test the API connection:
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

## 📝 Notes

- All API calls now go through the centralized `api.js` service
- The API automatically includes authentication tokens in requests
- CORS is configured to accept requests from the `CLIENT_URL` environment variable
- Rate limiting is set to 100 requests per 15 minutes per IP
