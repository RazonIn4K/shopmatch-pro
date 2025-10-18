# Production Deployment Verification Checklist

## Status: API Documentation Aligned ✅

**Last Updated**: 2025-10-18
**PR #33**: Merged - API spec now matches implementation
**Local Verification**: Complete

---

## Pre-Flight Verification (Completed ✅)

### 1. Local Code Quality
- ✅ **Lint Check**: `npm run lint` - No errors
- ✅ **Frontend HTTP Methods**: Uses `PUT` for job updates (not `PATCH`)
- ✅ **No Phantom DELETE**: No calls to non-existent `DELETE /api/applications/{id}`
- ✅ **CI Passing**: All 9 checks green on PR #33

### 2. API Documentation Alignment
- ✅ **Endpoint Methods**: PATCH→PUT for `/api/jobs/{id}` corrected
- ✅ **Response Envelopes**: All endpoints now document `{ message, <resource> }` format
- ✅ **Missing Endpoints**: Added `GET /api/applications/{id}` and `GET /api/applications/export`
- ✅ **Query Parameters**: Documented 11 params across `GET /api/jobs` and `GET /api/applications`
- ✅ **Error Codes**: Added 400, 404, 409, 422, 429 status codes
- ✅ **Cascade Clarification**: DELETE job does NOT cascade to applications (documented)

---

## Production Deployment Checklist

### Step 1: Get Your Production URL

Your production URL is one of:
1. **Custom domain** (if configured in Vercel): `https://your-custom-domain.com`
2. **Vercel auto-domain**: `https://your-project.vercel.app`

**How to find it**:
```bash
# Option A: Check Vercel dashboard
# Navigate to: Vercel Dashboard → Your Project → Deployments → Production

# Option B: Check environment variables (if set)
echo $NEXT_PUBLIC_APP_URL  # Your configured public URL
```

**Replace `YOUR-PRODUCTION-HOST` in all commands below with your actual URL.**

---

### Step 2: Platform Verification (30 seconds)

Verify deployment is served by Vercel:

```bash
curl -sS -D - https://YOUR-PRODUCTION-HOST/ | head -n 20
```

**Expected**:
- `server: Vercel` header present
- `x-vercel-id` header present
- Status 200 with HTML response

**If this fails**: Deployment not live or DNS not configured

---

### Step 3: Health Check - Critical (5 seconds)

**Most important check** - validates all 13 required environment variables:

```bash
curl -sS https://YOUR-PRODUCTION-HOST/api/health | jq .
```

**Expected Success Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T07:00:00.000Z",
  "environment": "production",
  "checks": {
    "firebase": true,
    "stripe": true,
    "environment": true
  },
  "envDetails": {
    "totalRequired": 13,
    "totalPresent": 13,
    "missingCount": 0,
    "missingVars": []
  }
}
```

**If Misconfigured** (missing env vars):
```json
{
  "status": "error",
  "checks": {
    "firebase": false,
    "stripe": false,
    "environment": false
  },
  "errors": ["Missing 3 required environment variables"],
  "envDetails": {
    "totalRequired": 13,
    "totalPresent": 10,
    "missingCount": 3,
    "missingVars": [
      "STRIPE_WEBHOOK_SECRET",
      "FIREBASE_PRIVATE_KEY",
      "FIREBASE_CLIENT_EMAIL"
    ]
  }
}
```

**Action if failed**: Fix missing environment variables in Vercel dashboard before proceeding.

---

### Step 4: Stripe Endpoints Reachable (10 seconds)

Verify all three Stripe endpoints are live and running on Node.js runtime:

```bash
# Checkout endpoint (debug GET)
curl -sS https://YOUR-PRODUCTION-HOST/api/stripe/checkout | jq .

# Expected: { "message": "Stripe checkout endpoint ready", ... }
```

```bash
# Portal endpoint (debug GET)
curl -sS https://YOUR-PRODUCTION-HOST/api/stripe/portal | jq .

# Expected: { "message": "Stripe customer portal endpoint ready", ... }
```

```bash
# Webhook endpoint (debug GET)
curl -sS https://YOUR-PRODUCTION-HOST/api/stripe/webhook | jq .

