# Stripe Webhook Production Setup

Complete guide for configuring Stripe webhooks in production to ensure subscription events synchronize with Firebase custom claims and Firestore user documents.

## Overview

The ShopMatch Pro subscription system relies on **webhook-driven synchronization** between Stripe and Firebase. When users subscribe, webhooks update Firebase custom claims (`subActive`) and Firestore user documents to enable/disable features.

**Critical Events**:
- `checkout.session.completed` - Initial subscription creation
- `customer.subscription.created` - Subscription activated
- `customer.subscription.updated` - Subscription renewed/changed
- `customer.subscription.deleted` - Subscription canceled/expired

## Prerequisites

1. **Production Environment Variables** - All Stripe and Firebase vars configured
2. **Deployed API** - Production app running at stable URL
3. **Stripe Account** - Test mode or live mode access
4. **Firebase Admin SDK** - Service account credentials configured

## Step 1: Deploy Application to Production

**Verify Deployment**:
```bash
# Health check (from docs/PRODUCTION_VERIFICATION.md)
curl -sS https://YOUR-PRODUCTION-HOST/api/health | jq .
```

**Expected Response**:
```json
{
  "status": "ok",
  "checks": {
    "firebase": true,
    "stripe": true,
    "environment": true
  }
}
```

**If health check fails**, see [PRODUCTION_VERIFICATION.md](./PRODUCTION_VERIFICATION.md) troubleshooting section.

---

## Step 2: Create Webhook Endpoint in Stripe Dashboard

### Test Mode Setup (for staging/preview deployments)

