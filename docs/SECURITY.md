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
