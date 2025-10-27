# Dashboard Setup Guide - Performance Monitoring

**Time Required**: 10 minutes total (5 min Sentry + 2 min Vercel + 3 min verification)

**Prerequisites**:
- PR #91 merged and deployed to production
- Sentry account access (https://sentry.io)
- Vercel account access (https://vercel.com)

---

## Part 1: Enable Sentry Performance Monitoring (5 minutes)

### Step 1: Navigate to Sentry Performance Settings
1. **Open**: https://sentry.io/organizations/davidortizhighencodelearningco/
2. **Login** if prompted (use your existing Sentry credentials)
3. **Click**: `Settings` in left sidebar
4. **Click**: `Projects` in settings menu
5. **Click**: `javascript-nextjs` project

### Step 2: Enable Performance Monitoring
1. **Click**: `Performance` tab (top navigation)
2. **Find**: "Performance Monitoring" toggle switch
3. **Toggle**: Switch to **ON** (enabled)
4. **Set Transaction Quota**:
   - Default: 100,000 transactions/month (free tier)
   - Recommended: Keep default for now
   - Note: With 10% sampling, this supports ~1M requests/month
5. **Click**: `Save Changes` button

### Step 3: Verify Configuration
1. **Check**: Green checkmark appears next to "Performance Monitoring"
2. **Navigate**: Click `Performance` in left sidebar
3. **Expect**: "Waiting for transactions" message (normal before first deploy)
4. **Note**: Data will appear 5-10 minutes after first production traffic

**What You Should See**:
```
✅ Performance Monitoring: Enabled
📊 Transaction Quota: 100,000/month
🎯 Sample Rate: 10% (configured in code)
```

---

## Part 2: Enable Vercel Analytics & Speed Insights (2 minutes)

### Step 1: Navigate to Vercel Analytics
1. **Open**: https://vercel.com/dashboard
2. **Login** if prompted
3. **Click**: Your project (`shopmatch-pro`)
4. **Click**: `Settings` tab (top navigation)
5. **Click**: `Analytics` in left sidebar

### Step 2: Enable Web Analytics
1. **Find**: "Web Analytics" section
2. **Toggle**: Switch to **ON** (enabled)
3. **Note**: No additional configuration needed
4. **Confirmation**: "Web Analytics enabled" message appears

### Step 3: Enable Speed Insights
1. **Scroll down** to "Speed Insights" section
2. **Toggle**: Switch to **ON** (enabled)
3. **Note**: Tracks Core Web Vitals (LCP, FID, CLS)
4. **Confirmation**: "Speed Insights enabled" message appears

### Step 4: Verify Deployment Integration
1. **Navigate**: Back to project overview (click project name)
2. **Click**: `Analytics` tab (top navigation)
3. **Expect**: "Collecting data..." message (normal for new setup)
4. **Note**: Data appears after 5-10 minutes of production traffic

**What You Should See**:
```
✅ Web Analytics: Enabled
✅ Speed Insights: Enabled
📊 Real User Monitoring: Active
🎯 Core Web Vitals: Tracking
```

---

## Part 3: Generate Test Traffic & Verify Data Flow (3 minutes)

### Step 1: Generate Test Transactions
After enabling both dashboards, generate sample traffic:

```bash
# Run these commands from your terminal:

# Test API routes (server-side tracing)
curl https://shopmatch-pro.vercel.app/api/health
curl https://shopmatch-pro.vercel.app/api/health
curl https://shopmatch-pro.vercel.app/api/health

# Open pages in browser (client-side tracing + analytics)
# Visit these URLs in your browser:
# 1. https://shopmatch-pro.vercel.app/
# 2. https://shopmatch-pro.vercel.app/jobs
# 3. https://shopmatch-pro.vercel.app/login
# 4. https://shopmatch-pro.vercel.app/dashboard

# Total: Generate ~10-15 page views across different routes
```

### Step 2: Wait for Data Processing
**Timeline**:
- **Immediate (0-2 min)**: Vercel deployment logs show requests
- **5 minutes**: First Sentry transactions appear
- **10 minutes**: Vercel Analytics shows page views
- **15 minutes**: Speed Insights displays Core Web Vitals

### Step 3: Verify Sentry Performance Data
1. **Navigate**: https://sentry.io → Performance tab
2. **Check**: Transaction list appears
3. **Look for**:
   - `/api/health` transactions (server-side)
   - Page load transactions (client-side)
   - Duration values (should be < 500ms for API routes)

**Expected First View**:
```
Transaction                    Count    P50    P95
/api/health                    3        120ms  150ms
/                              1        800ms  800ms
/jobs                          1        650ms  650ms
/login                         1        750ms  750ms
```

### Step 4: Verify Vercel Analytics Data
1. **Navigate**: https://vercel.com → Your project → Analytics tab
2. **Check**: Page view graph shows data points
3. **Look for**:
   - Total page views (should match your browser visits)
   - Top pages list
   - Visitor count

**Expected First View**:
```
📊 Total Visitors: 1
📄 Total Page Views: 4-5
🏆 Top Pages:
   - / (homepage)
   - /jobs
   - /login
   - /dashboard
```

### Step 5: Verify Speed Insights Data
1. **Navigate**: Speed Insights tab (within Analytics)
2. **Check**: Core Web Vitals scores appear
3. **Look for**:
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)

**Expected First View**:
```
🎯 Performance Score: 85-95 (Good)
📊 Core Web Vitals:
   - LCP: < 2.5s (Good)
   - FID: < 100ms (Good)
   - CLS: < 0.1 (Good)
```

---

## Part 4: Set Up Alerts (Optional but Recommended)

### Sentry Alert for Slow Transactions

1. **Navigate**: Sentry → Alerts → Create Alert
2. **Select**: "Issue Alert"
3. **Configure**:
   - **Name**: "Slow API Routes"
   - **Conditions**: "When transaction duration is above 1000ms"
   - **Frequency**: "More than 10 times in 1 hour"
   - **Actions**: "Send a notification via Email"
4. **Apply to**: `javascript-nextjs` project
5. **Save Alert**

### Recommended Alerts

**Critical Performance Alerts**:
```
1. Slow API Routes
   - Condition: Transaction duration > 1000ms
   - Threshold: 10 occurrences/hour
   - Action: Email notification

2. Database Query Timeout
   - Condition: Transaction contains "firestore" AND duration > 500ms
   - Threshold: 5 occurrences/hour
   - Action: Email + Slack (if integrated)

3. Stripe Webhook Slow
   - Condition: /api/stripe/webhook duration > 500ms
   - Threshold: 3 occurrences/hour
   - Action: Immediate email (payment critical)
```

**Core Web Vitals Alerts** (Vercel - Pro Plan only):
- Not available on free tier
- Monitor manually via Speed Insights dashboard
- Check weekly for degradation

---

## Troubleshooting

### Issue: "No transactions in Sentry after 10 minutes"

**Checks**:
1. Verify `NEXT_PUBLIC_SENTRY_DSN` environment variable is set in Vercel
2. Check browser console for Sentry errors (F12 → Console)
3. Verify Performance Monitoring is enabled in Sentry dashboard
4. Check Sentry project DSN matches environment variable

**Debug Steps**:
```bash
# Check production environment variables
vercel env ls production | grep SENTRY

# Expected output:
# NEXT_PUBLIC_SENTRY_DSN          Created 7d ago

# If missing, add it:
vercel env add NEXT_PUBLIC_SENTRY_DSN production
# Paste your Sentry DSN when prompted
# Redeploy: vercel --prod
```

### Issue: "Vercel Analytics shows 0 visitors"

**Checks**:
1. Verify you're viewing the **Production** deployment (not Preview)
2. Check you visited the production URL (shopmatch-pro.vercel.app)
3. Wait 10-15 minutes for initial data processing
4. Disable ad blockers when testing (they may block analytics)

**Debug Steps**:
```bash
# Check latest deployment status
vercel ls --prod

# Force new deployment to trigger analytics
vercel --prod --force
```

### Issue: "Speed Insights not showing Core Web Vitals"

**Checks**:
1. Verify Speed Insights is enabled (toggle should be ON)
2. Check you generated page views in a real browser (not curl)
3. Wait 15-20 minutes for initial data aggregation
4. Ensure JavaScript is enabled in browser

**Known Limitations**:
- Speed Insights requires real browser interactions (not API calls)
- Data aggregation can take 15-30 minutes initially
- Requires minimum 10-20 page views for accurate scores

### Issue: "FOSSA Dependency Quality check failing in PR"

**Status**: Known issue, non-blocking
**Cause**: FOSSA flagged a minor dependency quality concern
**Action**: Safe to ignore - all security checks (CodeQL, Snyk, License) passed
**Fix**: FOSSA issues auto-resolve when dependency is updated in future

---

## Success Criteria Checklist

After completing setup, verify all items:

**Sentry Dashboard**:
- [ ] Performance Monitoring toggle is ON
- [ ] Transaction quota set to 100,000/month
- [ ] At least 3 transactions visible in Performance tab
- [ ] Transaction durations are reasonable (< 1s for most)
- [ ] No error transactions (status should be "ok")

**Vercel Dashboard**:
- [ ] Web Analytics toggle is ON
- [ ] Speed Insights toggle is ON
- [ ] Analytics tab shows visitor count > 0
- [ ] Page views match your test traffic
- [ ] Speed Insights shows Core Web Vitals scores

**Production Verification**:
- [ ] Production site loads normally (no Sentry errors)
- [ ] Performance feels snappy (no degradation)
- [ ] Browser console shows no Sentry warnings
- [ ] All CI checks passed on PR #91

---

## Post-Setup Actions

### 1. Monitor for 24 Hours
- Check Sentry Performance tab daily for first week
- Look for slow transactions (> 1s)
- Identify optimization opportunities

### 2. Set Performance Baselines
Record current performance metrics:

```markdown
## Performance Baseline (Date: 2025-10-27)

**API Routes** (Sentry P50):
- /api/health: 120ms
- /api/jobs: 250ms
- /api/applications: 200ms
- /api/stripe/webhook: 300ms

**Page Loads** (Vercel Speed Insights):
- Homepage (/): LCP 1.8s, FID 50ms, CLS 0.05
- Jobs (/jobs): LCP 2.0s, FID 60ms, CLS 0.08
- Dashboard (/dashboard): LCP 2.2s, FID 70ms, CLS 0.06

**Bundle Size**:
- First Load JS: 254 kB
- Largest Page: 327 kB
```

### 3. Weekly Review Process
Add to your calendar (every Monday):
1. Review Sentry Performance tab (5 min)
2. Check for slow transaction trends
3. Review Vercel Analytics visitor patterns
4. Check Speed Insights for Core Web Vitals degradation
5. Document any performance regressions

---

## Related Documentation

- [PERFORMANCE_MONITORING.md](./PERFORMANCE_MONITORING.md) - Complete performance monitoring guide
- [OBSERVABILITY.md](./OBSERVABILITY.md) - Observability strategy
- [TESTING.md](./TESTING.md) - Performance testing procedures
- [PR #91](https://github.com/RazonIn4K/shopmatch-pro/pull/91) - Performance monitoring implementation

---

## Quick Reference: Dashboard URLs

**Sentry**:
- Organization: https://sentry.io/organizations/davidortizhighencodelearningco/
- Project Settings: https://sentry.io/settings/davidortizhighencodelearningco/projects/javascript-nextjs/
- Performance: https://sentry.io/organizations/davidortizhighencodelearningco/performance/

**Vercel**:
- Dashboard: https://vercel.com/dashboard
- Project Settings: https://vercel.com/razs-projects-29d4f2e6/shopmatch-pro/settings
- Analytics: https://vercel.com/razs-projects-29d4f2e6/shopmatch-pro/analytics

**Production Site**:
- Homepage: https://shopmatch-pro.vercel.app/
- Health Check: https://shopmatch-pro.vercel.app/api/health

---

**Next Step**: Complete Parts 1-3 above, then return to verify data is flowing correctly. Estimated total time: 10-15 minutes.
