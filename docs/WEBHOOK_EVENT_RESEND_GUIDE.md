# 🔄 **Webhook Event Resend Guide**

**Date:** October 19, 2025  
**Purpose:** Resend webhook event to activate subscription after PR #38 deployment  
**Event ID:** `evt_1SJmMIP5UmVB5UbVu9lT8xU2`

---

## 📋 **Background**

### **The Issue**
The `customer.subscription.created` event fired **before** the metadata fallback code was deployed, causing the webhook to fail because:
- User document didn't have `stripeCustomerId` yet (race condition)
- Old code couldn't find the user
- Subscription wasn't activated

### **The Fix (PR #38)**
Added metadata fallback logic at lines 177-199 in `src/app/api/stripe/webhook/route.ts`:

```typescript
// If user not found by stripeCustomerId, check subscription.metadata.userId
if (!userDocRef) {
  const metadataUserId = subscription.metadata?.userId
  if (metadataUserId) {
    const metadataDoc = await usersRef.doc(metadataUserId).get()
    if (metadataDoc.exists) {
      console.log(`Resolved user ${metadataUserId} via subscription metadata fallback`)
      userDocRef = metadataDoc.ref
      userId = metadataUserId
      
      // Link the customer ID
      await userDocRef.update({
        stripeCustomerId: customerId,
        updatedAt: new Date(),
      })
    }
  }
}
```

---

## 🎯 **Event to Resend**

**Event Details:**
```json
{
  "id": "evt_1SJmMIP5UmVB5UbVu9lT8xU2",
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_...",
      "customer": "cus_TGIykeMXAXIMze",
      "status": "active",
      "metadata": {
        "userId": "z1yTp5jKIHZMVi3i4auU92uot4c2"
      }
    }
  }
}
```

**User Affected:**
- **Firebase UID:** `z1yTp5jKIHZMVi3i4auU92uot4c2`
- **Email:** `playwright.final.test@example.com`
- **Expected Status:** Pro subscriber (after resend)

---

## 🚀 **Method 1: Stripe Dashboard (Recommended)**

### **Steps:**

1. **Go to Stripe Test Events:**
   ```
   https://dashboard.stripe.com/test/events
   ```

2. **Find the Event:**
   - Search for: `evt_1SJmMIP5UmVB5UbVu9lT8xU2`
   - Or filter by: `customer.subscription.created`
   - Or search by customer: `cus_TGIykeMXAXIMze`

3. **Resend the Event:**
   - Click on the event row
   - Scroll to the **"Webhooks"** section
   - Find the webhook endpoint: `https://shopmatch-pro.vercel.app/api/stripe/webhook`
   - Click the **"Resend"** button next to the endpoint
   - Confirm the resend

4. **Verify Response:**
   - Wait 2-3 seconds for processing
   - Check that the webhook shows **200 OK** status
   - Look for green checkmark ✅

---

## 🚀 **Method 2: Stripe CLI**

### **Prerequisites:**
```bash
# Login to Stripe (if not already)
stripe login

# Verify you're in test mode
stripe config --list
```

### **Resend Command:**
```bash
# Resend the specific event
stripe events resend evt_1SJmMIP5UmVB5UbVu9lT8xU2

# Expected output:
# Event evt_1SJmMIP5UmVB5UbVu9lT8xU2 resent successfully
```

### **Alternative - Trigger Fresh Event:**
```bash
# If resend doesn't work, trigger a new subscription event
stripe trigger customer.subscription.created \
  --add customer:metadata.userId=z1yTp5jKIHZMVi3i4auU92uot4c2
```

---

## ✅ **Verification Steps**

After resending the event, verify the fix worked:

### **1. Check Vercel Logs**
```bash
# View recent logs
vercel logs https://shopmatch-pro.vercel.app --follow

# Look for this success message:
# "✅ Activated subscription access for user z1yTp5jKIHZMVi3i4auU92uot4c2"
```

**Expected Log Output:**
```
Processing webhook event: customer.subscription.created
Resolved user z1yTp5jKIHZMVi3i4auU92uot4c2 via subscription metadata fallback
✅ Activated subscription access for user z1yTp5jKIHZMVi3i4auU92uot4c2
```

### **2. Check Stripe Dashboard**
```
https://dashboard.stripe.com/test/events/evt_1SJmMIP5UmVB5UbVu9lT8xU2
```

**Expected:**
- Webhook status: **200 OK** ✅
- Response time: < 2 seconds
- No error messages

### **3. Verify Firestore (Firebase Console)**

**Go to:**
```
https://console.firebase.google.com/project/shopmatch-pro/firestore
```

**Check Document:**
```
Collection: users
Document ID: z1yTp5jKIHZMVi3i4auU92uot4c2
```

**Expected Fields:**
```json
{
  "email": "playwright.final.test@example.com",
  "stripeCustomerId": "cus_TGIykeMXAXIMze",  // ← Should now be set
  "subscriptionId": "sub_...",                 // ← Should now be set
  "subActive": true,                           // ← Should be true
  "subscriptionStatus": "active",              // ← Should be active
  "updatedAt": "2025-10-19T05:XX:XX.XXXZ"     // ← Recent timestamp
}
```

### **4. Verify Custom Claims**

**Option A - Firebase Console:**
```
https://console.firebase.google.com/project/shopmatch-pro/authentication/users
```

Find user `playwright.final.test@example.com` → Click "Edit user" → Check custom claims

**Expected Custom Claims:**
```json
{
  "role": "employer",
  "subActive": true,
  "stripeCustomerId": "cus_TGIykeMXAXIMze",
  "subscriptionId": "sub_...",
  "updatedAt": "2025-10-19T05:XX:XX.XXXZ"
}
```

