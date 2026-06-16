# ShopMatch Pro - Loom Recording Packet

**Recommended recording:** 90 seconds for LinkedIn/profile proof, 4-5 minutes for a deeper portfolio walkthrough.

**Live site:** https://shopmatch.highencodelearning.com
**Repo:** https://github.com/RazonIn4K/shopmatch-pro
**Last verified:** 2026-06-16

## Pre-Recording Checklist

- Open `https://shopmatch.highencodelearning.com` in a clean browser tab.
- Open `https://shopmatch.highencodelearning.com/jobs` in a second tab.
- Keep the GitHub Actions page ready if you want to show CI proof.
- Close unrelated tabs and notifications.
- Use the seeded demo accounts shown on the homepage:
  - Employer: `owner@test.com` / `testtest123`
  - Job Seeker: `seeker@test.com` / `testtest123`
- Stripe is test mode only. If showing checkout, use `4242 4242 4242 4242`, any future date, any CVC.

## Current Verified Claims

Use these claims on camera:

- "This is a deployed portfolio SaaS demo running on Vercel."
- "The stack is Next.js 15.5.19, React 19, TypeScript 5.9, Firebase, Stripe, Sentry, Tailwind CSS, and GitHub Actions."
- "It has seeded demo accounts, Stripe test-mode billing, job posting, application tracking, analytics, Firestore rules, and production smoke tests."
- "GitHub Dependabot has zero open alerts, and the production dependency audit is clean."
- "The full audit still tracks three dev-only Firebase Tools/OpenTelemetry moderate advisories, documented in `docs/SECURITY.md`; they are not in the Vercel runtime bundle."
- "Latest CI is green for build, typecheck, unit tests, Firestore rules, local smoke, production smoke, accessibility, Snyk, and CodeQL."
- "This is a portfolio demo in test mode, not a live hiring marketplace."

Avoid these claims:

- Do not say "zero vulnerabilities" without qualifying it as production/deployed dependencies.
- Do not imply real payments are processed. Stripe is test mode.
- Do not say the GitLab mirror is actively mirroring until `GITLAB_MIRROR_TOKEN` is configured.
- Do not create new accounts or real-looking customer data on camera unless you plan to clean it up.

## 90-Second Loom Script

### 0:00-0:10 - Hook

Screen: homepage hero.

> "Hey, I'm David. This is ShopMatch Pro, a deployed SaaS job board demo I built to show full-stack product work beyond a static portfolio page."

### 0:10-0:25 - What It Proves

Screen: system snapshot and sandbox access cards.

> "It covers the real product loop: Firebase auth, seeded employer and seeker accounts, Stripe test-mode billing, job posting, application tracking, analytics, and production monitoring."

### 0:25-0:45 - User-Facing Demo

Screen: `/jobs`.

> "On the public side, job seekers can browse published roles from Firestore. The live API currently returns eleven published jobs, and the page is server-rendered and searchable."

Click one job if the page makes a clean detail transition. Otherwise stay on the listing.

### 0:45-1:05 - SaaS/Admin Proof

Screen: login or dashboard after using the seeded employer account.

> "On the employer side, access is role-based. Paid features are guarded by Firebase custom claims and server-side checks, while Stripe webhooks keep subscription state in sync."

If not already logged in, show the homepage demo credentials instead of logging in live.

### 1:05-1:20 - Engineering Proof

Screen: GitHub Actions or README.

> "The repo has the production hygiene I expect on client work: strict TypeScript, ESLint, unit tests, Playwright smoke and accessibility checks, Firestore rules tests, Snyk, CodeQL, and production smoke tests against the live domain."

### 1:20-1:30 - Close

Screen: live site or GitHub repo.

> "It's intentionally in test mode, but the architecture maps directly to real SaaS builds. If you need a secure, demo-ready product workflow like this, I can build and harden it end to end."

## 4-5 Minute Technical Walkthrough

### 0:00-0:30 - Intro

> "ShopMatch Pro is a deployed SaaS job board demo built with Next.js, Firebase, Stripe, and Vercel. I use it as proof that I can build the full product surface: auth, billing, data access, dashboards, CI, monitoring, and documentation."

### 0:30-1:15 - Public Product Surface

Show homepage, then `/jobs`.

Key points:
- Test-mode banner and seeded accounts are visible.
- Published jobs are fetched from Firestore through the app layer.
- The `/jobs` route is live and production smoke-tested.

### 1:15-2:00 - Auth And Roles

Show login and seeded accounts.

Key points:
- Firebase Auth supports email/password and Google OAuth.
- Roles are represented as owner/seeker.
- Server routes verify tokens before privileged actions.
- Firestore rules backstop access at the database layer.

### 2:00-2:45 - Billing And Entitlements

Show subscribe page or Stripe checkout test path.

Key points:
- Stripe Checkout handles payment form security.
- Webhooks verify Stripe signatures before updating entitlement state.
- The app is test mode only; no real transactions are processed.

### 2:45-3:30 - Dashboard And Analytics

Show dashboard or `/dashboard/analytics`.

Key points:
- Owners can manage applications and export data.
- The analytics view is config-driven and suited to client demos.
- Rate limiting exists on application submission and CSV export paths.

### 3:30-4:30 - Engineering Proof

Show GitHub Actions, `docs/SECURITY.md`, and/or README.

Key points:
- Current head is green in CI, CodeQL, and Snyk.
- Production smoke tests run against `shopmatch.highencodelearning.com`.
- Dependabot has zero open alerts.
- Production audit is clean; remaining full-audit advisories are dev-only Firebase Tools/OpenTelemetry and documented.
- The GitLab mirror workflow is green but intentionally skips until the `GITLAB_MIRROR_TOKEN` secret is added.

### 4:30-5:00 - Close

> "This is the kind of build I want prospects to judge me by: not just a polished UI, but a working product with auth, billing, data security, CI, monitoring, and honest documentation around what is live versus what is test-mode."

## Exact Recording Flow

Use this if you want the least risky one-take recording:

1. Start at `https://shopmatch.highencodelearning.com`.
2. Point at the "DEMO" banner and say it is test mode.
3. Point at seeded accounts, but do not read the password slowly unless needed.
4. Click "Browse demo jobs".
5. Scroll the jobs list.
6. Open GitHub Actions for the latest `main` run and point at green CI/CodeQL/Mirror.
7. Open `docs/SECURITY.md` or README if you want to show the audit posture.
8. End back on the live site.

## Post-Recording Checklist

- Add the Loom link to `docs/LINKEDIN_POST_DRAFT.md` before posting.
- Use the phrase "test-mode SaaS demo" in the caption.
- If you showed the Stripe checkout page, make sure no personal email or cardholder name is visible.
- If you created or edited demo data during recording, reseed or clean it up before sharing widely.
