# 📊 **Phase 1: Automated Monitoring & Alerting Setup**

**Priority:** 🔴 **CRITICAL - Must Complete Before User Acquisition**  
**Timeline:** 2-3 days  
**Status:** Ready to start  
**Last Updated:** October 19, 2025

---

## 🎯 **Why This Is The Most Important Next Step**

After completing the MVP and deploying to production, **automated monitoring is the ONLY correct next step** because:

1. **Risk Mitigation:** Real users WILL encounter issues - you must know immediately
2. **User Trust:** Can't fix what you don't know is broken
3. **Foundation:** Everything else (live mode, user acquisition) depends on this
4. **Low Effort, High Impact:** 2-3 days of work prevents months of regret

**Without monitoring:**
- ❌ Production issues go undetected
- ❌ Users encounter errors you never see
- ❌ Bad reviews pile up before you know there's a problem
- ❌ Can't confidently invite users or switch to live mode

**With monitoring:**
- ✅ Know within minutes when something breaks
- ✅ Fix issues before users churn
- ✅ Confident user acquisition
- ✅ Data-driven improvements

---

## 📋 **Complete Implementation Guide**

### **Day 1-2: Error Tracking with Sentry**

**Goal:** Catch and report all JavaScript errors, API failures, and exceptions

#### **Step 1: Create Sentry Account**
1. Go to https://sentry.io/signup/
2. Choose "Free" plan (up to 5K errors/month)
3. Create organization: `shopmatch-pro`
4. Create project: `shopmatch-pro-production`
5. Platform: **Next.js**

#### **Step 2: Install Sentry**
```bash
cd /Users/davidortiz/Desktop/Upwork-MVP/shopmatch-pro

# Install Sentry SDK
npm install --save @sentry/nextjs

# Run Sentry wizard (interactive setup)
npx @sentry/wizard@latest -i nextjs
```

**The wizard will:**
- Create `sentry.client.config.ts`
- Create `sentry.server.config.ts`
- Create `sentry.edge.config.ts`
- Update `next.config.js`
- Add `.env.sentry-build-plugin`

#### **Step 3: Configure Sentry**

**File:** `sentry.client.config.ts`
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // 100% in test, reduce to 0.1 in production
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  
  // Ignore common errors
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection captured",
  ],
  
  // Breadcrumbs
  beforeBreadcrumb(breadcrumb) {
    // Don't log console breadcrumbs in production
    if (breadcrumb.category === 'console' && process.env.NODE_ENV === 'production') {
      return null;
    }
    return breadcrumb;
  },
});
```

**File:** `sentry.server.config.ts`
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Server-specific config
  beforeSend(event) {
    // Don't send events in development
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
```

#### **Step 4: Add Environment Variables**

**Vercel Dashboard:**
1. Go to project settings → Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
   SENTRY_AUTH_TOKEN=sntrys_... (from Sentry settings)
   ```
3. Apply to: Production, Preview, Development

#### **Step 5: Test Error Reporting**

**Create test error:**
```typescript
// src/app/api/test-error/route.ts
export async function GET() {
  throw new Error('Test Sentry error reporting');
}
```

**Visit:** https://shopmatch-pro.vercel.app/api/test-error

**Verify:** Error appears in Sentry dashboard within 1 minute

#### **Step 6: Configure Alerts**

**In Sentry Dashboard:**
1. Go to **Alerts** → **Create Alert**
2. Alert name: "Production Errors"
3. Conditions:
   - When: **An event is seen**
   - Environment: **production**
   - Issue state: **is unresolved**
4. Actions:
   - Send notification to: **Email + Slack** (if available)
5. Save

**Create additional alerts:**
- High error volume (>10 errors in 5 minutes)
- New error types (first occurrence)
- API endpoint failures
- Payment processing errors

---

### **Day 2-3: Uptime Monitoring with UptimeRobot**

**Goal:** Monitor site availability and get alerted if it goes down

#### **Step 1: Create UptimeRobot Account**
1. Go to https://uptimerobot.com/signUp
2. Choose "Free" plan (50 monitors, 5-min checks)
3. Verify email

#### **Step 2: Create Monitors**

**Monitor 1: Main Site**
- Type: **HTTP(s)**
- URL: `https://shopmatch-pro.vercel.app`
- Friendly Name: `ShopMatch Pro - Main Site`
- Monitoring Interval: **5 minutes**
- Monitor Timeout: **30 seconds**
- Alert Contacts: Add your email/SMS

**Monitor 2: Health Endpoint**
- Type: **HTTP(s)**
- URL: `https://shopmatch-pro.vercel.app/api/health`
- Friendly Name: `ShopMatch Pro - Health API`
- Monitoring Interval: **5 minutes**
- Keyword: `"status":"ok"` (must be in response)
- Alert Contacts: Add your email/SMS

