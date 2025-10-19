# 🚀 Webhook Activation - Execute Now

**Current Status:** Webhook configured but never received events (0 deliveries)  
**Root Cause:** No test events triggered yet  
**Solution:** Follow these 3 steps to activate webhooks

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Install Stripe CLI

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Verify installation
stripe --version
```

**Expected output:** `stripe version X.X.X`

---

### Step 2: Authenticate with Stripe

```bash
# Login to your Stripe account
stripe login

# This will:
# 1. Open browser to authorize
# 2. Show success message in terminal
# 3. Save credentials locally
```

**Expected output:**
```
Your pairing code is: word-word-word
Press Enter to open the browser (^C to quit)
> Done! The Stripe CLI is configured for [YOUR_ACCOUNT]
```

---

### Step 3: Trigger Test Webhook Event

```bash
# Option A: Use NPM script (recommended)
npm run webhook:test

# Option B: Direct Stripe CLI command
stripe trigger checkout.session.completed
```

**Expected output:**
```
Setting up fixture for: checkout.session.completed
Running fixture for: checkout.session.completed
Trigger succeeded! Check dashboard for event details.
```

---

## ✅ Verify Success

### Check 1: Stripe Dashboard (Browser)

1. Go to: https://dashboard.stripe.com/test/events
2. Look for latest `checkout.session.completed` event
3. Click on it
4. Scroll to "Sent to webhook" section
5. **Verify:** Shows `200 OK` response with your webhook URL

**If you see 200 OK → SUCCESS!** ✅

---

### Check 2: Vercel Function Logs

1. Go to: https://vercel.com/your-account/shopmatch-pro
2. Click "Functions" tab
3. Find `/api/stripe/webhook`
4. Check recent invocations
5. **Verify:** Shows successful execution with 200 status

---

### Check 3: Monitor Events in Real-Time

```bash
# Open a new terminal and run:
npm run webhook:events:watch

# This will show a live table of webhook events
# Leave it running while you trigger events
```

---

## 🧪 Test Real Checkout Flow

Once the test event succeeds, test the complete subscription flow:

### Step 1: Create Test Account

```bash
# Go to your production app
open https://shopmatch-pro.vercel.app/signup

# Sign up with test email:
# Email: test-owner@example.com
# Password: Test123!
```

---

### Step 2: Subscribe

```bash
# Navigate to subscribe page
open https://shopmatch-pro.vercel.app/subscribe

# Click "Subscribe to Pro"
# Use Stripe test card: 4242 4242 4242 4242
# Any future expiry date
# Any 3-digit CVC
```

---

### Step 3: Verify Subscription Activated

After checkout redirects back to your app:

1. **Check webhook was triggered:**
   ```bash
   # Check Stripe Dashboard events
   # Should see checkout.session.completed
   # Should see customer.subscription.created
   ```

2. **Verify Firebase custom claims:**
   ```javascript
   // In browser console (after login):
   const user = firebase.auth().currentUser;
   const token = await user.getIdTokenResult(true); // Force refresh
   console.log(token.claims.subActive); // Should be true
   ```

3. **Test job creation:**
   ```bash
   # Try to create a job
   open https://shopmatch-pro.vercel.app/jobs/new
   
   # If you can access this page and create a job:
   # ✅ Subscription is working!
   ```

---

## 🔍 Troubleshooting

### Issue: Stripe CLI not found after installation

```bash
# Check if installed
brew list stripe

# If not found, reinstall
brew install stripe/stripe-cli/stripe

# Add to PATH if needed
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

---

### Issue: Test event returns 400 Bad Request

**Cause:** Webhook signing secret mismatch

**Fix:**
1. Check Stripe Dashboard → Webhooks → Your endpoint
2. Click "Reveal" on signing secret
3. Copy the `whsec_...` value
4. Update in Vercel:
   ```bash
   # Go to Vercel Dashboard
   # Project → Settings → Environment Variables
   # Update STRIPE_WEBHOOK_SECRET
   # Redeploy
   ```

---

### Issue: Test event returns 500 Internal Error

**Cause:** Firebase or Stripe configuration error

**Fix:**
1. Check Vercel function logs for error details
2. Verify all environment variables are set:
   ```bash
   # Check production health endpoint
   curl https://shopmatch-pro.vercel.app/api/health | jq .
   
   # Should return:
   # "status": "ok"
   # "missingCount": 0
   ```

---

### Issue: Custom claims not updating

**Cause:** Browser has cached token without new claims

**Fix:**
```javascript
// Force token refresh in browser console
const user = firebase.auth().currentUser;
await user.getIdToken(true); // true = force refresh

// Verify new claims
const tokenResult = await user.getIdTokenResult();
console.log(tokenResult.claims.subActive); // Should now be true
```

---

## 📊 Success Metrics

After completing these steps, you should see:

| Metric | Expected Value |
|--------|----------------|
| **Webhook deliveries** | > 0 (in Stripe Dashboard) |
| **Webhook success rate** | 100% (all 200 OK responses) |
| **Response time** | < 500ms |
| **Custom claims** | `subActive: true` |
| **Job creation** | Accessible for subscribed users |

---

## 📚 Additional Resources

- **Complete Testing Guide:** [docs/STRIPE_WEBHOOK_TESTING.md](./STRIPE_WEBHOOK_TESTING.md)
- **Webhook Runbook:** [docs/runbooks/STRIPE_WEBHOOK_RUNBOOK.md](./runbooks/STRIPE_WEBHOOK_RUNBOOK.md)
- **Production Verification:** [docs/PRODUCTION_VERIFICATION.md](./PRODUCTION_VERIFICATION.md)
- **API Reference:** [docs/API_REFERENCE.yml](./API_REFERENCE.yml)

---

## ⏱️ Timeline

- **Step 1** (Stripe CLI install): 2 minutes
- **Step 2** (Authentication): 1 minute
- **Step 3** (Test event): 30 seconds
- **Verification**: 2 minutes
- **Real checkout test**: 5 minutes

**Total time to working webhooks:** ~10 minutes

---

## 🎯 What Happens Next

Once you complete these steps:

1. ✅ **Webhooks will start receiving events**
   - Stripe Dashboard will show delivery history
   - Event count will increment from 0

2. ✅ **Subscriptions will activate automatically**
   - `subActive` custom claim set to `true`
   - Users can immediately create jobs
   - No manual activation needed

3. ✅ **You can monitor webhook health**
   - Use `npm run webhook:events:watch`
   - Check Stripe Dashboard regularly
   - Set up alerts for failures

---

## 🚀 Ready to Start?

**Run this command now:**

```bash
brew install stripe/stripe-cli/stripe && stripe login
```

Then proceed with Step 3 (trigger test event).

**Questions?** Check [docs/STRIPE_WEBHOOK_TESTING.md](./STRIPE_WEBHOOK_TESTING.md) for comprehensive troubleshooting.

---

**Last Updated:** 2025-10-18  
**Status:** Ready for execution
