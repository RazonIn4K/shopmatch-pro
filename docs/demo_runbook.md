# Demo Runbook: ShopMatch Pro Analytics

## 1. Launching the App Locally
1. Install dependencies (first time only):
   ```bash
   npm install
   ```
2. Start the dev server with Doppler so the Firebase/Stripe secrets and smoke-test creds load automatically:
   ```bash
   doppler run --project firebase-shopmatch --config dev -- npm run dev
   ```
3. Open http://localhost:3000 in your browser.
4. Sign in with the shared demo owner account (from `DEMO_OWNER_EMAIL` / `DEMO_OWNER_PASSWORD`, defaults owner@test.com / testtest123). Update these in Doppler if you rotate credentials.
5. Navigate to **Dashboard → Analytics** (or visit http://localhost:3000/dashboard/analytics directly). The dashboard nav highlights the active section.

## 2. 60–90 Second Loom Script
Use this outline to record a tight, portfolio-ready walkthrough for founders/agencies.

1. **Intro (10s)**
   - “Hey, this is David. I built ShopMatch Pro to showcase how I craft production-ready SaaS dashboards.”
2. **Navigation (10s)**
   - Click **Dashboard → Analytics**. Mention the reusable nav + App Router layout.
3. **KPI Cards (15s)**
   - Highlight Jobs Posted, Matches Generated, Time-to-Match, Interview Rate.
   - Talk about how each card is backed by a configurable dataset and how it would hook into Firestore, Postgres, or Snowflake.
4. **Distribution + Velocity Charts (15s)**
   - Scroll to the bar lists (Job Distribution, Matches Per Week).
   - Note that these are accessible, mobile-responsive, and fed by a single config for fast client-specific swaps.
5. **Conversion Funnel + Insights (20s)**
   - Walk through the funnel steps (Views → Hires) and the narrative highlights.
   - Explain how this helps founders discuss bottlenecks with investors or agency clients.
6. **Close (10s)**
   - “This proves I can ship polished analytics experiences end-to-end: design system, routing, fake data hooks, and upgrade path to live metrics.”

## 3. Key Talk Tracks
Use these snippets when narrating the Loom, writing proposals, or answering “what does this prove?”

### What this proves about my skills
- I design and build full-stack dashboards with App Router, Tailwind, and TypeScript.
- I know how to structure KPIs, conversion funnels, and narrative insights for executive audiences.
- I think ahead about configurability (e.g., swapping datasets per client vertical) so founders see a clear path to production.

### How this could map to your SaaS
- Replace the demo metrics with your live tracking source (Stripe, Amplitude, Firestore) and the layout instantly becomes your ops dashboard.
- Drop in additional widgets (MRR, churn, course completions, etc.) using the same UI primitives.
- Reuse the analytics nav and layout to create a client-facing portal, investor report view, or weekly health check.
