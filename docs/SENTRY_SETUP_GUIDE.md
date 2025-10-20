# Sentry Error Tracking Setup Guide

**Status**: ✅ Sentry SDK Installed & Configured
**Priority**: 🔴 CRITICAL - Complete before user acquisition
**Time Required**: 15-20 minutes

---

## Overview

Sentry provides automated error tracking and performance monitoring for ShopMatch Pro. This guide covers:

1. Creating a Sentry account and project
2. Configuring the Sentry DSN
3. Testing error capture
4. Setting up alert rules
5. Verifying production deployment

---

## Prerequisites

- [x] Sentry SDK installed (`@sentry/nextjs` v6.6.0+)
- [x] Configuration files created (sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts)
- [x] Next.js config updated with Sentry plugin
- [x] Test endpoint created (/api/sentry-test)

---

## Step 1: Create Sentry Account (5 minutes)

1. **Sign up for Sentry**:
   - Go to https://sentry.io/signup/
   - Use your GitHub account or email
   - Select the **free** plan (14-day trial of Team plan, then downgrades to free)

2. **Create a new project**:
   - Platform: **Next.js**
   - Project name: `shopmatch-pro` (or your preference)
   - Team: Use default or create new team

3. **Copy the DSN**:
   - After project creation, you'll see the DSN immediately
   - Format: `https://PUBLIC_KEY@o0.ingest.sentry.io/PROJECT_ID`
   - Example: `https://abc123def456@o123456.ingest.sentry.io/7890123`
   - **Save this DSN** - you'll need it in Step 2

---

## Step 2: Configure Environment Variables (2 minutes)

### Local Development

1. **Open your `.env.local` file**:
   ```bash
   nano .env.local
   # or
   code .env.local
   ```

2. **Add the Sentry DSN**:
   ```bash
   # Sentry Error Tracking
   NEXT_PUBLIC_SENTRY_DSN=https://YOUR_PUBLIC_KEY@o0.ingest.sentry.io/YOUR_PROJECT_ID
   ```

3. **Save and close** the file

### Production (Vercel)

1. **Via Vercel CLI**:
   ```bash
   vercel env add NEXT_PUBLIC_SENTRY_DSN production
   # Paste your DSN when prompted
   ```

2. **Or via Vercel Dashboard**:
   - Go to Project → Settings → Environment Variables
   - Click "Add New"
   - Key: `NEXT_PUBLIC_SENTRY_DSN`
   - Value: (paste your DSN)
   - Environment: **Production** (check the box)
   - Click "Save"

3. **Redeploy**:
   ```bash
   vercel --prod
   ```

---

## Step 3: Test Error Capture (3 minutes)

### Local Testing

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test the health endpoint**:
   ```bash
   curl http://localhost:3000/api/sentry-test
   ```

   **Expected response**:
   ```json
   {
     "status": "ok",
     "message": "Sentry test endpoint is working",
     "hint": "Add ?error=true query parameter to trigger a test error"
   }
   ```

3. **Trigger a test error**:
   ```bash
   curl "http://localhost:3000/api/sentry-test?error=true"
   ```

   **Expected response**:
   ```json
   {
     "error": "Test error triggered and sent to Sentry",
     "message": "Check your Sentry dashboard to see if the error was captured",
     "errorId": "abc123def456"
   }
   ```

4. **Verify in Sentry Dashboard**:
   - Go to https://sentry.io/
   - Navigate to Projects → shopmatch-pro
   - Click "Issues" in left sidebar
   - You should see: **"Sentry Test Error - This is a test error to verify Sentry integration"**
   - Click on the issue to see full stack trace and context

✅ **Success Criteria**: Error appears in Sentry dashboard within 30 seconds

### Production Testing

After deploying to production:

1. **Trigger a test error on production**:
   ```bash
   curl "https://shopmatch-pro.vercel.app/api/sentry-test?error=true"
   ```

2. **Verify in Sentry**:
   - Check that the error shows `environment: production`
   - Verify stack traces include source maps for easier debugging

---

## Step 4: Configure Alert Rules (5 minutes)

Set up notifications so you're alerted when errors occur.

### Email Alerts

1. **Go to Sentry Dashboard** → Settings → Projects → shopmatch-pro
2. Click **Alerts** in left sidebar
3. Click **Create Alert Rule**
4. Select **Issues**
5. Configure:
   - **When**: An event is seen
   - **If**: All events
   - **Then**: Send a notification via Email

6. **Add more specific rules** (recommended):
   - **Critical errors** (high frequency):
     - When: An event is seen more than **10 times in 1 hour**
     - Then: Send notification via Email

   - **New errors** (first-time issues):
     - When: An issue is **first seen**
     - Then: Send notification via Email

7. Click **Save Rule**

### Slack Notifications (Optional)

1. **Install Sentry Slack app**:
   - Sentry Dashboard → Settings → Integrations → Slack
   - Click "Install"
   - Authorize Sentry to access your Slack workspace

