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

## Dependency Backlog (last triaged: 2026-06-16)

Status after the 2026-06-16 dependency sweep:
- `npm audit --omit=dev`: 0 low, 0 moderate, 0 high, 0 critical
- `npm audit`: 3 moderate, 0 high, 0 critical

**Fixed**
- `next` 16.2.9 — clears the current Snyk-reported production advisories; 16.1.7 was rejected locally because `npm audit --omit=dev` still reported production Next.js advisories.
- `fast-uri`, `fast-xml-builder`, `protobufjs`, `ws` — transitive bumps via the earlier June sweep
- `js-yaml`, `joi`, `form-data`, Babel packages, and Google client transitive packages — refreshed via `npm audit fix`
- Sentry/OpenTelemetry runtime path: `@opentelemetry/core`, `@opentelemetry/resources`, and `@opentelemetry/sdk-trace-base` 2.7.1 -> 2.8.0
- `uuid` GHSA-w5hq-g745-h8pq / CVE-2026-41907 — pinned transitive Firebase/Google client copies to patched `uuid` 11.1.1 through the npm `overrides` block
- `actions/upload-artifact` v4 → v7 — Node 24 Actions runtime cutover (2026-06-16)

**Tracked residuals**
- `firebase-tools` -> `@google-cloud/pubsub` -> `@opentelemetry/core`
  - The app runtime OpenTelemetry path was patched to 2.8.0.
  - The remaining vulnerable OpenTelemetry instance is nested under Firebase Tools' Pub/Sub dependency, so the current npm remediation requires downgrading `firebase-tools` to 14.23.0.
  - `firebase-tools` is a development dependency and is not part of the Vercel runtime bundle.
  - Do not force an `@opentelemetry/core` 2.x override into `@google-cloud/pubsub` unless emulator and deploy commands are retested; Pub/Sub currently declares the 1.x OpenTelemetry line.

**Compatibility notes**
- `firebase-admin` 14.0.0 was tested on 2026-06-15 and reverted because Vercel serverless runtime loading failed through the `firebase-admin/auth` -> `jwks-rsa` -> ESM-only `jose` chain.
- Keep `firebase-admin` on the Vercel-compatible 13.10.x line until a 14.x upgrade path is verified in production.
- The `uuid` override was validated with Admin/Auth/Firestore, Google client package imports, local build, unit tests, and Firestore rules tests.

**Next action**
- Keep Dependabot/Snyk enabled and take the upstream Firebase/Google client updates when they resolve these chains without SDK downgrades.
- Recheck the Firebase Tools OpenTelemetry path when a patched Firebase CLI release is available that does not require a downgrade.

**Superseded (safe to close/delete)**
- Dependabot PRs #172, #173, #177, #185, #189 — covered by the bumps above
- Branch `vercel/react-flightnextjs-rce-vulnera-o5t81m` — stale; pins next 15.5.7,
  a downgrade from main. Delete without merging.

**Deferred (routine, non-security; leave to Dependabot cadence)**
- #182 production-dependencies group, #168 development-tools group,
  #170 @types/node, #183 axios (dev-transitive)

**FOSSA compliance status**
- The 2026-06-16 post-remediation verification snapshot recorded zero active
  FOSSA licensing, security, and quality issues.
- The 18 reviewed license findings and 36 reviewed quality findings are
  documented in `docs/FOSSA_LICENSE_REVIEW_2026-06-16.md`; the guarded
  `FOSSA Reviewed Issue Remediation` workflow applied the reviewed ignore
  rules through the repository `FOSSA_API_KEY` secret.
- `fossa test --diff e0ff828281cc9fe8ba377315526e7e6d01869a06` is the hard CI
  regression gate for new or unreviewed FOSSA findings.
