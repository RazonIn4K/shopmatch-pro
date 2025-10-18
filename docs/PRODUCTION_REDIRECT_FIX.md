# 🔧 Production Redirect Issue - Diagnosis & Fix

**Issue:** After Stripe checkout completion, users are redirected to `localhost:3000` instead of the production URL.

**Date:** 2025-10-18  
**Status:** ✅ Diagnosed - Fix Ready

---

## 🔍 Root Cause

The `NEXT_PUBLIC_APP_URL` environment variable in Vercel is set to `http://localhost:3000`.

### Evidence:

1. **Stripe redirect URLs** use `getAppBaseUrl()` from `src/lib/env.ts`
2. **Environment variable priority** in `getAppBaseUrl()`:
   ```typescript
   const candidates = [
     process.env.NEXT_PUBLIC_APP_URL,          // ⚠️ Currently "localhost:3000"
     process.env.NEXT_PUBLIC_VERCEL_URL,
     process.env.VERCEL_URL,
     process.env.VERCEL_PROJECT_PRODUCTION_URL,
   ]
   ```

3. **Checkout success URL** (`src/app/api/stripe/checkout/route.ts:70`):
   ```typescript
   success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
   ```

4. **Webhook events show successful processing:**
   - ✅ `customer.subscription.created` - Status: active
   - ✅ `invoice.paid` - Amount: $29.00
   - ✅ `payment_intent.succeeded` - Status: succeeded
   - ✅ User ID: `MCSuiPoYJVabN7mSR83789SfFpm2`

**Result:** Stripe completes checkout successfully but redirects to `http://localhost:3000/dashboard` instead of `https://shopmatch-pro.vercel.app/dashboard`.

---

## ✅ The Fix

### Option 1: Update Environment Variable (Recommended)

Update `NEXT_PUBLIC_APP_URL` in Vercel to use the production URL:

```bash
# Remove the incorrect localhost value
vercel env rm NEXT_PUBLIC_APP_URL production

# Add the correct production URL
vercel env add NEXT_PUBLIC_APP_URL production
# When prompted, enter: https://shopmatch-pro.vercel.app

# Trigger redeploy
vercel --prod
```

### Option 2: Remove the Variable (Let Vercel Auto-Detect)

Remove `NEXT_PUBLIC_APP_URL` entirely and let the code fall back to Vercel's auto-detected URLs:

```bash
# Remove from all environments
vercel env rm NEXT_PUBLIC_APP_URL production
vercel env rm NEXT_PUBLIC_APP_URL preview
vercel env rm NEXT_PUBLIC_APP_URL development

# Redeploy
vercel --prod
```

The fallback logic in `src/lib/env.ts` will then use:
- `NEXT_PUBLIC_VERCEL_URL` (auto-populated by Vercel)
- `VERCEL_URL` (auto-populated by Vercel)
- `VERCEL_PROJECT_PRODUCTION_URL` (auto-populated by Vercel)

---

## 🧪 How to Verify the Fix

### Step 1: Check Environment Configuration

After updating the variable:

```bash
# Verify it's set correctly
vercel env ls production | grep NEXT_PUBLIC_APP_URL
```

### Step 2: Test Redirect Flow with Playwright

Once redeployed, test the complete flow:

1. **Navigate to production app:**
   ```
   https://shopmatch-pro.vercel.app
   ```

2. **Sign up or log in:**
   ```
   https://shopmatch-pro.vercel.app/login
   ```

3. **Go to subscribe page:**
   ```
   https://shopmatch-pro.vercel.app/subscribe
   ```

4. **Complete Stripe checkout:**
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

5. **Verify redirect:**
   - Should redirect to: `https://shopmatch-pro.vercel.app/dashboard?success=true&session_id=cs_test_...`
   - Should NOT redirect to: `http://localhost:3000/dashboard`

### Step 3: Confirm Subscription Activation

1. **Check Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/test/events
   - Find latest `checkout.session.completed` event
   - Verify webhook delivery: `200 OK`

2. **Check Firebase Custom Claims:**
   - Open browser console after login
   - Run:
     ```javascript
     const user = firebase.auth().currentUser;
     const token = await user.getIdTokenResult(true); // Force refresh
     console.log(token.claims.subActive); // Should be true
     ```

3. **Test Job Creation:**
   - Navigate to: `https://shopmatch-pro.vercel.app/jobs/new`
   - Should be able to create a job (no permission errors)

---

## 📊 Impact Analysis

### What's Working ✅

- Webhook endpoint: `https://shopmatch-pro.vercel.app/api/stripe/webhook`
- Webhook event processing (all events successful)
- Subscription creation in Stripe
- Payment processing
- Custom claims update in Firebase
- Firestore user document updates

### What's Broken ❌

- Redirect URLs after Stripe checkout
- User experience after subscription purchase
- Post-checkout flow (user ends up on localhost instead of production)

### After Fix ✅

- Redirect URLs will point to production
- Users will see success message on production site
- Complete end-to-end subscription flow working
- No localhost references in production

---

## 🚀 Quick Fix Command Sequence

```bash
# 1. Remove incorrect value
vercel env rm NEXT_PUBLIC_APP_URL production

# 2. Let Vercel auto-detect (Option A - Recommended)
# No action needed, just redeploy

# OR add correct value (Option B)
vercel env add NEXT_PUBLIC_APP_URL production
# Enter: https://shopmatch-pro.vercel.app

# 3. Redeploy
vercel --prod

# 4. Wait 30 seconds for deployment

# 5. Test
open https://shopmatch-pro.vercel.app/subscribe
```

**Expected time to fix:** 2 minutes  
**Expected time to redeploy:** 1-2 minutes  
**Expected time to verify:** 3 minutes  

**Total:** ~6 minutes to working production

---

## 🔍 Additional Notes

### Why This Happened

The `.env.local.template` or initial Vercel setup likely had `NEXT_PUBLIC_APP_URL=http://localhost:3000` for local development. This value was copied to production environment variables instead of being updated to the production URL.

### Prevention

1. **Never set production environment variables to localhost values**
2. **Use Vercel's auto-populated variables when possible:**
   - `VERCEL_URL` - Auto-populated for each deployment
   - `VERCEL_PROJECT_PRODUCTION_URL` - Production domain

3. **Document environment variable requirements** in deployment guides

### Related Files

- `src/lib/env.ts` - URL detection logic
- `src/app/api/stripe/checkout/route.ts` - Checkout session creation (uses `getAppBaseUrl()`)
- `src/app/subscribe/page.tsx` - Subscribe page (redirects to Stripe)

---

## 📞 Support

If issues persist after applying the fix:

1. Check Vercel function logs for the `/api/stripe/checkout` endpoint
2. Verify all environment variables are set correctly: `vercel env ls production`
3. Check Stripe Dashboard for webhook delivery status
4. Review [STRIPE_WEBHOOK_TESTING.md](./STRIPE_WEBHOOK_TESTING.md) for debugging steps

---

**Last Updated:** 2025-10-18  
**Author:** AI Assistant  
**Status:** Ready to apply
