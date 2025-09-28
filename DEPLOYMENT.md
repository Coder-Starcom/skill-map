# Netlify Deployment Guide for Skillmap

## Prerequisites
1. Netlify account (free tier works)
2. GitHub repository with your code
3. Database (PostgreSQL recommended - can use Supabase, PlanetScale, or Railway)

## Step 1: Prepare Your Repository

### 1.1 Push to GitHub
```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### 1.2 Environment Variables Needed
Create these in Netlify's environment variables section:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
GEMINI_API_KEY=AIzaSyDL_s2NBb06Ci2_FhyNsnxpR-JHGLeNHaM
ADZUNA_APP_ID=1d9d49da
ADZUNA_APP_KEY=c1f82d464196f80b8a3c2145a643d42f
NEXTAUTH_URL=https://your-app-name.netlify.app
NEXTAUTH_SECRET=your-random-secret-key
```

## Step 2: Deploy on Netlify

### 2.1 Connect Repository
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Choose GitHub and select your repository
4. Select the main branch

### 2.2 Build Settings
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 18

### 2.3 Environment Variables
1. Go to Site settings > Environment variables
2. Add all the variables listed above
3. Make sure to use your actual database URL and Clerk keys

## Step 3: Database Setup

### Option A: Supabase (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Update DATABASE_URL in Netlify

### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Create a new PostgreSQL database
3. Copy the connection string
4. Update DATABASE_URL in Netlify

## Step 4: Clerk Configuration

### 4.1 Update Clerk URLs
In your Clerk dashboard:
1. Go to Configure > Domains
2. Add your Netlify domain: `your-app-name.netlify.app`
3. Update redirect URLs to use your Netlify domain

### 4.2 Environment Variables
Make sure to use the production Clerk keys if you have them, or keep using test keys for development.

## Step 5: Deploy and Test

### 5.1 Trigger Deployment
1. Push any changes to trigger a new deployment
2. Or manually trigger from Netlify dashboard

### 5.2 Test Your App
1. Visit your Netlify URL
2. Test authentication
3. Test database connections
4. Test AI features

## Troubleshooting

### Common Issues:
1. **Build fails**: Check Node version (should be 18)
2. **Database connection**: Verify DATABASE_URL format
3. **Clerk auth**: Check domain configuration
4. **API limits**: Monitor Gemini API usage

### Useful Commands:
```bash
# Check build locally
npm run build

# Test production build
npm run start

# Check environment variables
echo $DATABASE_URL
```

## Post-Deployment

### 1. Custom Domain (Optional)
- Go to Domain settings in Netlify
- Add your custom domain
- Update Clerk domains accordingly

### 2. Monitoring
- Set up Netlify Analytics
- Monitor build logs
- Check function logs for errors

### 3. Performance
- Enable Netlify's CDN
- Optimize images
- Monitor Core Web Vitals

## Support
- Netlify Docs: https://docs.netlify.com
- Next.js Deployment: https://nextjs.org/docs/deployment
- Clerk Docs: https://clerk.com/docs
