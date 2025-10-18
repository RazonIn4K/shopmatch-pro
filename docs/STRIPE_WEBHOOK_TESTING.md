# Stripe Webhook Testing Guide

Complete guide for testing, monitoring, and troubleshooting Stripe webhook integration in ShopMatch Pro.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Local Development Testing](#local-development-testing)
4. [Production Testing](#production-testing)
5. [Monitoring Webhook Events](#monitoring-webhook-events)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Prerequisites

### Required Tools

**Stripe CLI** (for triggering test events and monitoring):
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget https://github.com/stripe/stripe-cli/releases/download/vX.X.X/stripe_X.X.X_linux_x86_64.tar.gz
tar -xvf stripe_X.X.X_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/

# Windows
scoop install stripe
```

**Firebase CLI** (for verifying custom claims):
```bash
npm install -g firebase-tools
```

**jq** (for JSON parsing in scripts):
```bash
# macOS
brew install jq

# Linux
sudo apt-get install jq
```

### Authentication

**Login to Stripe CLI**:
```bash
stripe login
```

This opens a browser window to authenticate with your Stripe account.

**Login to Firebase CLI**:
```bash
firebase login
```

---

## Quick Start

### One-Command Test

The fastest way to verify webhook functionality:

```bash
./scripts/diagnose-webhook.sh --test
```

**What this does:**
1. ✅ Checks webhook endpoint responds
2. ✅ Verifies production health (Firebase, Stripe, environment)
3. ✅ Triggers test `checkout.session.completed` event
4. ✅ Shows instructions to verify custom claims

**Expected output:**
```
==================================================
ShopMatch Pro Webhook Diagnostic
==================================================

Step 1: Testing webhook endpoint accessibility...
✅ Webhook endpoint is responding correctly
   Response: Missing signature

Step 2: Checking production health...
✅ All production checks passing
   Firebase: true
   Stripe: true
   Environment: true

Step 3: Checking Stripe CLI availability...
✅ Stripe CLI installed
   Version: stripe version 1.21.8
✅ Stripe CLI authenticated

Step 4: Triggering test webhook event...
   Sending checkout.session.completed event...
   Target: https://shopmatch-pro.vercel.app/api/stripe/webhook

✅ Test event triggered successfully
   event id: evt_1AbCdEfGhIjKlMnO

   Check Stripe Dashboard → Events for delivery status
   URL: https://dashboard.stripe.com/test/events

Step 5: Verifying Firebase custom claims...
   This step requires Firebase CLI authentication
   Run manually: firebase login

   To verify custom claims for a user:
   1. Get user UID from Firebase Console
   2. Run: firebase auth:export users.json --project shopmatch-c7df0
   3. Check customClaims field in users.json

   Expected: {"role": "owner", "subActive": true}

✅ Test complete - check Stripe Dashboard for event delivery
```

---

## Local Development Testing

### Step 1: Start Local Server

```bash
# Terminal 1: Start development server
npm run dev
```

Verify server is running on http://localhost:3000

### Step 2: Expose Local Server with ngrok

**Install ngrok** (if not already installed):
```bash
# macOS
brew install ngrok

# Linux/Windows
# Download from https://ngrok.com/download
```

**Start ngrok tunnel:**
```bash
# Terminal 2: Expose local server
ngrok http 3000
```

**Copy the HTTPS URL:**
```
Forwarding  https://abcd1234.ngrok-free.app -> http://localhost:3000
```

### Step 3: Configure Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **"Add endpoint"**
3. **Endpoint URL**: `https://abcd1234.ngrok-free.app/api/stripe/webhook`
4. **Events to send**: Select these 4 events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**
6. **Copy the Signing Secret** (starts with `whsec_...`)

### Step 4: Update Local Environment

Create `.env.local` with the ngrok signing secret:

```bash
# Copy template
cp .env.local.template .env.local

# Update STRIPE_WEBHOOK_SECRET with ngrok endpoint secret
STRIPE_WEBHOOK_SECRET=whsec_...  # From Step 3
```

**Restart dev server:**
```bash
# Ctrl+C in Terminal 1, then:
npm run dev
```

### Step 5: Trigger Test Event

**Option A: Stripe Dashboard**
1. Go to webhook endpoint page
2. Click **"Send test webhook"**
3. Select `checkout.session.completed`
4. Click **"Send test webhook"**
5. Verify response: **200 OK**

**Option B: Stripe CLI**
```bash
stripe trigger checkout.session.completed
```

### Step 6: Verify in Application

1. **Check server logs** (Terminal 1):
   ```
   POST /api/stripe/webhook 200 in 245ms
   ```

2. **Check Firestore** (Firebase Console):
   - Navigate to `users` collection
   - Find test user document
   - Verify `subActive: true`

3. **Check custom claims** (browser console):
   ```javascript
   const user = firebase.auth().currentUser
   const token = await user.getIdTokenResult()
   console.log('subActive:', token.claims.subActive)  // Should be true
   ```

---

## Production Testing

### Step 1: Verify Webhook Configuration

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Find webhook with URL: `https://shopmatch-pro.vercel.app/api/stripe/webhook`
3. Verify:
   - ✅ Status: **Enabled** (not Disabled)
   - ✅ Events: **4 events** selected
   - ✅ Signing secret configured in Vercel

### Step 2: Trigger Test Event

**Using diagnostic script** (recommended):
```bash
./scripts/diagnose-webhook.sh --test
```

**Using Stripe CLI directly**:
```bash
stripe trigger checkout.session.completed \
  --stripe-version 2025-09-30.clover
```

### Step 3: Verify Event Delivery

**Stripe Dashboard**:
1. Go to [Events](https://dashboard.stripe.com/test/events)
2. Find the triggered event (most recent `checkout.session.completed`)
3. Click on the event
4. Scroll to **"Sent to webhook"** section
5. Verify:
   - ✅ Response status: **200**
   - ✅ Response time: < 3000ms
   - ✅ No errors

**Vercel Logs**:
1. Go to [Vercel Dashboard](https://vercel.com)
2. Navigate to **shopmatch-pro** project
3. Click **"Deployments"** → **"Production"** (latest)
4. Click **"Functions"** tab
5. Filter: `webhook`
6. Look for `/api/stripe/webhook` logs
7. Verify: No errors, 200 OK responses

### Step 4: Verify Firebase Custom Claims

**Using Firebase Console**:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select **shopmatch-c7df0** project
3. Navigate to **Authentication** → **Users**
4. Click on test user
5. Check **Custom claims** field
6. Expected: `{"role": "owner", "subActive": true}`

**Using Firebase CLI**:
```bash
# Export users
firebase auth:export users.json --project shopmatch-c7df0

# Check custom claims (replace USER_ID with actual UID)
jq '.users[] | select(.localId=="USER_ID") | .customClaims' users.json

# Expected output:
# {"role": "owner", "subActive": true}
```

### Step 5: End-to-End Flow Test

**Complete real checkout**:

1. **Sign up** with test account:
   ```
   Email: test@example.com
   Password: Test1234!
   ```

2. **Navigate to subscribe page**:
   ```
   https://shopmatch-pro.vercel.app/subscribe
   ```

3. **Complete checkout** with test card:
   ```
   Card number: 4242 4242 4242 4242
   Expiry: Any future date (e.g., 12/34)
   CVC: Any 3 digits (e.g., 123)
   ZIP: Any 5 digits (e.g., 12345)
   ```

4. **Verify subscription activated**:
   - After checkout, redirected to success page
   - Can navigate to `/jobs/new` and create job (no 403 error)
   - Custom claims show `subActive: true`

5. **Check webhook processed**:
   - Stripe Dashboard → Events shows `checkout.session.completed` with 200 OK
   - Vercel logs show successful webhook processing
   - Firestore `users` document updated

---

## Monitoring Webhook Events

### Real-Time Monitoring

**Start webhook event monitor**:
```bash
./scripts/monitor-webhook-events.sh --watch
```

**Output**:
```
╔════════════════════════════════════════════════════════════════════════╗
║           Stripe Webhook Event Monitor - ShopMatch Pro               ║
╠════════════════════════════════════════════════════════════════════════╣
║ Endpoint: https://shopmatch-pro.vercel.app/api/stripe/webhook         ║
╚════════════════════════════════════════════════════════════════════════╝

Recent Webhook Events:

Time       Event Type                     Status     Response
────────────────────────────────────────────────────────────────────────
14:23:45   session.completed              ✅         200 OK
14:23:46   sub.created                    ✅         200 OK
14:24:30   sub.updated                    ✅         200 OK

Total events shown: 3

Refreshing in 5 seconds... (Press Ctrl+C to stop)
```

### One-Time Event Check

**Show last 50 events**:
```bash
./scripts/monitor-webhook-events.sh
```

**Show last 10 events only**:
```bash
./scripts/monitor-webhook-events.sh --tail
```

### Stripe CLI Event Streaming

**Forward events to production webhook**:
```bash
./scripts/diagnose-webhook.sh --monitor
```

**Forward events to local webhook**:
```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

**Output**:
```
Ready! You are using Stripe API Version [2025-09-30]. Your webhook signing secret is whsec_... (^C to quit)
2025-01-18 14:23:45   --> checkout.session.completed [evt_1AbCdEfGhIjKlMnO]
2025-01-18 14:23:46   <-- [200] POST http://localhost:3000/api/stripe/webhook [evt_1AbCdEfGhIjKlMnO]
```

---

## Troubleshooting

### Common Issues

#### 1. Webhook Returns 400 Bad Request

**Symptom:**
```
Stripe Dashboard → Webhook → Response: 400 Bad Request
Error: No signatures found matching the expected signature for payload
```

**Cause:** Webhook signing secret mismatch

**Fix:**
1. Go to Stripe Dashboard → Webhooks → Your webhook
2. Click **"Reveal"** on Signing secret
3. Copy the exact secret (starts with `whsec_...`)
4. Go to Vercel → Settings → Environment Variables
5. Find `STRIPE_WEBHOOK_SECRET`
6. Click **"Edit"** → Paste exact secret (no spaces)
7. Ensure **"Production"** checkbox is checked
8. Wait 2 minutes for redeployment
9. Test again with `./scripts/diagnose-webhook.sh --test`

#### 2. Webhook Returns 500 Internal Server Error

**Symptom:**
```
Stripe Dashboard → Webhook → Response: 500 Internal Server Error
```

**Causes:**
- Firebase Admin SDK initialization failure
- Firestore query error
- Missing environment variables

**Fix:**

1. **Check Vercel logs**:
   ```
   Vercel → Deployments → Production → Functions → webhook
   ```

2. **Verify environment variables**:
   ```bash
   # All must be set in Vercel Production environment:
   FIREBASE_PROJECT_ID
   FIREBASE_CLIENT_EMAIL
   FIREBASE_PRIVATE_KEY
   STRIPE_SECRET_KEY
   STRIPE_WEBHOOK_SECRET
   ```

3. **Test health endpoint**:
   ```bash
   curl https://shopmatch-pro.vercel.app/api/health
   ```

   Expected:
   ```json
   {
     "status": "healthy",
     "checks": {
       "firebase": true,
       "stripe": true,
       "environment": true
     }
   }
   ```

4. **Check Firebase service account**:
   - Verify `FIREBASE_PRIVATE_KEY` has `BEGIN PRIVATE KEY` and `END PRIVATE KEY` markers
   - Ensure key is properly escaped (newlines as `\n`)

#### 3. Custom Claims Not Updating

**Symptom:**
```javascript
const token = await user.getIdTokenResult()
console.log(token.claims.subActive)  // undefined or false
```

**Cause:** Browser has cached old token without custom claims

**Fix:**

1. **Force token refresh** (browser console):
   ```javascript
   const user = firebase.auth().currentUser
   await user.getIdToken(true)  // Force refresh
   const token = await user.getIdTokenResult()
   console.log('subActive:', token.claims.subActive)  // Should be true
   ```

2. **Or logout and login again**:
   ```javascript
   await firebase.auth().signOut()
   // Login again
   ```

3. **Verify webhook processed successfully**:
   - Check Stripe Dashboard → Events → `checkout.session.completed` → 200 OK
   - Check Vercel logs for webhook processing
   - Verify Firestore `users` document has `subActive: true`

#### 4. Webhook Timeout (No Response)

**Symptom:**
```
Stripe Dashboard → Webhook → Response: Timeout
```

**Causes:**
- Function timeout (default 10s on Vercel Hobby)
- Firestore query too slow
- Firebase Admin SDK initialization delay

**Fix:**

1. **Check function execution time** (Vercel logs):
   - If > 8s, optimize Firestore queries
   - Use indexed queries (check `docs/FIRESTORE_RULES_SPEC.md`)

2. **Increase Vercel timeout** (if on Pro plan):
   ```json
   // vercel.json
   {
     "functions": {
       "api/stripe/webhook.ts": {
         "maxDuration": 30
       }
     }
   }
   ```

3. **Optimize webhook handler**:
   - Cache Firebase Admin SDK instance (already implemented)
   - Use batch writes instead of multiple updates
   - Move heavy processing to background jobs

#### 5. Multiple Webhooks Receiving Events

**Symptom:**
```
Events delivered to 2+ endpoints (ngrok + production)
```

**Cause:** Leftover development webhooks

**Fix:**
1. Go to Stripe Dashboard → Webhooks
2. Delete any webhooks with:
   - ngrok URLs (e.g., `https://abcd1234.ngrok-free.app/...`)
   - localhost URLs
   - Old staging URLs
3. Keep only production URL: `https://shopmatch-pro.vercel.app/api/stripe/webhook`

#### 6. Event Delivered but Custom Claims Still False

**Symptom:**
```
Stripe: 200 OK
Firestore: subActive = true
Custom claims: subActive = false (or undefined)
```

**Cause:** Custom claims update failed silently

**Fix:**

1. **Check Vercel logs for custom claims error**:
   ```
   Search for: "setCustomUserClaims"
   ```

2. **Verify Firebase Admin SDK permissions**:
   - Service account must have `Firebase Authentication Admin` role
   - Check Firebase Console → IAM & Admin

3. **Manually set custom claims** (temporary fix):
   ```bash
   firebase auth:custom-claims <USER_ID> '{"role":"owner","subActive":true}' \
     --project shopmatch-c7df0
   ```

4. **Verify with**:
   ```bash
   firebase auth:export users.json --project shopmatch-c7df0
   jq '.users[] | select(.localId=="<USER_ID>") | .customClaims' users.json
   ```

---

## Best Practices

### 1. Monitor Webhook Health

**Set up Stripe webhook monitoring**:
- Stripe Dashboard → Webhooks → Your webhook → "Configure monitoring"
- Enable email alerts for:
  - Error rate > 5%
  - Response time > 3s
  - Consecutive failures > 5

**Weekly checks**:
```bash
# Check recent events
./scripts/monitor-webhook-events.sh --tail

# Expected: All 200 OK, response times < 1s
```

### 2. Test Before Deploy

**Pre-deployment checklist**:
- [ ] Run `./scripts/diagnose-webhook.sh` (all checks pass)
- [ ] Trigger test event with `./scripts/diagnose-webhook.sh --test`
- [ ] Verify 200 OK response in Stripe Dashboard
- [ ] Check Vercel deployment logs (no errors)
- [ ] Test complete checkout flow end-to-end
- [ ] Verify custom claims update correctly

### 3. Rotate Signing Secrets Periodically

**Every 90 days**:
1. Create new webhook endpoint in Stripe Dashboard
2. Update `STRIPE_WEBHOOK_SECRET` in Vercel
3. Test new endpoint with `./scripts/diagnose-webhook.sh --test`
4. Delete old webhook endpoint
5. Document change in incident log

### 4. Implement Webhook Event Logging

**For production debugging**:
- Log all webhook events to structured logging service (e.g., Logtail, Datadog)
- Include: event type, timestamp, response time, custom claims update status
- Retain logs for 30 days

**Example enhancement** ([src/app/api/stripe/webhook/route.ts:88-120](src/app/api/stripe/webhook/route.ts#L88-L120)):
```typescript
// Log webhook event (already implemented)
console.log('[Webhook] Processing event:', {
  eventId: event.id,
  eventType: event.type,
  timestamp: new Date().toISOString(),
})

// After processing, log outcome
console.log('[Webhook] Custom claims updated:', {
  userId,
  subActive: true,
  timestamp: new Date().toISOString(),
})
```

### 5. Handle Webhook Idempotency

**Stripe may send duplicate events**:
- Use `event.id` to deduplicate
- Store processed event IDs in Firestore (optional)
- Current implementation is idempotent (safe to replay)

**Example idempotency check**:
```typescript
// Check if event already processed
const processedEvent = await db
  .collection('processedWebhookEvents')
  .doc(event.id)
  .get()

if (processedEvent.exists) {
  console.log('[Webhook] Event already processed:', event.id)
  return NextResponse.json({ received: true, duplicate: true })
}

// Process event...

// Mark as processed
await db.collection('processedWebhookEvents').doc(event.id).set({
  processedAt: FieldValue.serverTimestamp(),
})
```

### 6. Use Webhook Event Versioning

**Stripe API version compatibility**:
- Webhook events use API version from webhook creation time
- Upgrade API version carefully (test on separate webhook first)
- Document current version: `2025-09-30.clover`

**To upgrade**:
1. Create new webhook endpoint with new API version
2. Test thoroughly with staging environment
3. Switch production to new endpoint
4. Delete old endpoint

---

## Quick Reference

### Diagnostic Commands

```bash
# Basic health checks
./scripts/diagnose-webhook.sh

# Trigger test event
./scripts/diagnose-webhook.sh --test

# Monitor live events
./scripts/diagnose-webhook.sh --monitor

# Verify custom claims
./scripts/diagnose-webhook.sh --verify

# Show recent events
./scripts/monitor-webhook-events.sh

# Watch events in real-time
./scripts/monitor-webhook-events.sh --watch

# Show last 10 events
./scripts/monitor-webhook-events.sh --tail
```

### Stripe CLI Commands

```bash
# Trigger specific event
stripe trigger checkout.session.completed

# Listen to events
stripe listen --forward-to <WEBHOOK_URL>

# List recent events
stripe events list --limit 10

# Get event details
stripe events retrieve evt_1AbCdEfGhIjKlMnO

# List webhook endpoints
stripe webhook_endpoints list
```

### Firebase CLI Commands

```bash
# Export users
firebase auth:export users.json --project shopmatch-c7df0

# Set custom claims
firebase auth:custom-claims <USER_ID> '{"role":"owner","subActive":true}' \
  --project shopmatch-c7df0

# Verify custom claims
jq '.users[] | select(.localId=="<USER_ID>") | .customClaims' users.json
```

### Key URLs

- **Stripe Dashboard**: https://dashboard.stripe.com/test/webhooks
- **Stripe Events**: https://dashboard.stripe.com/test/events
- **Vercel Dashboard**: https://vercel.com/razs-projects-29d4f2e6/shopmatch-pro
- **Firebase Console**: https://console.firebase.google.com/project/shopmatch-c7df0
- **Production Webhook**: https://shopmatch-pro.vercel.app/api/stripe/webhook
- **Health Endpoint**: https://shopmatch-pro.vercel.app/api/health

---

## Related Documentation

- [STRIPE_WEBHOOK_RUNBOOK.md](./runbooks/STRIPE_WEBHOOK_RUNBOOK.md) - Incident response procedures
- [SECURITY.md](./SECURITY.md) - Security controls and threat model
- [API_REFERENCE.yml](./API_REFERENCE.yml) - API specifications including webhook endpoint
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment checklist
- [OBSERVABILITY.md](./OBSERVABILITY.md) - Monitoring and alerting setup

---

**Last Updated**: 2025-01-18
**Maintainer**: ShopMatch Pro Development Team
**Status**: Production Ready