**Monitor 3: Stripe Webhook**
- Type: **HTTP(s)**
- URL: `https://shopmatch-pro.vercel.app/api/stripe/webhook`
- Friendly Name: `ShopMatch Pro - Stripe Webhook`
- Monitoring Interval: **10 minutes**
- Expected Status: **400** (because no signature, but endpoint is alive)

**Monitor 4: Critical Pages**
- Homepage: `/`
- Login: `/login`
- Subscribe: `/subscribe`
- Jobs: `/jobs`

#### **Step 3: Configure Alert Contacts**

1. Go to **My Settings** → **Alert Contacts**
2. Add:
   - **Email:** Your primary email
   - **SMS:** Your phone number (optional, uses credits)
   - **Slack:** Connect workspace (optional)
   - **Discord:** Webhook URL (optional)

#### **Step 4: Test Monitors**

1. Force failure: Pause Vercel deployment temporarily
2. Verify: Alert received within 5 minutes
3. Restore: Resume deployment
4. Verify: "Up again" alert received

---

### **Day 3: Performance Monitoring with Vercel Analytics**

**Goal:** Track Web Vitals and page performance

#### **Step 1: Enable Vercel Analytics**

1. Go to Vercel Dashboard → Project → Analytics
2. Click "Enable Analytics"
3. Choose "Web Analytics" (free, privacy-friendly)
4. Confirm

**No code changes needed!** Vercel automatically injects the tracking script.

#### **Step 2: Add Web Vitals Reporting to Sentry**

**File:** `src/app/layout.tsx`
```typescript
'use client'

import { useReportWebVitals } from 'next/web-vitals'
import * as Sentry from '@sentry/nextjs'

export function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    // Send to Sentry
    Sentry.metrics.distribution(metric.name, metric.value, {
      unit: 'millisecond',
      tags: { page: window.location.pathname },
    })

    // Log poor vitals
    if (metric.value > getThreshold(metric.name)) {
      console.warn(`Poor ${metric.name}:`, metric.value)
    }
  })

  return null
}

function getThreshold(name: string): number {
  const thresholds = {
    CLS: 0.1,      // Cumulative Layout Shift
    FID: 100,      // First Input Delay (ms)
    FCP: 1800,     // First Contentful Paint (ms)
    LCP: 2500,     // Largest Contentful Paint (ms)
    TTFB: 600,     // Time to First Byte (ms)
    INP: 200,      // Interaction to Next Paint (ms)
  }
  return thresholds[name as keyof typeof thresholds] || Infinity
}
```

**Add to root layout:**
```typescript
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebVitalsReporter />
        {children}
      </body>
    </html>
  )
}
```

#### **Step 3: Set Performance Budgets**

**Vercel Dashboard:**
1. Analytics → Settings
2. Set thresholds:
   - LCP: < 2.5s (Good), < 4s (Needs Improvement)
   - FID: < 100ms (Good), < 300ms (Needs Improvement)
   - CLS: < 0.1 (Good), < 0.25 (Needs Improvement)

---

### **Day 3: Webhook Monitoring**

**Goal:** Ensure Stripe webhooks are processing successfully

#### **Create Webhook Monitor**

**File:** `src/app/api/monitoring/webhooks/route.ts`
```typescript
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/config'

export async function GET() {
  try {
    // Get recent webhook events
    const events = await stripe.events.list({ limit: 10 })
    
    // Check for failed webhooks
    const failedWebhooks = events.data.filter(
      event => event.pending_webhooks > 0
    )
    
    // Get webhook endpoint status
    const endpoints = await stripe.webhookEndpoints.list({ limit: 10 })
    const prodEndpoint = endpoints.data.find(ep => 
      ep.url.includes('shopmatch-pro.vercel.app')
    )
    
    return NextResponse.json({
      status: failedWebhooks.length === 0 ? 'ok' : 'warning',
      webhook_endpoint_status: prodEndpoint?.status || 'unknown',
      failed_webhooks: failedWebhooks.length,
      recent_events: events.data.length,
      last_event: events.data[0]?.created 
        ? new Date(events.data[0].created * 1000).toISOString()
        : null,
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', error: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
```

**Add to UptimeRobot:**
- URL: `/api/monitoring/webhooks`
- Keyword: `"status":"ok"`
- Interval: 15 minutes

---

## ✅ **Verification Checklist**

After completing setup, verify everything works:

### **Sentry Verification**
- [ ] Test error appears in Sentry dashboard
- [ ] Email alert received for test error
- [ ] Production errors are tracked (none yet is good!)
- [ ] Performance metrics showing up
- [ ] Breadcrumbs capture user actions

