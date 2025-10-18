# Deployment Guide - ShopMatch Pro

This guide covers deploying ShopMatch Pro to Vercel with Firebase and Stripe integrations.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Setup](#vercel-setup)
- [Environment Variables](#environment-variables)
- [Firebase Configuration](#firebase-configuration)
- [Stripe Configuration](#stripe-configuration)
- [Deployment Process](#deployment-process)
- [Post-Deployment Verification](#post-deployment-verification)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying, ensure you have:

- [ ] Vercel account with GitHub integration enabled
- [ ] Firebase project created with Firestore and Authentication enabled
- [ ] Stripe account with test and production API keys
- [ ] GitHub repository pushed with latest code
- [ ] All required environment variables ready (see checklist below)

## Vercel Setup

### 1. Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import your GitHub repository (`shopmatch-pro`)
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### 2. Configure Build Settings

**Important**: Leave all build settings as default. Next.js 15 with Turbopack is automatically detected.

## Environment Variables

### Base URL Configuration

ShopMatch Pro uses intelligent base URL detection with Vercel fallbacks:

```
Priority Order:
1. NEXT_PUBLIC_APP_URL (explicit - recommended for production)
2. NEXT_PUBLIC_VERCEL_URL (automatic for previews)
3. VERCEL_URL (server-side automatic)
4. VERCEL_PROJECT_PRODUCTION_URL (production domain)
5. http://localhost:3000 (development fallback)
```

**Production Recommendation**: Always set `NEXT_PUBLIC_APP_URL` to your canonical domain for stable metadata and redirects.

### Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

#### 1. Application Configuration

| Variable | Environment | Example | Description |
|----------|-------------|---------|-------------|
| `NEXT_PUBLIC_APP_URL` | Production | `https://shopmatch.pro` | **Recommended**: Canonical domain for metadata and Stripe redirects |
| `NEXT_PUBLIC_APP_URL` | Preview | *(leave empty)* | Previews auto-detect from `VERCEL_URL` |
| `NODE_ENV` | All | `production` | Node environment (auto-set by Vercel) |

#### 2. Firebase Client Configuration (NEXT_PUBLIC_*)

These are **safe to expose** to the browser:

| Variable | Value Source | Example |
|----------|--------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project Settings → Web App | `AIzaSyC...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Console | `shopmatch-pro.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase Console | `shopmatch-pro` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Console | `shopmatch-pro.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console | `123456789012` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase Console | `1:123456789012:web:abc123` |

**Where to Find**: Firebase Console → Project Settings → General → Your apps → SDK setup and configuration

#### 3. Firebase Admin SDK (Server-Side)

These are **sensitive** and only used server-side:

| Variable | Value Source | Notes |
|----------|--------------|-------|
| `FIREBASE_PROJECT_ID` | Firebase Console | Same as client project ID |
| `FIREBASE_CLIENT_EMAIL` | Service Account JSON | Format: `firebase-adminsdk-xxxxx@project-id.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Service Account JSON | **Important**: Paste entire key including `-----BEGIN PRIVATE KEY-----` |

**How to Get Service Account**:
1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file
4. Extract values:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep `\n` characters)

**Vercel Secret Handling**:
```bash
# When adding FIREBASE_PRIVATE_KEY in Vercel UI:
# 1. Copy the entire private_key value from JSON (including quotes)
# 2. Paste as-is in Vercel environment variable input
# 3. Vercel will handle the newline characters correctly
```

#### 4. Stripe Configuration

| Variable | Environment | Value Source | Format |
|----------|-------------|--------------|--------|
| `STRIPE_SECRET_KEY` | Production | Stripe Dashboard → Developers → API Keys | `sk_live_...` |
| `STRIPE_SECRET_KEY` | Preview/Dev | Stripe Dashboard → API Keys (Test Mode) | `sk_test_...` |
| `STRIPE_PRICE_ID_PRO` | All | Stripe Dashboard → Products → Pricing | `price_...` |
| `STRIPE_WEBHOOK_SECRET` | Production | Stripe Dashboard → Webhooks | `whsec_...` |
| `STRIPE_WEBHOOK_SECRET` | Preview | Stripe CLI or test endpoint | `whsec_...` |

**Optional** (for client-side price display):
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_STRIPE_PRICE_ID_PRO` | Same as `STRIPE_PRICE_ID_PRO` |

### Environment Variable Scopes

Configure each variable for appropriate environments:

- **Production**: Required for production domain only
- **Preview**: Required for preview deployments (PR branches)
- **Development**: Required for local development (use `.env.local`)

**Recommendation**: Set most variables for "All" environments, except:
- Use **Production** `STRIPE_SECRET_KEY` (live mode) only for production
- Use **Preview + Development** `STRIPE_SECRET_KEY` (test mode) for testing

## Firebase Configuration

### 1. Firestore Security Rules Deployment

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy both together
firebase deploy --only firestore
```

**Verification**:
```bash
# Check deployed rules
firebase firestore:rules get

# Check index status
firebase firestore:indexes
```

### 2. Required Firestore Indexes

Ensure these composite indexes exist (defined in `firestore.indexes.json`):

1. **applications** collection:
   - `ownerId` (Ascending) + `createdAt` (Descending)
   - `seekerId` (Ascending) + `createdAt` (Descending)
   - `jobId` (Ascending) + `createdAt` (Descending)
   - `status` (Ascending) + `createdAt` (Descending)

2. **jobs** collection:
   - `ownerId` (Ascending) + `createdAt` (Descending)

**Status Check**: Firebase Console → Firestore Database → Indexes (all should be green/READY)

### 3. Authentication Setup

Enable authentication providers in Firebase Console:

1. Go to Authentication → Sign-in method
2. Enable **Email/Password**
3. Enable **Google** (configure OAuth consent screen)
4. Add authorized domains:
   - `localhost` (for development)
   - Your Vercel production domain (e.g., `shopmatch.pro`)
   - `*.vercel.app` (for preview deployments)

## Stripe Configuration

### 1. Webhook Endpoint Setup

#### Production Webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter webhook URL: `https://your-domain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

#### Preview/Development Webhook

Use Stripe CLI for local testing:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# Copy the webhook signing secret from output
# Add to .env.local as STRIPE_WEBHOOK_SECRET
```

### 2. Product and Price Setup

1. Go to Stripe Dashboard → Products
2. Create product: "ShopMatch Pro"
3. Add recurring price (e.g., $29/month)
4. Copy the Price ID (starts with `price_`)
5. Add to Vercel as `STRIPE_PRICE_ID_PRO`

### 3. Customer Portal Configuration

1. Go to Stripe Dashboard → Settings → Billing → Customer portal
2. Enable customer portal
3. Configure allowed features:
   - ✅ Update payment method
   - ✅ Cancel subscription
   - ✅ View invoice history
4. Set return URL: `https://your-domain.com/dashboard`

## Deployment Process

### Initial Deployment

1. **Push to GitHub** (triggers automatic Vercel deployment):
   ```bash
   git push origin main
   ```

2. **Monitor Build**:
   - Go to Vercel Dashboard → Deployments
   - Watch build logs for errors
   - Typical build time: 2-3 minutes

3. **Assign Domain** (Production):
   - Vercel Dashboard → Settings → Domains
   - Add your custom domain
   - Configure DNS records as instructed
   - Wait for SSL certificate provisioning (automatic)

### Preview Deployments

Every pull request automatically creates a preview deployment:

- **URL Format**: `shopmatch-pro-git-{branch}-{team}.vercel.app`
- **Environment**: Uses "Preview" environment variables
- **Base URL**: Auto-detected from `VERCEL_URL` (no `NEXT_PUBLIC_APP_URL` needed)
- **Stripe**: Uses test mode keys
- **Firebase**: Uses same production Firebase (consider separate test project)

### Production Deployment

Merging to `main` branch triggers production deployment:

- **URL**: Your custom domain
- **Environment**: Uses "Production" environment variables
- **Base URL**: Uses `NEXT_PUBLIC_APP_URL` for stable metadata
- **Stripe**: Uses live mode keys
- **Firebase**: Uses production Firebase project

## Post-Deployment Verification

### 1. Health Check

```bash
# Check system health
curl https://your-domain.com/api/health

# Expected response (all checks should be true):
{
  "status": "ok",
  "timestamp": "2025-10-18T12:00:00.000Z",
  "environment": "production",
  "checks": {
    "firebase": true,
    "stripe": true,
    "environment": true
  }
}
```

### 2. Metadata Verification

```bash
# Check that base URL is correct in metadata
curl -I https://your-domain.com

# Look for:
# - canonical link should point to your domain (not localhost or vercel.app)
# - og:url should use your domain
```

**Verify in Browser**:
1. Open your deployed site
2. View page source
3. Check `<link rel="canonical">` uses production domain
4. Check OpenGraph tags use production domain

### 3. End-to-End Flow Testing

#### Test Subscription Flow

1. **Create Test User**:
   ```bash
   npm run create-user
   # Follow prompts to create owner account
   ```

2. **Subscribe**:
   - Log in to deployed site
   - Navigate to `/subscribe`
   - Click "Subscribe to Pro"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Verify redirect back to dashboard

3. **Verify Subscription**:
   - Check Firestore: user document should have `stripeCustomerId`
   - Check Firebase Auth: custom claims should have `subActive: true`
   - Check Stripe Dashboard: subscription should be active

4. **Test Portal**:
   - Navigate to `/dashboard`
   - Click "Manage Subscription"
   - Verify portal opens and returns to dashboard

#### Test Job Posting Flow

1. **Create Job** (requires active subscription):
   - Navigate to `/jobs/new`
   - Fill in job details
   - Submit
   - Verify redirect to dashboard with new job listed

2. **Edit Job**:
   - Click job in dashboard
   - Edit details
   - Save changes
   - Verify updates persist

3. **Delete Job**:
   - Delete job from dashboard
   - Verify removal from Firestore

### 4. Stripe Webhook Verification

```bash
# Trigger test webhook from Stripe CLI
stripe trigger checkout.session.completed

# Or use Stripe Dashboard → Webhooks → Send test webhook

# Check Vercel logs for webhook processing:
# Vercel Dashboard → Deployments → [Latest] → Functions
# Look for /api/stripe/webhook logs
```

**Expected Log Entries**:
```
Webhook received: checkout.session.completed
User subscription updated: userId=abc123
Custom claims set: subActive=true
```

### 5. Error Monitoring

Check for errors in Vercel logs:

```bash
# View real-time logs
vercel logs --follow

# Filter errors only
vercel logs | grep ERROR
```

## Troubleshooting

### Base URL Issues

**Symptom**: Stripe redirects to localhost or wrong domain

**Cause**: `NEXT_PUBLIC_APP_URL` not set in production

**Fix**:
1. Vercel Dashboard → Settings → Environment Variables
2. Add `NEXT_PUBLIC_APP_URL` for "Production" environment
3. Set value to your canonical domain (e.g., `https://shopmatch.pro`)
4. Redeploy: Vercel Dashboard → Deployments → [Latest] → Redeploy

**Verify**:
```bash
# Check health endpoint shows correct base URL
curl https://your-domain.com/api/health | jq .
```

### Firebase Admin Errors

**Symptom**: `Firebase Admin credentials are missing in production`

**Cause**: Service account environment variables not set or incorrectly formatted

**Fix**:
1. Check all three variables are set:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
2. For `FIREBASE_PRIVATE_KEY`, ensure:
   - Includes `-----BEGIN PRIVATE KEY-----`
   - Includes `-----END PRIVATE KEY-----`
   - Contains `\n` characters (don't replace with actual newlines)
3. Redeploy after adding/fixing variables

**Test**:
```bash
# Run health check
curl https://your-domain.com/api/health

# Firebase check should be true
```

### Stripe Webhook Failures

**Symptom**: Subscriptions created in Stripe but not reflected in Firestore

**Cause**: Webhook signature verification failing or endpoint unreachable

**Debugging Steps**:

1. **Check Webhook Logs** (Stripe Dashboard → Developers → Webhooks):
   - Look for failed webhook attempts
   - Check response codes (should be 200)
   - View request/response details

2. **Verify Webhook Secret**:
   - Ensure `STRIPE_WEBHOOK_SECRET` matches the endpoint's signing secret
   - Re-generate and update if mismatched

3. **Test Webhook Manually**:
   ```bash
   # Use Stripe CLI
   stripe trigger checkout.session.completed --api-key YOUR_KEY

   # Check Vercel logs immediately
   vercel logs --follow
   ```

4. **Check Function Logs**:
   - Vercel Dashboard → Deployments → [Latest] → Functions
   - Click `/api/stripe/webhook`
   - Review execution logs for errors

**Common Errors**:
- `No signatures found matching the expected signature`: Wrong `STRIPE_WEBHOOK_SECRET`
- `Customer not found`: Stripe customer ID not in Firestore user document
- `User not found`: `client_reference_id` mismatch in checkout session

### Build Failures

**Symptom**: Deployment fails during build step

**Common Causes**:

1. **TypeScript Errors**:
   ```bash
   # Fix locally first
   npm run lint
   npx tsc --noEmit
   ```

2. **Missing Dependencies**:
   ```bash
   # Ensure package-lock.json is committed
   git add package-lock.json
   git commit -m "chore: update package-lock.json"
   ```

3. **Environment Variables in Build**:
   - Check if `NEXT_PUBLIC_*` variables are set for "Preview" and "Production"
   - Vercel requires these during build time

4. **Out of Memory**:
   - Increase Vercel function memory (Settings → Functions → Max Memory)
   - Default: 1024 MB, increase to 2048 MB if needed

### Database Connection Issues

**Symptom**: Firestore queries fail or timeout

**Checks**:

1. **Firestore Rules**: Ensure rules allow authenticated access
   ```bash
   firebase firestore:rules get
   ```

2. **Indexes**: All composite indexes should be READY
   ```bash
   firebase firestore:indexes
   ```

3. **Network**: Check Vercel function region matches Firebase region
   - Vercel: Settings → Functions → Region
   - Firebase: Console → Project Settings → GCP resource location

## Performance Optimization

### Vercel Configuration

Add `vercel.json` for production optimizations:

```json
{
  "regions": ["iad1"],
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

### Edge Caching

Consider using Vercel Edge Config for:
- Subscription tier definitions
- Feature flags
- Rate limiting rules

### Bundle Size Monitoring

```bash
# After deployment, check bundle size
npm run build

# Look for:
# First Load JS: should be ≤ 300 KB (enforced by CI)
```

## Security Checklist

Before going to production:

- [ ] All Stripe keys are in live mode (not test mode)
- [ ] Firebase security rules deployed and tested
- [ ] Firestore indexes are all in READY state
- [ ] `FIREBASE_PRIVATE_KEY` is secure (not in git history)
- [ ] Webhook signature verification is enabled
- [ ] Custom domain has valid SSL certificate
- [ ] `NEXT_PUBLIC_APP_URL` is set to canonical domain
- [ ] Error logs don't expose sensitive data
- [ ] Rate limiting configured (if applicable)
- [ ] CORS policies are restrictive
- [ ] All test users removed from production

## Rollback Procedure

If deployment causes issues:

1. **Instant Rollback** (Vercel Dashboard):
   - Go to Deployments
   - Find last working deployment
   - Click "..." → "Promote to Production"

2. **Git Revert** (for permanent rollback):
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

3. **Environment Variable Rollback**:
   - Vercel Dashboard → Settings → Environment Variables
   - Edit variable
   - Click "..." → "View History"
   - Restore previous value

## Monitoring

### Recommended Tools

- **Vercel Analytics**: Built-in performance monitoring
- **Sentry** (optional): Error tracking and alerting
- **Firebase Console**: Firestore usage and performance
- **Stripe Dashboard**: Payment monitoring and webhook logs

### Key Metrics to Monitor

1. **Application Health**:
   - `/api/health` endpoint response time
   - Success rate of API routes
   - Function execution duration

2. **User Experience**:
   - Page load times (Vercel Analytics)
   - Conversion rate (signup → subscription)
   - Checkout completion rate

3. **Infrastructure**:
   - Firestore read/write operations
   - Stripe API usage
   - Vercel function invocations

## Related Documentation

- [Environment Variables Reference](./ENVIRONMENT_VARIABLES.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [API Reference](./API_REFERENCE.yml)
- [Security Guidelines](./SECURITY.md)
- [Testing Guide](./TESTING.md)

---

**Last Updated**: 2025-10-18
**Vercel Dashboard**: https://vercel.com/dashboard
**Firebase Console**: https://console.firebase.google.com
**Stripe Dashboard**: https://dashboard.stripe.com