# Expected: { "message": "Stripe webhook endpoint ready", ... }
```

**What this proves**:
- All Stripe routes are deployed and accessible
- Node.js runtime is active (required for Stripe SDK)
- Raw body parsing configured (required for webhook signatures)

**If any fail**: Check Vercel deployment logs for runtime errors

---

### Step 5: Base URL & Metadata (30 seconds)

Verify metadata base URL is correctly set:

```bash
curl -sS https://YOUR-PRODUCTION-HOST/ | grep -i "og:url\|canonical"
```

**Expected**:
- `<link rel="canonical" href="https://YOUR-PRODUCTION-HOST/" />`
- `<meta property="og:url" content="https://YOUR-PRODUCTION-HOST/" />`

**Base URL Priority** (code logic):
1. `NEXT_PUBLIC_APP_URL` (recommended - set this in Vercel)
2. `NEXT_PUBLIC_VERCEL_URL`
3. `VERCEL_URL`
4. `VERCEL_PROJECT_PRODUCTION_URL`
5. `localhost:3000` (fallback)

**Action if incorrect**: Set `NEXT_PUBLIC_APP_URL` environment variable in Vercel

---

## Manual Testing Checklist

### End-to-End Subscription Flow (5 minutes)

#### Prerequisites:
1. Create test owner account:
   ```bash
   npm run create-user
   # Creates: owner@shopmatchpro.com (owner role, subActive=true)
   ```

2. Ensure Stripe is in **test mode** with test keys in Vercel environment

#### Test Flow:
1. ✅ Sign in at `https://YOUR-PRODUCTION-HOST/login`
2. ✅ Navigate to `/subscribe`
3. ✅ Click "Subscribe" button
   - **Expect**: Redirect to `checkout.stripe.com`
   - **Backend**: `POST /api/stripe/checkout` creates session
4. ✅ Complete test payment on Stripe checkout page
   - Use test card: `4242 4242 4242 4242` (any future date, any CVC)
5. ✅ After payment, redirect back to app
   - **Expect**: Land at `/dashboard?success=true`
   - **Backend**: Stripe webhook fired `checkout.session.completed`
6. ✅ Verify subscription active
   - Check Firebase custom claims: `subActive: true`
   - Check Firestore: `users/{uid}.stripeCustomerId` populated

#### Webhook Testing Without Payment:

```bash
# Install Stripe CLI if not already installed
# brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to production
stripe listen --forward-to https://YOUR-PRODUCTION-HOST/api/stripe/webhook

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

**What to verify**:
- Webhook endpoint receives events (check logs)
- Firebase custom claims updated (`subActive` toggled)
- Firestore user documents updated (`stripeCustomerId` linked)

---

### Authenticated API Testing (2 minutes per endpoint)

**Get Firebase ID Token**:
```javascript
// In browser console after signing in:
const user = firebase.auth().currentUser
const token = await user.getIdToken()
console.log(token)  // Copy this token
```

Or use the user creation script output.

#### Test Job CRUD:

```bash
# Set your token
export TOKEN="your-firebase-id-token-here"

# 1. List jobs (requires auth)
curl -sS -H "Authorization: Bearer $TOKEN" \
  https://YOUR-PRODUCTION-HOST/api/jobs | jq .

# Expected: { "jobs": [...], "pagination": { "page": 1, "limit": 20, ... } }
```

```bash
# 2. Create job (requires owner + subActive=true)
curl -sS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Full-Stack Engineer",
    "description": "We are looking for an experienced full-stack engineer to join our team and build amazing products.",
    "company": "ShopMatch Inc.",
    "location": "San Francisco, CA (Remote)",
    "type": "full-time",
    "status": "published"
  }' \
  https://YOUR-PRODUCTION-HOST/api/jobs | jq .

# Expected: { "message": "Job created successfully", "job": { ... } }
# Save the job ID from response
```

```bash
# 3. Update job (requires owner + ownership verification)
# Replace JOB_ID with actual ID from create response
export JOB_ID="job_abc123"

curl -sS -X PUT \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Full-Stack Engineer (Updated)",
    "description": "Updated description...",
    "company": "ShopMatch Inc.",
    "location": "San Francisco, CA (Remote)",
    "type": "full-time",
    "status": "published"
  }' \
  https://YOUR-PRODUCTION-HOST/api/jobs/$JOB_ID | jq .

# Expected: { "message": "Job updated successfully", "job": { ... } }
```

```bash
# 4. Delete job (requires owner + ownership verification)
curl -sS -X DELETE \
  -H "Authorization: Bearer $TOKEN" \
  https://YOUR-PRODUCTION-HOST/api/jobs/$JOB_ID | jq .