2. **Configure alert routing**:
   - Project Settings → Alerts
   - Create new rule or edit existing
   - Change action from "Email" to "Send a Slack notification"
   - Select your channel (e.g., `#production-alerts`)

---

## Step 5: Verify Production Deployment

After deploying changes to production:

### 1. Check Build Logs

Look for Sentry initialization in Vercel deployment logs:
```
✓ Sentry webpack plugin initialized
✓ Uploading source maps to Sentry
```

### 2. Verify Endpoints

```bash
# Health check
curl https://shopmatch-pro.vercel.app/api/health | jq .

# Sentry test endpoint
curl https://shopmatch-pro.vercel.app/api/sentry-test | jq .

# Trigger test error
curl "https://shopmatch-pro.vercel.app/api/sentry-test?error=true" | jq .
```

### 3. Monitor Real Errors

After deployment, check Sentry for any real errors:

1. **Dashboard** → Issues → Filter by "is:unresolved"
2. Look for patterns:
   - Same error from multiple users → Critical bug
   - Errors from specific browser/OS → Compatibility issue
   - Errors during specific actions → UX problem

---

## Step 6: Configure Performance Monitoring (Optional)

Sentry can also track performance metrics (page load times, API response times).

1. **Enable Performance Monitoring**:
   - Sentry Dashboard → Settings → Projects → shopmatch-pro
   - Click "Performance" in left sidebar
   - Toggle "Enable Performance"

2. **Adjust Sample Rate** (default: 100%):
   - Edit `sentry.client.config.ts`:
     ```typescript
     tracesSampleRate: 0.1,  // Sample 10% of transactions (reduces quota usage)
     ```

3. **View Performance Data**:
   - Sentry Dashboard → Performance
   - See slowest pages, slowest API routes, slow database queries

---

## Maintenance & Best Practices

### Daily Tasks

- [ ] Check Sentry dashboard for new errors (5 min)
- [ ] Triage critical errors (mark as resolved, assign, ignore)

### Weekly Tasks

- [ ] Review error trends (are errors increasing or decreasing?)
- [ ] Update alert rules based on noise level
- [ ] Check performance metrics (any regressions?)

### Error Response Workflow

When you receive a Sentry alert:

1. **Assess severity**:
   - Critical: Users can't complete core actions (subscribe, create job, apply)
   - High: Feature broken but workaround exists
   - Medium: UI glitch, cosmetic issue
   - Low: Rare edge case

2. **Investigate**:
   - Review stack trace
   - Check user impact (how many users affected?)
   - Reproduce locally if possible

3. **Fix and deploy**:
   - Create fix branch
   - Test thoroughly
   - Deploy via PR workflow
   - Monitor Sentry to confirm fix

4. **Resolve in Sentry**:
   - Mark issue as "Resolved in next release"
   - Add comment with PR link

---

## Troubleshooting

### Issue: Errors not appearing in Sentry

**Cause**: DSN not configured or incorrect

**Fix**:
1. Check `.env.local` has `NEXT_PUBLIC_SENTRY_DSN`
2. Verify DSN format: `https://PUBLIC_KEY@o0.ingest.sentry.io/PROJECT_ID`
3. Restart dev server: `npm run dev`
4. Trigger test error again

### Issue: Source maps not uploading

**Cause**: Missing Sentry auth token or org/project settings

**Fix**:
1. Create Sentry auth token:
   - Sentry Dashboard → Settings → Auth Tokens
   - Click "Create New Token"
   - Scopes: `project:releases`, `org:read`
   - Copy token

2. Add to Vercel env vars:
   ```bash
   vercel env add SENTRY_AUTH_TOKEN production
   # Paste token when prompted
   ```

3. Redeploy

### Issue: Too many alerts (spam)

**Cause**: Alert rules too broad

**Fix**:
1. Edit alert rule in Sentry
2. Change frequency threshold:
   - From: "An event is seen"
   - To: "An event is seen more than 10 times in 1 hour"

3. Add filters:
   - Ignore errors from bots/crawlers
   - Ignore specific error messages (if known false positives)

---

## Next Steps

After Sentry is configured:

1. ✅ Sentry error tracking configured
2. ⏭️  Set up UptimeRobot monitoring (see `NEXT_PHASE_MONITORING_SETUP.md`)
3. ⏭️  Enable Vercel Analytics
4. ⏭️  Create legal pages (Terms, Privacy Policy)
5. ⏭️  Migrate to Stripe live mode

**Reference**: [NEXT_PHASE_MONITORING_SETUP.md](./NEXT_PHASE_MONITORING_SETUP.md) for complete monitoring stack setup

---

## Resources

- **Sentry Next.js Docs**: https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Sentry Performance Monitoring**: https://docs.sentry.io/product/performance/
- **Alert Configuration**: https://docs.sentry.io/product/alerts/
- **Sentry Free Plan Limits**: 5,000 errors/month, 10,000 performance units/month

---

**Questions?** See [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) for production incident procedures or [runbooks/STRIPE_WEBHOOK_RUNBOOK.md](./runbooks/STRIPE_WEBHOOK_RUNBOOK.md) for specific debugging workflows.
