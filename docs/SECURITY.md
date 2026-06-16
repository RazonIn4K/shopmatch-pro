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

## Dependency Backlog (last triaged: 2026-06-15)

Status after the 2026-06-15 dependency sweep (`npm audit`: 11 moderate, 0 high, 0 critical):

**Fixed**
- `next` 15.5.19 — cleared all App Router/middleware advisories (`<=15.5.16` range)
- `fast-uri`, `fast-xml-builder`, `protobufjs`, `ws` — transitive bumps via the earlier June sweep
- `js-yaml`, `joi`, `form-data`, Babel packages, and Google client transitive packages — refreshed via `npm audit fix`
- Sentry/OpenTelemetry runtime path: `@opentelemetry/core`, `@opentelemetry/resources`, and `@opentelemetry/sdk-trace-base` 2.7.1 -> 2.8.0
- `actions/upload-artifact` v4 → v7 — Node 24 Actions runtime cutover (2026-06-16)

**Tracked residuals**
- `firebase-admin` -> `@google-cloud/storage` -> `retry-request` / `teeny-request` -> `uuid`
  - Current npm remediation suggests downgrading `firebase-admin` to 10.3.0, which would move the app off the current Admin SDK line and is not an acceptable production fix.
  - `firebase-admin` 14.0.0 was tested on 2026-06-15 and reverted because Vercel serverless runtime loading failed through the `firebase-admin/auth` -> `jwks-rsa` -> ESM-only `jose` chain.
  - ShopMatch server code imports Admin App/Auth/Firestore only; Admin Storage is not used by the current runtime paths.
- `firebase-admin` -> `@google-cloud/firestore` -> `google-gax` -> `uuid`
  - This is the remaining Firestore-side chain while staying on the Vercel-compatible 13.10.x Admin SDK line.
- `firebase-tools` -> `gaxios` -> `uuid`
  - Current npm remediation suggests downgrading `firebase-tools` to 13.13.3. The local CLI is intentionally kept current because rules testing and emulator commands depend on it.
  - `firebase-tools` is a development dependency and is not part of the Vercel runtime bundle.
- `firebase-tools` -> `@google-cloud/pubsub` -> `@opentelemetry/core`
  - The app runtime OpenTelemetry path was patched to 2.8.0.
  - The remaining vulnerable OpenTelemetry instance is nested under Firebase Tools' Pub/Sub dependency, so the current npm remediation again requires downgrading `firebase-tools` to 13.13.3.

**Next action**
- Keep Dependabot/Snyk enabled and take the upstream Firebase/Google client updates when they resolve these chains without SDK downgrades.
- Do not add broad `uuid` overrides for Firebase internals; a previous override was removed because it affected Firebase Admin runtime compatibility.

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
