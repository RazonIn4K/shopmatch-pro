# ShopMatch Pro - Loom Recording Packet

**Recommended recording:** 90 seconds for LinkedIn/profile proof, 4-5 minutes for a deeper portfolio walkthrough.

**Live site:** https://shopmatch.highencodelearning.com
**Repo:** https://github.com/RazonIn4K/shopmatch-pro
**Last verified:** 2026-06-16

## What This Recording Proves

- You can ship a real deployed SaaS surface, not just a static mockup.
- You can connect the full product loop: public listing pages, Firebase Auth, role-based dashboards, Firestore data, Stripe test-mode billing, and CI checks.
- You can debug production issues: this build has verified fixes for auth redirect timing, Firestore application indexes, defensive missing-index reads, and legacy application rows that previously rendered incomplete snapshot data.
- You know how to set honest boundaries: the app is test mode, seeded data is labeled, and security claims distinguish production runtime posture from dev-only advisories.

## Pre-Recording Checklist

- Open `https://shopmatch.highencodelearning.com` in a clean browser tab.
- Open `https://shopmatch.highencodelearning.com/jobs` in a second tab.
- Accept or decline the cookie banner before recording so it does not cover the demo surface.
- If the cookie notice appears during a dry run, it is now a compact bottom-right panel on desktop; still clear it before the real take.
- On `/jobs`, show the top several polished roles. Do not linger on the older lower-page seed rows named "Demo job" or "Test Developer Position"; they are QA data, not the strongest portfolio surface.
- If you show auth, use `/login` and `/signup` after the refreshed light palette deploy is live; the cards should use a warm off-white page background, white form surfaces, and teal primary actions.
- After signing in, wait 2-3 seconds for the success toast to clear before you start explaining the dashboard.
- The browser tab, app icon, and social preview should use the refreshed briefcase/search mark; if they do not, hard-refresh once before recording.
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
- "The seeded employer and seeker accounts both reach their role-specific dashboards in the verified production build."
- "GitHub Dependabot has zero open alerts, and the production dependency audit is clean."
- "The full audit still tracks three dev-only Firebase Tools/OpenTelemetry moderate advisories, documented in `docs/SECURITY.md`; they are not in the Vercel runtime bundle."
- "Latest CI is green for build, typecheck, unit tests, Firestore rules, local smoke, production smoke, accessibility, Snyk, and CodeQL."
- "GitLab is configured as a secondary security-scanning mirror. The local GitLab remote is manually synced to the latest reviewed commit; automatic GitHub-to-GitLab mirroring still needs the `GITLAB_MIRROR_TOKEN` repository secret."
- "The deployed public pages and auth pages were browser-checked at desktop and mobile widths with no horizontal overflow; the authenticated dashboard checks pass in the production build."
- "The demo has a refreshed favicon, app icon, web manifest, and social preview card that match the current ShopMatch palette."
- "Legacy application rows degrade cleanly in the dashboard instead of exposing incomplete Firestore snapshot fields."
- "This is a portfolio demo in test mode, not a live hiring marketplace."

Avoid these claims:

- Do not say "zero vulnerabilities" without qualifying it as production/deployed dependencies.
- Do not imply real payments are processed. Stripe is test mode.
- Do not say GitHub Actions is automatically mirroring to GitLab until `GITLAB_MIRROR_TOKEN` is configured.
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

> "On the employer side, access is role-based. The auth pages are part of the polished product surface, and paid features are guarded by Firebase custom claims and server-side checks while Stripe webhooks keep subscription state in sync."

The current verified path is `owner@test.com` -> `/dashboard/owner` and `seeker@test.com` -> `/dashboard/seeker`. If Firebase is slow during the recording, show the homepage demo credentials and the already-open dashboard tab instead of repeating sign-in attempts.

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
- Firestore composite indexes are tracked in `firestore.indexes.json`; the app also handles missing-index reads defensively so the portfolio dashboard does not fail closed during a demo.

### 3:30-4:30 - Engineering Proof

Show GitHub Actions, `docs/SECURITY.md`, and/or README.

Key points:
- Current head is green in CI, CodeQL, and Snyk.
- Production smoke tests run against `shopmatch.highencodelearning.com`.
- Dependabot has zero open alerts.
- Production audit is clean; remaining full-audit advisories are dev-only Firebase Tools/OpenTelemetry and documented.
- GitLab `main` is manually synced to the latest reviewed commit; automatic mirroring now fails loudly until the `GITLAB_MIRROR_TOKEN` secret is added.

### 4:30-5:00 - Close

> "This is the kind of build I want prospects to judge me by: not just a polished UI, but a working product with auth, billing, data security, CI, monitoring, and honest documentation around what is live versus what is test-mode."

## Exact Recording Flow

Use this if you want the least risky one-take recording:

1. Start at `https://shopmatch.highencodelearning.com`.
2. Clear the cookie banner before starting, or do it immediately and briefly on camera.
3. Point at the "DEMO" banner and say it is test mode.
4. Point at seeded accounts, but do not read the password slowly unless needed.
5. Click "Browse demo jobs".
6. Scroll only through the first several polished job cards.
7. Open `/login`, sign in as `owner@test.com`, wait for the success toast to disappear, and show `/dashboard/owner` only if you want the authenticated proof point.
8. If you want a second authenticated proof point, sign out or use a clean tab and show `seeker@test.com` reaching `/dashboard/seeker`.
9. Open GitHub Actions for the latest `main` run and point at green CI/CodeQL/Mirror.
10. Open `docs/SECURITY.md` or README if you want to show the audit posture.
11. End back on the live site.

## Post-Recording Checklist

- Add the Loom link to `docs/LINKEDIN_POST_DRAFT.md` before posting.
- Use the phrase "test-mode SaaS demo" in the caption.
- If you showed the Stripe checkout page, make sure no personal email or cardholder name is visible.
- If you created or edited demo data during recording, reseed or clean it up before sharing widely.