**Option B - Programmatic Check:**
```bash
# Using Firebase Admin SDK (if available)
firebase auth:export users.json
grep "z1yTp5jKIHZMVi3i4auU92uot4c2" users.json
```

### **5. Test Job Creation**

**Login as the user:**
```
URL: https://shopmatch-pro.vercel.app/login
Email: playwright.final.test@example.com
Password: TestPassword123!
```

**Navigate to job creation:**
```
https://shopmatch-pro.vercel.app/jobs/new
```

**Expected Result:**
- ✅ Page loads successfully
- ✅ NO 403 error
- ✅ Form is visible and functional
- ✅ Can fill out and submit job details

**Previous Error (should be gone):**
```json
{
  "error": "Access denied. Employer Pro subscription required.",
  "code": "SUBSCRIPTION_REQUIRED"
}
```

---

## 🔍 **Troubleshooting**

### **Issue: Event resend shows 500 error**

**Possible Causes:**
- Firebase Admin SDK connection issue
- Missing environment variables
- Firestore permissions problem

**Debug Steps:**
```bash
# Check Vercel logs for detailed error
vercel logs https://shopmatch-pro.vercel.app --since 10m

# Verify environment variables
vercel env ls production | grep -E "(FIREBASE|STRIPE)"
```

### **Issue: User still getting 403 error**

**Possible Causes:**
- Custom claims not refreshed in frontend
- Token not updated after claim change

**Fix:**
```typescript
// User needs to force token refresh
// In browser console or frontend code:
const user = auth.currentUser;
if (user) {
  await user.getIdToken(true); // Force refresh
  window.location.reload();     // Reload page
}
```

**Manual Fix:**
1. Log out completely
2. Clear browser cache
3. Log back in (forces new token)

### **Issue: Metadata missing from subscription**

**Verify metadata was set during checkout:**
```bash
# Check the subscription object
stripe subscriptions retrieve sub_XXXXX --expand customer

# Look for metadata.userId field
```

**If missing, update it:**
```bash
stripe subscriptions update sub_XXXXX \
  --metadata[userId]=z1yTp5jKIHZMVi3i4auU92uot4c2
```

---

## 🎯 **Success Criteria**

All of these must be true:

- [ ] Webhook event shows **200 OK** in Stripe Dashboard
- [ ] Vercel logs show: `✅ Activated subscription access for user z1yTp5jKIHZMVi3i4auU92uot4c2`
- [ ] Firestore user document has `stripeCustomerId` field set
- [ ] Firestore user document has `subActive: true`
- [ ] Firebase custom claims include `subActive: true`
- [ ] User can access `/jobs/new` without 403 error
- [ ] Job creation form loads and works

---

## 📊 **Expected Timeline**

| Step | Duration | Notes |
|------|----------|-------|
| Resend event via Dashboard | 10 seconds | Click resend button |
| Webhook processing | 1-2 seconds | Server processes event |
| Firestore update | 1 second | Document updated |
| Custom claims update | 1 second | Auth claims set |
| Frontend token refresh | 5-30 seconds | May require logout/login |
| **Total** | **< 1 minute** | Excluding manual token refresh |

---

## 🔄 **Alternative: Create New Test Subscription**

If resending doesn't work, create a fresh test:

### **Steps:**

1. **Create new test email:**
   ```
   test.subscription.oct19@example.com
   ```

2. **Sign up as new user:**
   ```
   https://shopmatch-pro.vercel.app/signup
   ```

3. **Complete subscription:**
   - Navigate to `/subscribe`
   - Click "Subscribe Now"
   - Use test card: `4242 4242 4242 4242`
   - Complete checkout

4. **Verify webhook processes correctly:**
   - Check Vercel logs for success message
   - Confirm Firestore document updated
   - Test job creation immediately

### **Advantages:**
- ✅ Tests complete flow end-to-end
- ✅ Verifies PR #38 works in real scenario
- ✅ Confirms all race conditions resolved
- ✅ Provides clean test case

### **Disadvantages:**
- ❌ Creates another test subscription
- ❌ Doesn't verify resend functionality
- ❌ Leaves old user in broken state

---

## 📝 **Next Steps After Verification**

Once the webhook is successfully processed:

1. **Document the fix:**
   - Update status in PR #38
   - Mark issue as resolved
   - Record in changelog

2. **Monitor production:**
   - Watch for similar issues
   - Check webhook success rate
   - Monitor Firestore updates

3. **Consider improvements:**
   - Add retry logic for failed webhook processing
   - Add alerting for webhook failures
   - Create admin tool to manually sync users

4. **Clean up test data:**
   - Remove test subscriptions
   - Delete test user accounts
   - Clear test payment methods

---

## ✅ **Completion Checklist**

- [ ] Event resent successfully
- [ ] Webhook returned 200 OK
- [ ] Vercel logs show success message
- [ ] Firestore document updated
- [ ] Custom claims set correctly
- [ ] Job creation works
- [ ] Documentation updated
- [ ] Issue closed

---

## 🆘 **Need Help?**

If issues persist:

1. **Check recent deployments:**
   ```bash
   vercel ls
   ```

2. **Verify PR #38 is deployed:**
   ```bash
   git log origin/main --oneline | head -5
   ```

3. **Review webhook endpoint code:**
   ```bash
   cat src/app/api/stripe/webhook/route.ts | grep -A 20 "metadata.userId"
   ```

4. **Test webhook locally:**
   ```bash
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```

---

**Status:** Ready for event resend  
**Priority:** High (blocks user from using subscription)  
**Estimated Resolution Time:** < 5 minutes
