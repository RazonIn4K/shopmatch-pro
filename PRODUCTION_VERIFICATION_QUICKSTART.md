# Production Verification Quick Start

**Time Required**: 25 minutes
**Last Updated**: 2025-10-18 14:50 CDT
**Status**: Ready to Begin

---

## 🎯 Your Production URL

Based on your Vercel project configuration:

**Production URL**: `https://shopmatch-pro.vercel.app`
**Vercel Project**: `https://vercel.com/razs-projects-29d4f2e6/shopmatch-pro`

> **Note**: If your custom domain is configured, use that instead.

---

## ✅ Pre-Verification Checklist

Before starting, confirm:

- [x] All 13 environment variables configured in Vercel
- [x] PR #33 merged (API specification alignment)
- [x] PR #34 merged (Production verification guides)
- [x] Feature branches cleaned up
- [x] Latest code on `main` branch

**Everything is ready!** Proceed to Phase 1 below.

---

## 📋 5-Phase Verification Workflow

### Phase 1: Production Health Check (2 minutes)

**Step 1.1: Test Health Endpoint**

```bash
# Set your production URL
export PROD_URL="https://shopmatch-pro.vercel.app"

# Run health check
curl -sS "$PROD_URL/api/health" | jq .
```

**Expected Response**:
```json
{
  "status": "ok",
  "checks": {
    "firebase": true,
    "stripe": true,
    "environment": true
  },
  "envDetails": {
    "totalRequired": 13,
    "totalPresent": 13,
    "missingCount": 0
  }
}
```

**Step 1.2: Verify Status**

- [ ] `status` is `"ok"`
- [ ] All three `checks` are `true`
- [ ] `missingCount` is `0`

