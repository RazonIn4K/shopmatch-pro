# Deployment Guide - ShopMatch Pro

**Complete guide to deploying ShopMatch Pro to production**

This guide walks you through deploying ShopMatch Pro to a production environment with proper configuration for Firebase, Stripe, and hosting. The recommended platform is Vercel, but instructions for other platforms are included.

---

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Platforms](#deployment-platforms)
3. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
4. [Alternative Platforms](#alternative-platforms)
5. [Firebase Production Configuration](#firebase-production-configuration)
6. [Stripe Production Configuration](#stripe-production-configuration)
7. [Environment Variables for Production](#environment-variables-for-production)
8. [Domain Configuration](#domain-configuration)
9. [Post-Deployment Verification](#post-deployment-verification)
10. [Monitoring & Logging](#monitoring--logging)
11. [Security Hardening](#security-hardening)
12. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production, ensure you have completed these steps:

### Code Readiness

- [ ] **Production build passes locally**
  ```bash
  npm run build
  # Should complete without errors
  ```

- [ ] **All TypeScript checks passing**
  ```bash
  npm run lint
  # Should show 0 errors
  ```

- [ ] **Environment variables validated**
  ```bash
  npm run validate-env
  # All checks should pass ✅
  ```

- [ ] **Git repository clean and committed**
  ```bash
  git status
  # Should show "nothing to commit, working tree clean"
  ```

### Services Configured

- [ ] **Firebase project created** (production environment)
- [ ] **Stripe account configured** (production mode, not test mode)
- [ ] **Hosting platform account** (Vercel, Netlify, etc.)
- [ ] **Custom domain purchased** (optional but recommended)

### Documentation Reviewed

- [ ] Read [QUICK_START.md](./QUICK_START.md) for setup reference
- [ ] Review [PROJECT_STATUS.md](./PROJECT_STATUS.md) for feature completeness
- [ ] Review [CLAUDE.md](./CLAUDE.md) for architecture details

---

## Deployment Platforms

ShopMatch Pro is a Next.js 15 application and can be deployed to any platform that supports Next.js. Here are the recommended options:

### Recommended: Vercel

**Pros**:
- Built by the Next.js team (optimal performance)
- Zero-configuration deployment for Next.js
- Automatic HTTPS and CDN
- Built-in analytics and monitoring
- Excellent free tier (Hobby plan)
- Automatic preview deployments for PRs

**Cons**:
- More expensive at scale (Pro plan: $20/month)

**Best for**: Most use cases, especially startups and MVPs

### Alternative: Netlify

**Pros**:
- Great free tier
- Easy configuration
- Good performance
- Built-in form handling

**Cons**:
- Slightly more configuration needed for Next.js
- Not optimized specifically for Next.js

**Best for**: Cost-conscious deployments

### Alternative: Railway / Render

**Pros**:
- Simple Docker-based deployment
- Good for full-stack apps
- Affordable pricing

**Cons**:
- Manual configuration required
- Requires Dockerfile

**Best for**: Teams comfortable with Docker

### Not Recommended: AWS / GCP / Azure

**Why**: Requires extensive configuration and DevOps expertise. Overkill for an MVP unless you have specific enterprise requirements.

---

## Vercel Deployment (Recommended)

### Step 1: Install Vercel CLI (Optional)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

### Step 2: Deploy via GitHub Integration (Recommended)

**This is the easiest method and provides automatic deployments on every push.**

1. **Push your code to GitHub**:
   ```bash
   # If not already a git repository
   git init
   git add .
   git commit -m "Initial commit - ready for deployment"

   # Create GitHub repository (if not done)
   gh repo create shopmatch-pro --private --source=. --remote=origin

   # Push to GitHub
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click **"Add New Project"**
   - Import your GitHub repository (`shopmatch-pro`)
   - Vercel will auto-detect Next.js configuration

3. **Configure Build Settings**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

   **No changes needed** - Vercel detects everything automatically.

4. **Add Environment Variables** (see [Environment Variables section](#environment-variables-for-production)):
   - Click **"Environment Variables"** in Vercel project settings
   - Add all required variables (copy from `.env.local` but use production values)
   - **Important**: Add variables to **Production** environment

5. **Deploy**:
   - Click **"Deploy"**
   - Wait for build to complete (~2-3 minutes)
   - Your site will be live at `https://shopmatch-pro-xxx.vercel.app`

### Step 3: Deploy via Vercel CLI (Alternative)

```bash
# Navigate to project directory
cd /path/to/shopmatch-pro

# Deploy to production
vercel --prod

# Follow prompts to configure project
# Vercel will detect Next.js automatically
```

### Step 4: Configure Vercel Settings

**In Vercel Dashboard → Project Settings**:

1. **General**:
   - Project Name: `shopmatch-pro`
   - Framework: Next.js
   - Node.js Version: 18.x (or latest LTS)

2. **Domains**:
   - Add your custom domain (see [Domain Configuration](#domain-configuration))
   - Vercel will provide DNS instructions

3. **Environment Variables**:
   - Add all production environment variables
   - See [Environment Variables section](#environment-variables-for-production)

4. **Git**:
   - Production Branch: `main`
   - Enable automatic deployments on push
   - Enable preview deployments for PRs (optional)

5. **Functions** (API Routes):
   - Region: Choose closest to your users (e.g., `us-east-1`, `eu-west-1`)
   - Timeout: 10 seconds (default, increase if needed)

---

## Alternative Platforms

### Netlify Deployment

1. **Push code to GitHub** (same as Vercel)

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect to GitHub and select repository

3. **Configure Build Settings**:
   ```yaml
   # netlify.toml (create this file in project root)
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

4. **Add Environment Variables**:
   - In Netlify Dashboard → Site Settings → Environment Variables
   - Add all variables from [Environment Variables section](#environment-variables-for-production)

5. **Deploy**:
   - Click **"Deploy site"**
   - Wait for build to complete

### Railway Deployment

1. **Create `Dockerfile`** (in project root):
   ```dockerfile
   FROM node:18-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm ci --only=production

   COPY . .
   RUN npm run build

   EXPOSE 3000

   CMD ["npm", "start"]
   ```

2. **Deploy to Railway**:
   - Go to [railway.app](https://railway.app)
   - Click **"New Project"** → **"Deploy from GitHub repo"**
   - Select repository
   - Railway will detect Dockerfile automatically

3. **Add Environment Variables**:
   - In Railway Dashboard → Variables
   - Add all variables from [Environment Variables section](#environment-variables-for-production)

4. **Configure Domain**:
   - Railway provides a free `railway.app` subdomain
   - Add custom domain in settings

---

## Firebase Production Configuration

### Create Production Firebase Project

**Important**: Use a separate Firebase project for production (don't use your development project).

1. **Create New Project**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click **"Add project"**
   - Name: `shopmatch-pro-production` (or your preferred name)
   - Enable Google Analytics (recommended for production)

2. **Enable Authentication**:
   - Go to **Authentication** → **Get started**
   - Enable **Email/Password**
   - Enable **Google** (configure OAuth consent screen)
   - Add authorized domains (your production domain)

3. **Create Firestore Database**:
   - Go to **Firestore Database** → **Create database**
   - Choose **"Start in production mode"** (we'll add security rules next)
   - Select location (choose closest to your users)

4. **Deploy Firestore Security Rules**:
   ```bash
   # Install Firebase CLI if not already installed
   npm install -g firebase-tools

   # Login to Firebase
   firebase login

   # Initialize Firebase (if not done)
   firebase init firestore

   # Deploy security rules
   firebase deploy --only firestore:rules
   ```

   **Security Rules** (`firestore.rules`):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Helper function: Check if user is authenticated
       function isAuthenticated() {
         return request.auth != null;
       }

       // Helper function: Check if user is owner of document
       function isOwner(userId) {
         return isAuthenticated() && request.auth.uid == userId;
       }

       // Users collection: Users can read/write their own document
       match /users/{userId} {
         allow read: if isAuthenticated();
         allow write: if isOwner(userId);
       }

       // Jobs collection: Authenticated users can read, owners can CRUD own jobs
       match /jobs/{jobId} {
         allow read: if true; // Public read
         allow create: if isAuthenticated()
                       && request.auth.token.subActive == true; // Subscription required
         allow update, delete: if isOwner(resource.data.ownerId);
       }

       // Applications collection: Seekers can create, owners can read/update
       match /applications/{applicationId} {
         allow create: if isAuthenticated()
                       && request.auth.uid == request.resource.data.seekerId;
         allow read: if isAuthenticated()
                     && (isOwner(resource.data.seekerId)
                         || isOwner(resource.data.ownerId));
         allow update: if isAuthenticated()
                       && isOwner(resource.data.ownerId); // Only owner can update status
         allow delete: if isAuthenticated()
                       && isOwner(resource.data.seekerId); // Only applicant can withdraw
       }
     }
   }
   ```

5. **Get Firebase Configuration**:

   **Client-Side Config** (for `NEXT_PUBLIC_` variables):
   - Go to **Project Settings** → **General**
   - Scroll to "Your apps" → Click **Web** icon `</>`
   - Register app: `ShopMatch Pro Production`
   - Copy config values

   **Server-Side Config** (for Firebase Admin):
   - Go to **Project Settings** → **Service accounts**
   - Click **"Generate new private key"**
   - Save the JSON file securely
   - Extract values for environment variables

---

## Stripe Production Configuration

### Switch to Production Mode

**Important**: Use Stripe production keys, not test keys.

1. **Verify Production Mode**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Toggle switch in top right: **"View test data"** should be OFF
   - You should see **"Production"** or no label

2. **Get Production API Keys**:
   - Go to **Developers** → **API keys**
   - Copy **Secret key** (starts with `sk_live_...`)
   - Copy **Publishable key** (starts with `pk_live_...`)

3. **Create Production Product and Price**:
   - Go to **Products** → **Add product**
   - Name: `ShopMatch Pro Subscription`
   - Description: `Monthly subscription for job posting access`
   - Pricing model: **Recurring**
   - Price: `$29.99` (or your pricing)
   - Billing period: **Monthly**
   - Click **"Save product"**
   - Copy **Price ID** (starts with `price_...`)

4. **Configure Production Webhook**:
   - Go to **Developers** → **Webhooks**
   - Click **"Add endpoint"**
   - Endpoint URL: `https://yourdomain.com/api/stripe/webhook`
   - Listen to events on: **Your account**
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Click **"Add endpoint"**
   - Copy **Signing secret** (starts with `whsec_...`)

5. **Test Production Webhook**:
   ```bash
   # In Stripe Dashboard → Webhooks → Your endpoint
   # Click "Send test webhook"
   # Select "checkout.session.completed"
   # Check your production logs to verify receipt
   ```

---

## Environment Variables for Production

### Required Environment Variables

Add these to your hosting platform (Vercel, Netlify, etc.):

```bash
# ===== Firebase Client-Side (Public) =====
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...your_production_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=shopmatch-pro-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=shopmatch-pro-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=shopmatch-pro-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# ===== Firebase Admin (Server-Side) =====
FIREBASE_PROJECT_ID=shopmatch-pro-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@shopmatch-pro-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRODUCTION_KEY\n-----END PRIVATE KEY-----\n"

# ===== Stripe (Production Mode) =====
STRIPE_SECRET_KEY=sk_live_your_production_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
STRIPE_PRICE_ID_PRO=price_your_production_price_id

# ===== Application Configuration =====
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# ===== Optional: Stripe Publishable Key (Client-Side) =====
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_publishable_key
```

### Adding Variables to Vercel

**Via Vercel Dashboard**:
1. Go to **Project Settings** → **Environment Variables**
2. Click **"Add new variable"**
3. For each variable:
   - Enter **Key** (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`)
   - Enter **Value**
   - Select **Environment**: Production (and Preview/Development if needed)
   - Click **"Save"**

**Via Vercel CLI**:
```bash
# Add single variable
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY

# Or bulk import from .env file
vercel env pull .env.production.local
# Edit .env.production.local with production values
vercel env push .env.production.local production
```

### Adding Variables to Netlify

**Via Netlify Dashboard**:
1. Go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Select **"Import from a .env file"** (optional)
4. Or manually add each key-value pair
5. Click **"Save"**

### Security Notes

- **Never commit `.env.local` or `.env.production` to version control**
- **Use different Firebase projects for dev/staging/production**
- **Use Stripe test mode for development, live mode for production**
- **Rotate keys periodically** (especially if exposed)

---

## Domain Configuration

### Using Vercel Domain

**Free `.vercel.app` subdomain** (e.g., `shopmatch-pro.vercel.app`):
- Provided automatically on deployment
- HTTPS enabled by default
- No configuration needed

**Custom domain** (e.g., `shopmatch.com`):

1. **Purchase Domain** (if not owned):
   - Recommended: Vercel Domains, Namecheap, Google Domains

2. **Add Domain to Vercel**:
   - Go to **Project Settings** → **Domains**
   - Click **"Add"**
   - Enter your domain (e.g., `shopmatch.com`)
   - Click **"Add"**

3. **Configure DNS**:

   **Option A: Use Vercel Nameservers** (Recommended):
   - Vercel provides nameservers: `ns1.vercel-dns.com`, `ns2.vercel-dns.com`
   - In your domain registrar, update nameservers to Vercel's
   - Wait for DNS propagation (5-60 minutes)

   **Option B: Use CNAME Record**:
   - In your domain registrar's DNS settings:
     - Add CNAME record: `www` → `cname.vercel-dns.com`
     - Add A record: `@` → `76.76.21.21` (Vercel IP)
   - Wait for DNS propagation

4. **Verify Domain**:
   - In Vercel, you'll see **"Valid Configuration"** when DNS is correct
   - HTTPS certificate is automatically provisioned (Let's Encrypt)

5. **Update Environment Variables**:
   ```bash
   # In Vercel → Environment Variables
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

6. **Update Firebase and Stripe**:
   - **Firebase**: Add `yourdomain.com` to authorized domains (Firebase Console → Authentication → Settings → Authorized domains)
   - **Stripe**: Update webhook endpoint URL to `https://yourdomain.com/api/stripe/webhook`

---

## Post-Deployment Verification

### Smoke Test Checklist

After deployment, verify all systems are operational:

1. **Homepage Loads**:
   ```bash
   curl https://yourdomain.com
   # Should return HTML with status 200
   ```

2. **Health Check Passes**:
   ```bash
   curl https://yourdomain.com/api/health
   # Expected: {"status":"ok","checks":{"firebase":true,"stripe":true,"environment":true}}
   ```

3. **Stripe Endpoints Ready**:
   ```bash
   # Webhook endpoint
   curl https://yourdomain.com/api/stripe/webhook
   # Expected: {"message":"Stripe webhook endpoint ready",...}

   # Checkout endpoint
   curl https://yourdomain.com/api/stripe/checkout
   # Expected: {"message":"Stripe checkout endpoint ready",...}
   ```

4. **Authentication Works**:
   - Visit `https://yourdomain.com/signup`
   - Create test account (email/password)
   - Verify user appears in Firebase Console → Authentication

5. **Subscription Flow Works**:
   - Log in to test account
   - Visit `https://yourdomain.com/subscribe`
   - Click "Subscribe Now"
   - Complete checkout with real payment method
   - Verify subscription in Stripe Dashboard → Customers
   - Verify webhook event received in Stripe Dashboard → Webhooks → Logs

6. **Protected Routes Work**:
   - Log out and try to access protected routes
   - Should redirect to login page

### Monitoring Initial Traffic

**Check Vercel Logs**:
- Go to **Vercel Dashboard** → **Deployments** → Latest deployment
- Click **"View Function Logs"**
- Look for errors or warnings

**Check Firebase Logs**:
- Go to **Firebase Console** → **Functions** (if using Cloud Functions)
- Check for authentication errors

**Check Stripe Logs**:
- Go to **Stripe Dashboard** → **Developers** → **Logs**
- Filter by webhook events
- Verify `checkout.session.completed` events are received

---

## Monitoring & Logging

### Vercel Analytics (Built-in)

**Enable Vercel Analytics**:
1. Go to **Vercel Dashboard** → **Analytics** tab
2. Click **"Enable Analytics"**
3. View real-time and historical data:
   - Page views
   - Unique visitors
   - Top pages
   - Real User Monitoring (Core Web Vitals)

**Free Tier Limits**: 100K page views/month

### Error Monitoring with Sentry

**Recommended for production error tracking**:

1. **Create Sentry Account**:
   - Go to [sentry.io](https://sentry.io)
   - Sign up for free (50K errors/month)

2. **Install Sentry**:
   ```bash
   npm install @sentry/nextjs
   ```

3. **Configure Sentry**:
   ```bash
   # Run Sentry wizard
   npx @sentry/wizard@latest -i nextjs

   # Follow prompts to configure
   ```

4. **Add Sentry DSN to Environment Variables**:
   ```bash
   # In Vercel → Environment Variables
   NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
   ```

5. **Test Error Tracking**:
   ```typescript
   // Add test error in a page component
   import * as Sentry from '@sentry/nextjs'

   export default function TestPage() {
     const handleClick = () => {
       Sentry.captureException(new Error('Test error from production'))
     }

     return <button onClick={handleClick}>Trigger Test Error</button>
   }
   ```

### Uptime Monitoring

**Free Options**:
- **UptimeRobot**: Free monitoring for up to 50 sites (5-minute intervals)
- **Vercel Monitoring**: Built-in (Pro plan only)
- **Cronitor**: Free tier available

**Setup UptimeRobot**:
1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Add monitor:
   - Type: HTTP(s)
   - URL: `https://yourdomain.com/api/health`
   - Interval: 5 minutes
3. Configure alert contacts (email, SMS)

---

## Security Hardening

### 1. Firebase Security Rules Review

**Review and test Firestore rules**:
```bash
# Test rules locally
npm install -g @firebase/rules-unit-testing
firebase emulators:start --only firestore

# Run security rules tests (create tests first)
npm test
```

**Production Checklist**:
- [ ] Users can only read/write their own documents
- [ ] Job creation requires `subActive` custom claim
- [ ] Job editing restricted to job owner
- [ ] Application creation requires authentication
- [ ] Application status updates restricted to job owner

### 2. Stripe Webhook Security

**Verify webhook signature verification is enabled**:
- Check `src/app/api/stripe/webhook/route.ts`
- Ensure `stripe.webhooks.constructEvent()` is used
- Never skip signature verification in production

### 3. Environment Variable Security

**Verify no secrets in client bundle**:
```bash
# Build production
npm run build

# Search for sensitive strings in client bundle
grep -r "sk_live" .next/static/
grep -r "FIREBASE_PRIVATE_KEY" .next/static/

# Should return no results (all secrets server-side only)
```

### 4. Content Security Policy (CSP)

**Add CSP headers** (in `next.config.ts`):
```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.firebase.googleapis.com https://api.stripe.com",
              "frame-src https://js.stripe.com"
            ].join('; ')
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ]
  }
}

export default nextConfig
```

### 5. Rate Limiting

**Add rate limiting to API routes** (using Vercel):

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true
})

// Usage in API route
import { ratelimit } from '@/lib/rate-limit'

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown'
  const { success } = await ratelimit.limit(ip)

  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // Continue with normal logic
}
```

**Setup**:
1. Create [Upstash](https://upstash.com) account (free tier)
2. Create Redis database
3. Add environment variables:
   ```bash
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

### 6. Firebase App Check (DDoS Protection)

**Enable App Check**:
1. Go to **Firebase Console** → **App Check**
2. Click **"Get started"**
3. Register your app
4. Select provider: **reCAPTCHA v3** (for web)
5. Add reCAPTCHA site key to environment variables:
   ```bash
   NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
   ```

---

## Troubleshooting

### Deployment Fails

**Issue**: Build fails with "Module not found" error

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

**Issue**: "FIREBASE_PRIVATE_KEY is invalid"

**Solution**:
- Ensure private key has escaped newlines (`\n` not actual newlines)
- In Vercel, paste the entire key including quotes
- Example: `"-----BEGIN PRIVATE KEY-----\nMIIE..."`

### Environment Variables Not Working

**Issue**: App can't connect to Firebase or Stripe

**Solution**:
1. Verify all environment variables are set in hosting platform
2. Check variable names exactly match (case-sensitive)
3. Redeploy after adding variables (some platforms require manual redeploy)
4. Check production build logs for errors

### Webhook Not Receiving Events

**Issue**: Stripe webhooks not firing

**Solution**:
1. Verify webhook endpoint URL in Stripe Dashboard matches deployed URL
2. Check webhook signing secret matches environment variable
3. Look at Stripe webhook logs for failed attempts
4. Verify endpoint is accessible:
   ```bash
   curl https://yourdomain.com/api/stripe/webhook
   ```

### Custom Domain Not Working

**Issue**: DNS not resolving

**Solution**:
1. Wait for DNS propagation (can take up to 48 hours, usually 5-60 minutes)
2. Verify DNS records are correct:
   ```bash
   dig yourdomain.com
   # Should show Vercel IP or CNAME
   ```
3. Check Vercel domain settings show "Valid Configuration"
4. Clear DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache

   # Windows
   ipconfig /flushdns
   ```

### 500 Internal Server Error

**Issue**: API routes return 500 errors

**Solution**:
1. Check Vercel function logs:
   - Go to **Deployments** → Latest → **View Function Logs**
2. Look for specific error messages
3. Common causes:
   - Firebase Admin SDK not initialized (missing service account)
   - Stripe secret key invalid
   - Database connection error

### Firebase Authentication Not Working

**Issue**: Users can't sign in/sign up

**Solution**:
1. Verify authorized domains in Firebase Console:
   - Go to **Authentication** → **Settings** → **Authorized domains**
   - Add your production domain
2. Check Firebase client configuration in environment variables
3. Ensure Firebase Auth is enabled in Firebase Console

---

## Post-Launch Checklist

After successful deployment, complete these tasks:

### Immediate (Day 1)

- [ ] Test all authentication flows (signup, login, logout)
- [ ] Test subscription checkout flow with real card
- [ ] Verify webhook events are received in Stripe
- [ ] Check error monitoring is working (Sentry)
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Test on mobile devices
- [ ] Test in different browsers (Chrome, Firefox, Safari)

### Week 1

- [ ] Monitor error rates in Sentry
- [ ] Review Stripe webhook logs daily
- [ ] Check Firebase usage and quotas
- [ ] Verify HTTPS is working correctly
- [ ] Test all user flows end-to-end
- [ ] Set up Google Analytics (optional)
- [ ] Create backup of Firebase data

### Month 1

- [ ] Review Vercel analytics (traffic, performance)
- [ ] Optimize slow pages (check Vercel Speed Insights)
- [ ] Review Firebase costs and optimize queries
- [ ] Review Stripe transaction costs
- [ ] Implement additional features from roadmap
- [ ] Collect user feedback
- [ ] Plan for scaling if needed

---

## Cost Monitoring

### Expected Monthly Costs

| Service | Tier | Usage | Cost |
|---------|------|-------|------|
| Vercel | Hobby | < 100GB bandwidth | $0 |
| Firebase | Blaze (pay-as-you-go) | ~10K reads/writes/day | ~$5-25 |
| Stripe | Standard | 2.9% + $0.30/transaction | Variable |
| Domain | Annual | N/A | ~$12/year |
| **Total** | | | **~$5-25/month** |

**Scaling Costs** (1,000+ users):
- Vercel Pro: $20/month
- Firebase: $25-100/month
- Stripe: Transaction fees only
- **Total**: ~$50-150/month

### Cost Optimization Tips

1. **Enable Firebase Budget Alerts**:
   - Go to **Firebase Console** → **Usage and Billing**
   - Set budget alerts at $10, $25, $50

2. **Optimize Firestore Queries**:
   - Use `.limit()` to prevent over-reading
   - Create composite indexes for complex queries
   - Cache frequently accessed data client-side

3. **Monitor Vercel Bandwidth**:
   - Optimize images (use Next.js Image component)
   - Enable caching for static assets
   - Use CDN for large files

---

## Support & Resources

### Official Documentation

- **Next.js**: [nextjs.org/docs](https://nextjs.org/docs)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Firebase**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Stripe**: [stripe.com/docs](https://stripe.com/docs)

### ShopMatch Pro Documentation

- **Quick Start**: [QUICK_START.md](./QUICK_START.md)
- **Project Status**: [PROJECT_STATUS.md](./PROJECT_STATUS.md)
- **Architecture**: [CLAUDE.md](./CLAUDE.md)
- **Implementation Plan**: [MVP_IMPLEMENTATION_PLAN.md](./MVP_IMPLEMENTATION_PLAN.md)

### Community & Support

- **Next.js Discord**: [nextjs.org/discord](https://nextjs.org/discord)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Firebase Community**: [firebase.google.com/community](https://firebase.google.com/community)
- **Stripe Support**: [support.stripe.com](https://support.stripe.com)

---

**Deployment Status**: Ready for production with proper configuration ✅
**Last Updated**: 2025-10-13
**Next Review**: After first production deployment

---

**Need help?** Review the troubleshooting section above or consult the official documentation links.
