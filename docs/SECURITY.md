# Security

## Models
- **Auth:** Firebase Auth (email/password, Google OAuth)
- **Authorization:** Custom claims -> role gates (owner/seeker)
- **Data Security:** Firestore rules least privilege; owner-only filters
- **Payments:** Stripe Checkout; Webhook signature verification (raw body; Node runtime)

## Threat Model (high level)
- Abuse of unauthenticated endpoints (analytics, health) → rate limits + schema validation
- Privilege escalation via client claims → server-side claim verification on APIs
- Webhook spoofing → `stripe.webhooks.constructEvent` + secret rotation policy
- PII leakage in logs → redaction helpers + token counts only for streams

## Controls
- **Rate limiting:** anon/auth/admin tiers
- **Input validation:** zod/schema for all API POST/PATCH
- **Rules testing:** Firebase Emulator tests
- **Secrets:** `.env` + Vercel/Stripe dashboards; no secrets in client bundles

## Reviews
- Pre-merge Security Checklist (see TESTING.md & PR template)
- Quarterly landscape & dependency review (SBOM/license)

## Dependency Backlog (last triaged: 2026-06-09)

Status after the 2026-06 dependency sweep (`npm audit`: 0 vulnerabilities):

**Fixed**
- `next` 15.5.19 — cleared all App Router/middleware advisories (`<=15.5.16` range)
- `fast-uri`, `fast-xml-builder`, `protobufjs`, `ws` — transitive bumps via `npm audit fix`
- `actions/upload-artifact` v4 → v7 — Node 24 Actions runtime cutover (2026-06-16)

**Superseded (safe to close/delete)**
- Dependabot PRs #172, #173, #177, #185, #189 — covered by the bumps above
- Branch `vercel/react-flightnextjs-rce-vulnera-o5t81m` — stale; pins next 15.5.7,
  a downgrade from main. Delete without merging.

**Deferred (routine, non-security; leave to Dependabot cadence)**
- #182 production-dependencies group, #168 development-tools group,
  #170 @types/node, #183 axios (dev-transitive)

**Tracked, advisory-only (FOSSA dashboard)**
- Dependency Quality: deprecated transitive packages (no runtime risk identified)
- License Compliance: 1 finding introduced via the `firebase-tools` dev-dependency
  tree — needs dashboard triage; dev-only, not shipped to clients
