# Runbook — Stripe Webhook

## Symptoms
- Portal/checkout works, but subscription not reflected in app
- Webhook returns 400 / signature verification failures

## Quick Fix (Checklist)
1. Ensure Node runtime + raw body in route handler
2. Validate `STRIPE_WEBHOOK_SECRET` set on server env
3. `stripe listen --forward-to <APP_URL>/api/stripe/webhook` (dev)
4. Inspect event types; ensure handler updates Firestore correctly
5. Rotate secret if suspected leak; retry delivery in dashboard

## Verification
- Trigger `checkout.session.completed`
- Confirm Firestore subscription field updated and UI shows active sub