### **UptimeRobot Verification**
- [ ] All monitors show "Up" status
- [ ] Health endpoint monitor checks `status:ok`
- [ ] Test alert received (force downtime)
- [ ] Alert sent to email/SMS
- [ ] "Up again" alert received

### **Vercel Analytics Verification**
- [ ] Web Vitals data appearing in dashboard
- [ ] Page views tracked
- [ ] Top pages showing data
- [ ] Performance scores calculated

### **Webhook Monitoring Verification**
- [ ] Webhook monitor endpoint returns healthy status
- [ ] Recent events showing in response
- [ ] UptimeRobot checks webhook health

---

## 🚨 **Alert Configuration Best Practices**

### **Alert Severity Levels**

**Critical (Immediate Response)**
- Site completely down
- All API endpoints failing
- Payment processing broken
- Database connection lost

**High (Within 1 Hour)**
- Error rate > 10%
- Webhook failure rate > 5%
- Performance degradation > 50%
- Multiple monitors down

**Medium (Within 4 Hours)**
- Single monitor down
- Slow API responses
- Individual errors increasing
- Warning-level issues

**Low (Within 24 Hours)**
- Minor errors
- Performance slightly degraded
- Individual page issues

### **Alert Channels**

**Critical → SMS + Email + Slack**  
**High → Email + Slack**  
**Medium → Email**  
**Low → Dashboard only**

---

## 📊 **Monitoring Dashboard Setup**

### **Create Monitoring Status Page**

**File:** `src/app/monitoring/page.tsx`
```typescript
'use client'

import { useEffect, useState } from 'react'

export default function MonitoringPage() {
  const [health, setHealth] = useState<any>(null)
  const [webhooks, setWebhooks] = useState<any>(null)

  useEffect(() => {
    fetch('/api/health').then(r => r.json()).then(setHealth)
    fetch('/api/monitoring/webhooks').then(r => r.json()).then(setWebhooks)
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">System Monitoring</h1>
      
      <div className="grid gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(health, null, 2)}
          </pre>
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Webhook Status</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(webhooks, null, 2)}
          </pre>
        </div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">External Monitoring</h2>
        <ul className="space-y-2">
          <li>
            <a href="https://uptimerobot.com" target="_blank" 
               className="text-blue-600 hover:underline">
              UptimeRobot Dashboard →
            </a>
          </li>
          <li>
            <a href="https://sentry.io" target="_blank"
               className="text-blue-600 hover:underline">
              Sentry Dashboard →
            </a>
          </li>
          <li>
            <a href="https://vercel.com/your-account/shopmatch-pro/analytics" 
               target="_blank" className="text-blue-600 hover:underline">
              Vercel Analytics →
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}
```

---

## 📈 **Success Metrics**

After setup is complete, you should have:

- ✅ **< 1 minute** detection time for production errors
- ✅ **< 5 minutes** detection time for site downtime
- ✅ **100%** webhook success rate visibility
- ✅ **Real-time** performance metrics
- ✅ **Multi-channel** alerting (email, SMS, Slack)
- ✅ **Historical** data for trend analysis

---

## 🎯 **After Monitoring Is Complete**

Once all monitoring is set up and verified, you're ready for:

**Next Step:** [Legal Pages Setup](./NEXT_PHASE_LEGAL_PAGES.md)
- Terms of Service
- Privacy Policy
- Cookie Consent

**Then:** [Stripe Live Mode](./NEXT_PHASE_STRIPE_LIVE.md)
- Switch to live keys
- Reconfigure webhooks
- Test real payments

**Then:** [Analytics Setup](./NEXT_PHASE_ANALYTICS.md)
- Google Analytics or Plausible
- Conversion tracking
- User behavior analysis

**Finally:** [Beta User Acquisition](./NEXT_PHASE_BETA_USERS.md)
- Invite 10-20 beta users
- Collect feedback
- Iterate

---

## 🆘 **Troubleshooting**

### **Sentry Not Capturing Errors**
- Check DSN is correct in environment variables
- Verify Sentry config files exist
- Test with `/api/test-error` endpoint
- Check Sentry project is active

### **UptimeRobot Not Sending Alerts**
- Verify email is confirmed
- Check alert contact is enabled
- Test by pausing monitor manually
- Check spam folder

### **Vercel Analytics Not Showing Data**
- Wait 24 hours for initial data
- Verify analytics is enabled in dashboard
- Check page visits are happening
- Refresh dashboard

---

**Status:** Ready to implement  
**Priority:** 🔴 CRITICAL  
**Timeline:** 2-3 days  
**Next Review:** After completion