1. **Go to Stripe Dashboard**:
   - Navigate to [https://dashboard.stripe.com/test/webhooks](https://dashboard.stripe.com/test/webhooks)

2. **Click "Add endpoint"**:
   - Endpoint URL: `https://YOUR-PRODUCTION-HOST/api/stripe/webhook`
   - Description: `ShopMatch Pro - Subscription Events (Production)`

3. **Select Events to Listen For**:
   - Click "Select events"
   - Search and select these **4 critical events**:
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.created`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
   - Click "Add events"

4. **Set API Version** (optional but recommended):
   - Click "Advanced settings"
   - API version: `2024-11-20.acacia` (latest stable)

5. **Save Endpoint**:
   - Click "Add endpoint"
   - **Important**: Copy the **Signing secret** (starts with `whsec_...`)

### Live Mode Setup (for production)

**Follow same steps** but use:
- Live mode dashboard: [https://dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
- Production URL: `https://shopmatch.example.com/api/stripe/webhook`

**Security Note**: Live and test webhooks have **different signing secrets**. Update `STRIPE_WEBHOOK_SECRET` environment variable when switching modes.

---

## Step 3: Configure Webhook Signing Secret

### Update Production Environment Variables

**Vercel** (recommended):
```bash
# Via Vercel CLI
vercel env add STRIPE_WEBHOOK_SECRET

# Paste the signing secret (whsec_...) when prompted
# Select: Production
```

**Or via Vercel Dashboard**:
1. Go to Project → Settings → Environment Variables
2. Add new variable:
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...` (from Step 2)
   - Environment: Production
3. Click "Save"
4. **Redeploy** to apply changes

**Netlify**:
```bash
netlify env:set STRIPE_WEBHOOK_SECRET "whsec_..."
```

**Railway**:
```bash
railway variables --set STRIPE_WEBHOOK_SECRET="whsec_..."
```

**Docker/Self-Hosted**:
```bash
# Add to .env.production or container environment
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Verify Secret Configured

**After redeployment**:
```bash
curl -sS https://YOUR-PRODUCTION-HOST/api/health | jq .
```

**Expected** (environment check should still pass):
```json
{
  "checks": {
    "stripe": true  // Confirms STRIPE_WEBHOOK_SECRET is set
  }
}
```

---

## Step 4: Test Webhook Delivery

### Method 1: Stripe Dashboard Test Events

1. **Go to Webhook Endpoint**:
   - Stripe Dashboard → Developers → Webhooks → Your endpoint

2. **Click "Send test webhook"**:
   - Select event: `checkout.session.completed`
   - Click "Send test webhook"

3. **Verify Response**:
   - Response code: `200 OK`
   - Response body: `{"received":true}`
   - Response time: < 5 seconds

**If webhook fails**, see [Troubleshooting](#troubleshooting) section below.

### Method 2: Stripe CLI (Recommended for Thorough Testing)

**Install Stripe CLI**:
```bash
brew install stripe/stripe-cli/stripe  # macOS
# Or download: https://stripe.com/docs/stripe-cli
```

**Trigger Test Events**:
```bash
# Checkout completed (new subscription)
stripe trigger checkout.session.completed

# Subscription created
stripe trigger customer.subscription.created

# Subscription updated (renewal)
stripe trigger customer.subscription.updated

# Subscription deleted (cancellation)
stripe trigger customer.subscription.deleted
```

**Expected Output**:
```
Trigger succeeded! Check dashboard for event details.
```

**Verify in Logs**:
```bash
# View webhook deliveries
stripe logs tail --filter-event-type=checkout.session.completed
```

### Method 3: End-to-End Subscription Flow (Production Test)

**Full user flow** (from [PRODUCTION_VERIFICATION.md](./PRODUCTION_VERIFICATION.md)):

1. **Create User** (Firebase Auth):
   ```bash
   # Register new user
   curl -X POST https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=YOUR_API_KEY \
     -d '{"email":"test@example.com","password":"Test123!","returnSecureToken":true}' | jq .
   ```

2. **Create Checkout Session**:
   ```bash
   TOKEN="<firebase-id-token>"
   curl -X POST https://YOUR-PRODUCTION-HOST/api/stripe/checkout \
     -H "Authorization: Bearer $TOKEN" | jq .
   ```

   **Expected**:
   ```json
   {
     "sessionId": "cs_test_...",
     "url": "https://checkout.stripe.com/c/pay/cs_test_..."
   }
   ```

3. **Complete Checkout**:
   - Open the `url` in browser
   - Use test card: `4242 4242 4242 4242`, any future expiry, any CVC
   - Complete payment

4. **Verify Webhook Triggered**:
   - Go to Stripe Dashboard → Developers → Webhooks → Your endpoint
   - Should see `checkout.session.completed` event with 200 response

5. **Verify Custom Claims Updated**:
   ```bash
   # Get fresh ID token (includes custom claims)
   NEW_TOKEN=$(curl -X POST https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=YOUR_API_KEY \
     -d "{\"idToken\":\"$TOKEN\"}" | jq -r '.users[0].idToken')

   # Decode token to verify subActive claim
   echo $NEW_TOKEN | cut -d'.' -f2 | base64 --decode | jq .
   ```

   **Expected** (in decoded token):
   ```json
   {
     "sub": "firebase-uid",
     "email": "test@example.com",
     "subActive": true,  // ← Webhook set this
     "role": "owner"
   }
   ```

6. **Verify Firestore Updated**:
   - Go to Firebase Console → Firestore → `users` collection
   - Find user document by email
   - Should have `subscriptionStatus: "active"` and `stripeCustomerId` set

---

## Step 5: Monitor Webhook Health

### Stripe Dashboard Monitoring

**Check Webhook Success Rate**:
1. Go to Stripe Dashboard → Developers → Webhooks
2. Click on your endpoint
3. View "Recent events" section

**Healthy Metrics**:
- ✅ Success rate: > 99%
- ✅ Average response time: < 2 seconds
- ✅ No 5xx errors

**Alert Triggers**:
- ❌ Success rate < 95% → Check application logs
- ❌ Response time > 5 seconds → Check Firebase Admin SDK performance
- ❌ 401/403 errors → Webhook secret mismatch

### Application Monitoring (Recommended)

**Add Webhook Metrics** (future enhancement):

```typescript
// src/app/api/stripe/webhook/route.ts
import { logger } from '@/lib/observability'

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    // ... existing webhook logic ...

    logger.info('webhook_processed', {
      event_type: event.type,
      duration_ms: Date.now() - startTime,
      status: 'success'
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    logger.error('webhook_failed', {
      event_type: event?.type,
      duration_ms: Date.now() - startTime,
      error: error.message
    })

    throw error
  }
}
```

**Monitor in Production**:
- Track `webhook_processed` rate (should match Stripe event rate)
- Alert on `webhook_failed` errors
- Dashboard: `webhook_processed` duration percentiles (p50, p95, p99)

---

## Security Considerations

### 1. Webhook Signature Verification

**Critical**: Never skip signature verification in production.

**Implementation** (already in [src/app/api/stripe/webhook/route.ts](../src/app/api/stripe/webhook/route.ts)):
```typescript
const sig = request.headers.get('stripe-signature')
const rawBody = await request.text()

try {
  event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)
} catch (err) {
  console.error('⚠️ Webhook signature verification failed:', err.message)
  return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
}
```

**Why This Matters**:
- ❌ Without verification: Attackers can fake subscription events
- ❌ Risk: Unauthorized users gain premium access
- ✅ With verification: Only Stripe-signed events accepted

### 2. Endpoint Security

**Firewall Rules** (optional but recommended):
```nginx
# Allow only Stripe webhook IPs
# https://stripe.com/docs/ips
location /api/stripe/webhook {
  allow 3.18.12.63;
  allow 3.130.192.231;
  # ... (see Stripe IP list)
  deny all;
}
```

**Rate Limiting** (recommended):
```typescript
// Middleware to prevent webhook abuse
import rateLimit from '@/lib/rate-limit'

const webhookLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500 // max 500 unique IPs per minute
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown'

  try {
    await webhookLimiter.check(ip, 100) // max 100 requests per IP per minute
  } catch {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  // ... webhook logic ...
}
```

### 3. Secret Rotation

**Rotate Webhook Secret** (recommended every 90 days):

1. **Create New Secret**:
   - Stripe Dashboard → Webhooks → Your endpoint
   - Click "Roll secret"
   - Copy new secret (`whsec_new_...`)

2. **Update Environment Variable**:
   ```bash
   vercel env add STRIPE_WEBHOOK_SECRET
   # Paste new secret
   # Select: Production
   ```

3. **Redeploy**:
   ```bash
   vercel --prod
   ```

4. **Verify New Secret Works**:
   - Send test webhook from dashboard
   - Should see 200 response

5. **Old Secret Expires in 24 Hours**:
   - Stripe keeps both secrets active for 24 hours
   - Gives you time to update/redeploy

---

## Troubleshooting

### Issue: Webhook Returns 400 "Invalid signature"

**Symptom**: All webhook deliveries fail with 400 error

**Cause**: `STRIPE_WEBHOOK_SECRET` mismatch or raw body parsing issue

**Solution**:

1. **Verify Secret**:
   ```bash
   # Check environment variable
   vercel env pull .env.production
   grep STRIPE_WEBHOOK_SECRET .env.production
   ```

   - Should match secret in Stripe Dashboard → Webhooks → Your endpoint

2. **Verify Raw Body Parsing**:
   - Confirm route has `export const runtime = 'nodejs'` (NOT edge runtime)
   - Confirm no body parsing middleware interfering

3. **Check API Version**:
   - Stripe Dashboard → Webhooks → Advanced settings
   - Use latest stable version (2024-11-20.acacia or newer)

### Issue: Webhook Returns 500 "Firebase Admin SDK Error"

**Symptom**: Webhooks fail with 500, logs show Firebase errors

**Cause**: Firebase Admin SDK not initialized or missing credentials

**Solution**:

1. **Verify Firebase Environment Variables**:
   ```bash
   curl -sS https://YOUR-PRODUCTION-HOST/api/health | jq .checks.firebase
   ```

   - Should return `true`

2. **Check Service Account Credentials**:
   - Verify `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` set
   - Private key should include `-----BEGIN PRIVATE KEY-----` markers

3. **Test Firebase Admin Directly**:
   ```bash
   # Try to verify a token (tests Admin SDK)
   curl -X POST https://YOUR-PRODUCTION-HOST/api/stripe/portal \
     -H "Authorization: Bearer invalid-token"
   ```

   - Should return 401 (proves Admin SDK can verify tokens)

### Issue: Custom Claims Not Updating

**Symptom**: Webhook succeeds (200), but user still sees `subActive: false`

**Cause**: Token not refreshed on client side

**Solution**:

**Client must refresh token** after webhook processing:

```typescript
// src/lib/contexts/AuthContext.tsx
import { getAuth } from 'firebase/auth'

const refreshCustomClaims = async () => {
  const auth = getAuth()
  const user = auth.currentUser

  if (user) {
    // Force token refresh
    await user.getIdToken(true) // true = force refresh

    // Get updated token with new claims
    const tokenResult = await user.getIdTokenResult()
    console.log('Custom claims:', tokenResult.claims)
    // Should now show subActive: true
  }
}
```

**Trigger refresh**:
- Automatically after checkout redirect
- On page reload
- Via "Refresh" button in settings

### Issue: Webhook Times Out (>30s)

**Symptom**: Stripe dashboard shows "timeout" for webhook

**Cause**: Slow Firebase operations or external API calls in webhook handler

**Solution**:

1. **Profile Webhook Performance**:
   ```typescript
   // Add timing logs
   const start = Date.now()
   await adminAuth.setCustomUserClaims(uid, { subActive: true })
   console.log(`setCustomUserClaims took ${Date.now() - start}ms`)
   ```

2. **Optimize Firebase Operations**:
   - Use batched writes for Firestore
   - Avoid unnecessary reads
   - Cache frequently accessed data

3. **Move Slow Operations to Background**:
   - Use Firebase Cloud Functions for heavy processing
   - Webhook returns 200 immediately
   - Function processes in background

**Example** (defer email to Cloud Function):
```typescript
// Webhook handler (fast path)
export async function POST(request: Request) {
  // ... verify signature ...

  // Update custom claims (fast)
  await adminAuth.setCustomUserClaims(uid, { subActive: true })

  // Trigger background function (don't await)
  await firestore.collection('tasks').add({
    type: 'send_welcome_email',
    userId: uid,
    createdAt: FieldValue.serverTimestamp()
  })

  return NextResponse.json({ received: true }) // Return quickly
}
```

---

## Webhook Event Reference

### checkout.session.completed

**When Fired**: User completes Stripe Checkout payment

**Payload Fields**:
```json
{
  "id": "evt_...",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      "id": "cs_...",
      "client_reference_id": "<firebase-uid>",  // ← We set this
      "customer": "cus_...",
      "subscription": "sub_..."
    }
  }
}
```

**Handler Actions**:
1. Extract Firebase UID from `client_reference_id`
2. Store `stripeCustomerId` in Firestore user document
3. Set custom claim: `subActive: true`

### customer.subscription.created

**When Fired**: Subscription activated (after successful payment)

**Payload Fields**:
```json
{
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_...",
      "customer": "cus_...",
      "status": "active",
      "current_period_end": 1735689600
    }
  }
}
```

**Handler Actions**:
1. Look up user by `stripeCustomerId`
2. Update Firestore: `subscriptionStatus: "active"`, `currentPeriodEnd: <timestamp>`
3. Set custom claim: `subActive: true`

### customer.subscription.updated

**When Fired**: Subscription renewed, plan changed, or payment method updated

**Payload Fields**:
```json
{
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_...",
      "status": "active",  // or "past_due", "unpaid"
      "current_period_end": 1735689600
    }
  }
}
```

**Handler Actions**:
1. Update Firestore with new `subscriptionStatus` and `currentPeriodEnd`
2. Set custom claim based on status:
   - `active` → `subActive: true`
   - `past_due`/`unpaid` → `subActive: false`

### customer.subscription.deleted

**When Fired**: Subscription canceled or expired

**Payload Fields**:
```json
{
  "type": "customer.subscription.deleted",
  "data": {
    "object": {
      "id": "sub_...",
      "status": "canceled",
      "ended_at": 1735689600
    }
  }
}
```

**Handler Actions**:
1. Update Firestore: `subscriptionStatus: "canceled"`
2. Set custom claim: `subActive: false`
3. User loses access to premium features immediately

---

## Related Documentation

- [PRODUCTION_VERIFICATION.md](./PRODUCTION_VERIFICATION.md) - Full production deployment checklist
- [docs/runbooks/STRIPE_WEBHOOK_RUNBOOK.md](./runbooks/STRIPE_WEBHOOK_RUNBOOK.md) - Troubleshooting webhook failures
- [src/app/api/stripe/webhook/route.ts](../src/app/api/stripe/webhook/route.ts) - Webhook handler implementation
- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks) - Official Stripe docs

---

## Summary Checklist

**Pre-Production**:
- [ ] Application deployed and health check passing
- [ ] All environment variables configured (Firebase + Stripe)
- [ ] Webhook endpoint URL confirmed: `https://YOUR-HOST/api/stripe/webhook`

**Webhook Configuration**:
- [ ] Webhook endpoint created in Stripe Dashboard
- [ ] 4 events selected: checkout.session.completed, customer.subscription.{created,updated,deleted}
- [ ] Signing secret copied and set as `STRIPE_WEBHOOK_SECRET`
- [ ] Application redeployed with new secret

**Testing**:
- [ ] Test webhook sent from Stripe Dashboard (200 response)
- [ ] End-to-end subscription flow completed successfully
- [ ] Custom claims verified (`subActive: true` after subscription)
- [ ] Firestore user document updated with subscription data

**Monitoring**:
- [ ] Webhook success rate > 99% in Stripe Dashboard
- [ ] Application logs show successful webhook processing
- [ ] Alerts configured for webhook failures (optional)

**Security**:
- [ ] Signature verification enabled (never skip in production)
- [ ] Webhook secret rotation scheduled (every 90 days)
- [ ] Rate limiting configured (optional but recommended)

**Next Steps**:
- Monitor webhook deliveries for first 24 hours
- Set up alerts for webhook failures
- Document any production-specific edge cases
- Plan webhook secret rotation schedule