# Expected: { "message": "Job deleted successfully" }
# NOTE: Does NOT cascade delete applications (cascade code commented out)
```

#### Test Application Workflow:

```bash
# 1. Apply to job (requires seeker role)
curl -sS -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coverLetter": "I am very interested in this position and believe I would be a great fit..."
  }' \
  https://YOUR-PRODUCTION-HOST/api/jobs/$JOB_ID/apply | jq .

# Expected: { "message": "Application submitted successfully", "application": { ... } }
# Save the application ID from response
```

```bash
# 2. List applications (role-filtered)
curl -sS -H "Authorization: Bearer $TOKEN" \
  https://YOUR-PRODUCTION-HOST/api/applications | jq .

# Expected: { "applications": [...] }
# Owner sees: applications to their jobs
# Seeker sees: their own applications
```

```bash
# 3. Get single application (requires seeker (own) or owner (job owner))
export APP_ID="app_xyz789"

curl -sS -H "Authorization: Bearer $TOKEN" \
  https://YOUR-PRODUCTION-HOST/api/applications/$APP_ID | jq .

# Expected: { "application": { ... } }
```

```bash
# 4. Update application status (requires owner of job)
curl -sS -X PATCH \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "reviewed",
    "notes": "Great candidate, moving forward to interview"
  }' \
  https://YOUR-PRODUCTION-HOST/api/applications/$APP_ID | jq .

# Expected: { "message": "Application updated successfully", "application": { ... } }
# Note: reviewedAt timestamp automatically set when status changes from pending
```

#### Test CSV Export (owner only, rate-limited):

```bash
curl -sS -D - -H "Authorization: Bearer $TOKEN" \
  https://YOUR-PRODUCTION-HOST/api/applications/export \
  -o applications.csv

# Expected:
# - Status: 200 OK
# - Headers: Content-Type: text/csv, Content-Disposition: attachment
# - Headers: X-RateLimit-Limit: 5, X-RateLimit-Remaining: 4
# - File: applications.csv with data

# If rate limited (5 exports/hour exceeded):
# - Status: 429 Too Many Requests
# - Headers: Retry-After: <seconds>
# - Body: { "error": "Rate limit exceeded", "retryAfter": 2700, ... }
```

---

## Firebase Auth Configuration

### Critical: Authorized Domains

If using a **custom domain**, you MUST add it to Firebase Auth:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Authentication → Settings → Authorized domains**
4. Click **Add domain**
5. Enter your production domain (e.g., `shopmatch-pro.com`)
6. Save

**Without this**: Login will be blocked on production with error:
```
This domain is not authorized for OAuth operations for your Firebase project.
```

---

## Production Environment Variables Checklist

Verify all 13 required variables are set in Vercel:

### Firebase (8 variables)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`
- [ ] `FIREBASE_CLIENT_EMAIL` (service account)
- [ ] `FIREBASE_PRIVATE_KEY` (service account, must include `BEGIN/END PRIVATE KEY` markers)

### Stripe (3 variables)
- [ ] `STRIPE_SECRET_KEY` (live or test key)
- [ ] `STRIPE_WEBHOOK_SECRET` (webhook signing secret from Stripe Dashboard)
- [ ] `STRIPE_PRICE_ID_PRO` (price ID for Pro subscription)

### Application (2 variables)
- [ ] `NEXT_PUBLIC_APP_URL` (your production domain, e.g., `https://shopmatch-pro.com`)
- [ ] `FIREBASE_PROJECT_ID` (redundant with NEXT_PUBLIC_FIREBASE_PROJECT_ID, but required by admin SDK)

**Verification command**: Run Step 3 (Health Check) above

---

## Stripe Production Configuration

