# Performance Monitoring Guide

This document describes the performance monitoring setup for ShopMatch Pro, including Sentry Performance Monitoring and Vercel Analytics integration.

## Overview

ShopMatch Pro uses a dual approach to performance monitoring:

1. **Sentry Performance Monitoring** - Full-stack transaction tracing for API routes and frontend
2. **Vercel Analytics** - Real User Monitoring (RUM) for Core Web Vitals

## Sentry Performance Monitoring

### Configuration

Performance monitoring is configured in two files:

**Client-Side**: [sentry.client.config.ts](../sentry.client.config.ts)
- Tracks browser performance (page loads, navigation, Core Web Vitals)
- Uses `browserTracingIntegration()` for automatic instrumentation
- Sample rate: 10% in production, 100% in development

**Server-Side**: [sentry.server.config.ts](../sentry.server.config.ts)
- Tracks API route performance
- HTTP integration automatically enabled by Next.js SDK
- Sample rate: 10% in production, 100% in development

### What Gets Tracked

**Client-Side Metrics**:
- Page load times (Time to First Byte, First Contentful Paint, Largest Contentful Paint)
- Navigation transitions
- Core Web Vitals (LCP, FID, CLS)
- XHR/Fetch request durations
- React component render times

**Server-Side Metrics**:
- API route execution time
- Database query performance (Firestore)
- External API calls (Stripe, Firebase Auth)
- Server-side rendering time

### Enabling in Sentry Dashboard