**If any check fails**, see [Troubleshooting](#troubleshooting) below.

**Step 1.3: Test Homepage**

```bash
# Verify homepage loads
curl -sS -D - "$PROD_URL/" | head -n 20
```

Expected: `HTTP/2 200` status and HTML content.

---

### Phase 2: Configure Stripe Webhooks (5 minutes)

This replaces your local ngrok setup with a permanent production webhook.

**Step 2.1: Open Stripe Dashboard**

**Test Mode**:
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**

**Production webhook configuration**:
- **Endpoint URL**: `https://shopmatch-pro.vercel.app/api/stripe/webhook`
- **Events to send**:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

**Step 2.2: Get Webhook Signing Secret**

1. Click on your newly created webhook endpoint
2. Click **"Reveal"** under "Signing secret"
3. Copy the secret (starts with `whsec_...`)

**Step 2.3: Update Vercel Environment Variable**

Go to your Vercel dashboard:
1. Navigate to: https://vercel.com/razs-projects-29d4f2e6/shopmatch-pro/settings/environment-variables
2. Find `STRIPE_WEBHOOK_SECRET`
3. Click **"Edit"**
4. Paste your production webhook secret
5. Click **"Save"**

**Vercel will automatically redeploy** (takes ~2 minutes).

**Step 2.4: Test Webhook**

Back in Stripe Dashboard:
1. Click **"Send test webhook"** on your endpoint
2. Select `checkout.session.completed`
3. Click **"Send test webhook"**

Expected: `200 OK` response

**Verification**:
- [ ] Webhook endpoint created in Stripe
- [ ] Signing secret copied
- [ ] `STRIPE_WEBHOOK_SECRET` updated in Vercel
- [ ] Test webhook returns 200 OK

---

### Phase 3: Account Creation Test (5 minutes)

**Step 3.1: Create Seeker Account**

```bash
# Open signup page in browser
open "$PROD_URL/signup"
```

Or manually navigate to: `https://shopmatch-pro.vercel.app/signup`

1. **Sign up** with test email: `seeker-test@example.com`
2. **Select role**: Job Seeker
3. Complete signup

**Step 3.2: Verify Seeker Account**

**Firebase Console**: https://console.firebase.google.com/project/shopmatch-pro/authentication/users

Check:
- [ ] User exists in Firebase Auth
- [ ] User document created in Firestore `users` collection
- [ ] `role` field set to `"seeker"`

**Step 3.3: Create Owner Account**

1. Sign out from seeker account
2. **Sign up** with: `owner-test@example.com`
3. **Select role**: Job Owner
4. Complete signup

**Step 3.4: Verify Owner Account**

Check Firebase Console:
- [ ] Owner user exists in Firebase Auth
- [ ] Owner document in Firestore with `role: "owner"`

---

### Phase 4: Subscription Flow Test (10 minutes)

This is the **critical test** that replaces your ngrok workflow.

**Step 4.1: Initiate Subscription**

1. Log in as **owner** account (`owner-test@example.com`)
2. Navigate to: `https://shopmatch-pro.vercel.app/subscribe`
3. Click **"Subscribe to Pro Plan"** or equivalent button

**Step 4.2: Complete Stripe Checkout**

Stripe will redirect you to a checkout page.

Use **Stripe test card**:
- Card number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/34`)
- CVC: Any 3 digits (e.g., `123`)
- ZIP: Any 5 digits (e.g., `12345`)

Click **"Subscribe"** or **"Pay"**

**Step 4.3: Verify Redirect**

After payment:
- [ ] Redirected back to your app (dashboard or success page)
- [ ] No error messages shown

**Step 4.4: Check Webhook Processing**

**Stripe Dashboard**:
1. Go to: https://dashboard.stripe.com/test/events
2. Find recent `checkout.session.completed` event
3. Click on it
4. Verify **"Sent to webhook"** shows `200 OK`

**Vercel Logs**:
1. Go to: https://vercel.com/razs-projects-29d4f2e6/shopmatch-pro
2. Click **"Deployments"** → **"Production"** → **"Functions"**
3. Filter logs by `/api/stripe/webhook`
4. Verify successful processing (no errors)

**Step 4.5: Verify Custom Claims**

In browser console (while logged in as owner):

```javascript
// Get current user
const user = firebase.auth().currentUser

// Force token refresh to get latest claims
await user.getIdToken(true)

// Get token result
const tokenResult = await user.getIdTokenResult()

// Check claims
console.log('subActive:', tokenResult.claims.subActive)  // Should be true
console.log('role:', tokenResult.claims.role)            // Should be "owner"
```

**Verification**:
- [ ] Checkout completed successfully
- [ ] Webhook event shows 200 OK in Stripe Dashboard
- [ ] Vercel logs show successful webhook processing
- [ ] `subActive` custom claim is `true`
- [ ] UI shows pro features unlocked

---

### Phase 5: End-to-End Workflow Test (5 minutes)

**Step 5.1: Create Job Posting** (as owner with active subscription)

1. Navigate to: `https://shopmatch-pro.vercel.app/jobs/new`
2. Fill in job details:
   - **Title**: "Senior Full Stack Developer"
   - **Company**: "Test Company Inc"
   - **Location**: "Remote"
   - **Type**: "full-time"
   - **Description**: "Production verification test job"
3. Set **Status**: "published"
4. Click **"Create Job"** or **"Post Job"**

**Verification**:
- [ ] Job created successfully
- [ ] Redirected to job list or job detail page
- [ ] Job appears in owner dashboard

**Step 5.2: Apply for Job** (as seeker)

1. Log out and log in as **seeker** (`seeker-test@example.com`)
2. Navigate to job listing or search for "Senior Full Stack Developer"
3. Click on the job to view details
4. Click **"Apply"** or **"Submit Application"**
5. Fill in cover letter: "This is a production verification test application"
6. Submit application

**Verification**:
- [ ] Application submitted successfully
- [ ] Application appears in seeker dashboard
- [ ] Application status shows "pending"

**Step 5.3: Review Application** (as owner)

1. Log out and log in as **owner** (`owner-test@example.com`)
2. Navigate to applications dashboard
3. Find the test application
4. Click to view details
5. Update status to **"reviewed"** or **"accepted"**

**Verification**:
- [ ] Application visible in owner dashboard
- [ ] Can view applicant details
- [ ] Status update successful

**Step 5.4: Verify Status Change** (as seeker)

1. Log out and log in as **seeker**
2. Check application status in dashboard
3. Verify status changed to "reviewed" or "accepted"

**Verification**:
- [ ] Status change reflected in seeker dashboard
- [ ] Real-time updates working (if applicable)

---

## 🎉 Verification Complete!

If all phases passed, your production deployment is **fully operational**!

### Summary Checklist

**Phase 1: Health Check**
- [x] All health checks passing
- [x] Homepage loads successfully

**Phase 2: Stripe Webhooks**
- [x] Production webhook configured
- [x] Webhook secret updated in Vercel
- [x] Test webhook returns 200 OK

**Phase 3: Account Creation**
- [x] Seeker account created
- [x] Owner account created
- [x] Both visible in Firebase Console

**Phase 4: Subscription Flow**
- [x] Checkout completed successfully
- [x] Webhook processed (200 OK)
- [x] `subActive` custom claim set to `true`

**Phase 5: E2E Workflow**
- [x] Job created by owner
- [x] Application submitted by seeker
- [x] Application reviewed by owner
- [x] Status updates reflected

---

## 🔧 Troubleshooting

### Health Check Failures

**Issue**: `firebase: false`

**Diagnosis**:
```bash
curl -sS "$PROD_URL/api/health" | jq .envDetails.missingVars
```

**Fix**:
1. Check `FIREBASE_PRIVATE_KEY` formatting in Vercel
2. Ensure it has `\n` escape characters (not literal newlines)
3. Example format: `"-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`

**Issue**: `stripe: false`

**Fix**:
1. Verify `STRIPE_SECRET_KEY` starts with `sk_test_` (test mode) or `sk_live_` (live mode)
2. Check you're in correct mode in Stripe Dashboard
3. If invalid, regenerate: Stripe Dashboard → Developers → API keys

**Issue**: `environment: false`

**Fix**:
```bash
# Check which variables are missing
curl -sS "$PROD_URL/api/health" | jq .envDetails.missingVars
```

Go to Vercel Dashboard → Settings → Environment Variables and add missing variables.

---

### Webhook Failures

**Issue**: Webhook returns 400 "Invalid signature"

**Diagnosis**:
- Webhook secret in Vercel doesn't match Stripe Dashboard

**Fix**:
1. Go to Stripe Dashboard → Webhooks → Your endpoint
2. Click "Reveal" under Signing secret
3. Copy the secret
4. Update `STRIPE_WEBHOOK_SECRET` in Vercel
5. Wait for automatic redeploy

**Issue**: Webhook returns 500 error

**Diagnosis**:
```bash
# Check Vercel function logs
# Go to: https://vercel.com/razs-projects-29d4f2e6/shopmatch-pro
# Deployments → Production → Functions → Filter by "webhook"
```

Common causes:
- Firebase Admin SDK initialization failure
- Invalid Firestore query
- Missing user document

**Fix**: Check logs for specific error message and fix accordingly.

---

### Subscription Not Activating

**Issue**: `subActive` claim is still `false` after payment

**Diagnosis**:
1. Check Stripe Dashboard → Events for `checkout.session.completed`
2. Verify webhook delivery shows 200 OK
3. Check Vercel logs for errors

**Fix**:
```javascript
// Force token refresh in browser console
const user = firebase.auth().currentUser
await user.getIdToken(true)  // true = force refresh

// Check claims again
const tokenResult = await user.getIdTokenResult()
console.log(tokenResult.claims)
```

If still `false`:
1. Check Firestore user document has `stripeCustomerId` and `subscriptionStatus`
2. Check Firebase Auth custom claims were set (check Vercel webhook logs)

---

### Job Creation Fails

**Issue**: 403 "Active subscription required"

**Diagnosis**:
- `subActive` custom claim not set to `true`

**Fix**:
1. Complete Phase 4 (Subscription Flow) first
2. Force token refresh (see above)
3. Retry job creation

---

## 📚 Additional Resources

**Detailed Guides**:
- [docs/PRODUCTION_VERIFICATION.md](./docs/PRODUCTION_VERIFICATION.md) - Comprehensive 4-phase guide
- [docs/STRIPE_WEBHOOK_PRODUCTION_SETUP.md](./docs/STRIPE_WEBHOOK_PRODUCTION_SETUP.md) - Complete webhook setup
- [docs/SDK_GENERATION.md](./docs/SDK_GENERATION.md) - Regenerate API clients

**API Reference**:
- [docs/API_REFERENCE.yml](./docs/API_REFERENCE.yml) - OpenAPI 3.0 specification

**Troubleshooting**:
- [docs/runbooks/STRIPE_WEBHOOK_RUNBOOK.md](./docs/runbooks/STRIPE_WEBHOOK_RUNBOOK.md) - Webhook troubleshooting
- [docs/INCIDENT_RESPONSE.md](./docs/INCIDENT_RESPONSE.md) - Incident response guide

---

## 🚀 Next Steps After Verification

Once all phases pass:

1. **Update STRIPE_PRICE_ID_PRO** (if using outdated price):
   - Get current price ID from Stripe Dashboard → Products
   - Update in Vercel environment variables

2. **Switch to Live Mode** (when ready for real payments):
   - Update all `sk_test_*` keys to `sk_live_*`
   - Configure live mode webhook with new signing secret
   - Update Firebase credentials if using separate prod project

3. **Set Up Monitoring**:
   - Configure error tracking (Sentry, LogRocket, etc.)
   - Set up uptime monitoring for `/api/health`
   - Configure alerts for webhook failures

4. **Optional: Regenerate API Clients**:
   ```bash
   # Follow docs/SDK_GENERATION.md
   npx openapi-typescript docs/API_REFERENCE.yml -o src/types/api.ts
   ```

---

**Congratulations!** Your ShopMatch Pro application is now running in production! 🎉