### Webhook Endpoint Setup

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter endpoint URL: `https://YOUR-PRODUCTION-HOST/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the **Signing secret** (starts with `whsec_`)
6. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
7. Redeploy (Vercel auto-redeploys on env var changes)

**Security Note**: The webhook endpoint uses **raw body signature verification** per Stripe's security best practices. This prevents spoofed events.

---

## Common Issues & Troubleshooting

### 1. Health Check Returns "error" Status
**Symptom**: `/api/health` shows `status: "error"` with missing environment variables

**Fix**:
1. Check `envDetails.missingVars` array in response
2. Add missing variables to Vercel dashboard
3. Redeploy (or wait for auto-redeploy)
4. Re-run health check

### 2. Stripe Webhook Failing
**Symptom**: Webhook events not processing, subscription status not updating

**Possible causes**:
- `STRIPE_WEBHOOK_SECRET` not set or incorrect
- Webhook endpoint URL incorrect in Stripe Dashboard
- Firestore security rules blocking writes
- Firebase Admin SDK credentials invalid

**Debug**:
```bash
# Check Vercel function logs:
# Vercel Dashboard → Your Project → Functions → /api/stripe/webhook → Logs

# Test locally with Stripe CLI:
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
stripe trigger checkout.session.completed
```

### 3. 403 Forbidden on Authenticated Endpoints
**Symptom**: API calls with valid token return 403

**Possible causes**:
- Token expired (1 hour expiration)
- Custom claims not set (`subActive: false` for owner trying to create job)
- User role mismatch (seeker trying owner endpoint)
- Firestore ownership verification failed

**Debug**:
```bash
# Check token validity:
curl -sS -H "Authorization: Bearer $TOKEN" \
  https://YOUR-PRODUCTION-HOST/api/health

# If health check works but other endpoints don't, check custom claims:
# Firebase Console → Authentication → Users → Select user → Custom claims
```

### 4. Login Blocked on Custom Domain
**Symptom**: "This domain is not authorized for OAuth operations"

**Fix**: Add custom domain to Firebase Auth Authorized Domains (see section above)

### 5. Metadata URLs Incorrect (SEO)
**Symptom**: Canonical/OpenGraph URLs show Vercel domain instead of custom domain

**Fix**: Set `NEXT_PUBLIC_APP_URL` environment variable in Vercel to your custom domain

---

## Recommended: Production Monitoring

### 1. Uptime Monitor
Set up external monitoring on `/api/health`:
- **URL**: `https://YOUR-PRODUCTION-HOST/api/health`
- **Check interval**: 5 minutes
- **Alert on**: Status ≠ 200 OR `status !== "ok"` OR `envDetails.missingCount > 0`

**Services**: UptimeRobot, Pingdom, StatusCake (all have free tiers)

### 2. Error Monitoring
Install Sentry or similar for production error tracking:
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### 3. Vercel Logs
Monitor Vercel function logs for:
- Webhook processing errors
- Authentication failures
- Database connection issues

**Access**: Vercel Dashboard → Functions → Select function → Logs

---

## Post-Deployment Cleanup

### Optional: Regenerate SDK Clients

If you have generated TypeScript/API clients from OpenAPI spec:

```bash
# Install OpenAPI generator
npm install -g @openapitools/openapi-generator-cli

# Generate TypeScript client
openapi-generator-cli generate \
  -i docs/API_REFERENCE.yml \
  -g typescript-fetch \
  -o src/lib/api-client

# Update imports in codebase to use new client
```

**Why**: PR #33 fixed response envelopes and HTTP methods - regenerating ensures type safety

---

## Next Steps After Verification

1. ✅ Complete Step 1-5 above to verify production deployment
2. ✅ Run manual subscription flow test
3. ✅ Test authenticated API endpoints with real tokens
4. ✅ Set up production monitoring on `/api/health`
5. ✅ Configure Stripe webhooks in production mode
6. ✅ Add custom domain to Firebase Auth (if applicable)
7. ✅ (Optional) Regenerate API clients from updated OpenAPI spec

---

## Summary

**What's Verified Locally**:
- ✅ API documentation matches implementation (PR #33 merged)
- ✅ Frontend uses correct HTTP methods (PUT for jobs, no phantom DELETE)
- ✅ Lint passing, no code quality issues
- ✅ CI checks passing (9/9 green)

**What's Required for Production**:
- ⏳ Get production URL (custom domain or Vercel auto-domain)
- ⏳ Run health check to verify environment variables
- ⏳ Test Stripe endpoints for reachability
- ⏳ Manually test subscription flow end-to-end
- ⏳ Verify authenticated API endpoints with real tokens
- ⏳ Add custom domain to Firebase Auth (if applicable)
- ⏳ Configure Stripe webhooks in Dashboard

**Contact**: For issues or questions, refer to [DEPLOYMENT.md](./DEPLOYMENT.md) or repository Issues.