**Manual Steps Required**:
1. Log into [Sentry Dashboard](https://sentry.io/organizations/davidortizhighencodelearningco/)
2. Navigate to **Settings** → **Projects** → `javascript-nextjs`
3. Click **Performance** tab
4. Enable **Performance Monitoring**
5. Set transaction quota (default: 100k/month on free tier)
6. Save changes

### Viewing Performance Data

**Performance Dashboard**:
- Navigate to **Performance** in left sidebar
- View transaction waterfall charts
- Filter by route (e.g., `/api/jobs`, `/dashboard/owner`)
- Analyze slow transactions (> 1s)

**Transaction Details**:
- Click any transaction to see span details
- Waterfall view shows database queries, API calls, rendering
- Breadcrumbs show user actions leading to slow transaction

**Alerts** (recommended setup):
```
Alert Name: Slow API Routes
Condition: When transaction duration is above 1000ms
Actions: Email notification
```

## Vercel Analytics

### Setup

**Manual Steps Required**:
1. Log into [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Analytics**
3. Enable **Web Analytics** (toggle on)
4. Enable **Speed Insights** (toggle on)
5. Changes apply immediately (no redeploy needed)

### What Gets Tracked

**Web Analytics**:
- Page views and unique visitors
- Geographic distribution
- Referrer sources
- Device/browser breakdown

**Speed Insights**:
- Real User Monitoring (RUM) scores
- Core Web Vitals (LCP, FID, CLS)
- Performance scores by page
- Mobile vs Desktop comparison

### Viewing Analytics Data

**Vercel Dashboard**:
- Navigate to project → **Analytics** tab
- View 7-day, 30-day, or 90-day trends
- Filter by page path
- Export CSV reports

**Speed Insights**:
- Navigate to **Speed Insights** tab
- See performance scores per page
- Compare against industry benchmarks
- Identify slow pages needing optimization

## Performance Budgets

### Current Budgets

| Metric | Budget | Current | Status |
|--------|--------|---------|--------|
| First Load JS | ≤ 300 kB | 254 kB | ✅ Pass |
| Largest page | ≤ 350 kB | 327 kB | ✅ Pass |
| API response time | ≤ 500ms | ~200ms avg | ✅ Pass |
| Database query | ≤ 200ms | ~100ms avg | ✅ Pass |

### CI Enforcement

Bundle budget is enforced in CI:
```yaml
# .github/workflows/ci.yml
- name: First-load JS budget
  run: FIRST_LOAD_BUDGET_KB=300 node scripts/ci/measure-first-load.mjs
```

## Troubleshooting

### Performance Data Not Showing in Sentry

**Symptoms**: No transactions visible in Performance dashboard after 10+ minutes

**Fixes**:
1. Verify `NEXT_PUBLIC_SENTRY_DSN` environment variable is set
2. Check browser console for Sentry errors
3. Verify performance monitoring is enabled in Sentry dashboard
4. Check transaction sample rate (should be 0.1 in production)
5. Force a transaction:
   ```bash
   curl https://shopmatch-pro.vercel.app/api/health
   ```

**Debug Mode** (development only):
```typescript
// sentry.client.config.ts
Sentry.init({
  debug: true, // Enable to see Sentry SDK logs in console
  // ...
})
```

### Vercel Analytics Not Showing Data

**Symptoms**: Analytics tab shows "No data yet"

**Fixes**:
1. Verify Analytics is enabled in Vercel dashboard
2. Wait 5-10 minutes for initial data collection
3. Visit production site to generate page views
4. Check you're viewing correct deployment (Production vs Preview)

### High Transaction Volume Warning

**Symptoms**: Sentry email "Approaching transaction quota"

**Fixes**:
1. Reduce sample rate to 0.05 (5%) or 0.01 (1%) in production
2. Use `tracesSampler` function for selective sampling:
   ```typescript
   Sentry.init({
     tracesSampler: (samplingContext) => {
       // Sample 100% of API routes, 10% of page loads
       if (samplingContext.transactionContext.name.startsWith('/api/')) {
         return 1.0
       }
       return 0.1
     }
   })
   ```

## Best Practices

### 1. Sample Rate Tuning

**Development**: Use 100% sampling for full visibility
```typescript
tracesSampleRate: 1.0
```

**Staging**: Use 50% sampling for realistic data volume
```typescript
tracesSampleRate: 0.5
```

**Production**: Use 10% sampling to stay within quota
```typescript
tracesSampleRate: 0.1
```

### 2. Custom Instrumentation

For critical operations, add custom spans:

```typescript
import * as Sentry from '@sentry/nextjs'

export async function POST(request: Request) {
  const transaction = Sentry.startTransaction({
    op: 'job.create',
    name: 'Create Job Posting'
  })

  try {
    const span = transaction.startChild({
      op: 'db.query',
      description: 'Save job to Firestore'
    })

    await jobsCollection.add(jobData)

    span.finish()
    transaction.setStatus('ok')
  } catch (error) {
    transaction.setStatus('internal_error')
    throw error
  } finally {
    transaction.finish()
  }
}
```

### 3. Tag Important Transactions

Add context for filtering:

```typescript
Sentry.setTag('user_role', user.role) // owner or seeker
Sentry.setTag('subscription_active', user.subActive)
Sentry.setContext('job', { id: jobId, title: job.title })
```

### 4. Monitor Core Flows

**Critical Transactions to Monitor**:
- `/api/stripe/webhook` - Payment processing (should be < 500ms)
- `/api/jobs` POST - Job creation (should be < 300ms)
- `/api/applications` POST - Application submission (should be < 400ms)
- `/dashboard/owner` - Owner dashboard load (should be < 800ms)

**Set Up Alerts**:
```
Alert: Stripe Webhook Slow
Condition: /api/stripe/webhook duration > 500ms
Frequency: More than 10 times in 1 hour
Action: Email + Slack notification
```

## Metrics Glossary

**LCP (Largest Contentful Paint)**: Time until largest content element renders
- Good: < 2.5s
- Needs Improvement: 2.5s - 4s
- Poor: > 4s

**FID (First Input Delay)**: Time from user interaction to browser response
- Good: < 100ms
- Needs Improvement: 100ms - 300ms
- Poor: > 300ms

**CLS (Cumulative Layout Shift)**: Visual stability score (lower is better)
- Good: < 0.1
- Needs Improvement: 0.1 - 0.25
- Poor: > 0.25

**TTFB (Time to First Byte)**: Time from request to first response byte
- Good: < 200ms
- Needs Improvement: 200ms - 500ms
- Poor: > 500ms

## Related Documentation

- [OBSERVABILITY.md](./OBSERVABILITY.md) - Complete observability strategy
- [TESTING.md](./TESTING.md) - Performance testing procedures
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Sentry configuration in production
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Vercel Analytics Docs](https://vercel.com/docs/analytics)

## Changelog

### 2025-10-27 - Initial Performance Monitoring Setup
- Added `browserTracingIntegration()` to client config
- Configured 10% sampling rate for production
- Documented manual dashboard setup steps
- Added Vercel Analytics setup instructions
