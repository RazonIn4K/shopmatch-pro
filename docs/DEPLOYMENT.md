# Deployment (Vercel + Stripe)

## Environment
- Vercel envs: `NEXT_PUBLIC_*`, Firebase admin, Stripe keys
- Protect Node runtime routes for Stripe webhook
- Set `NEXT_PUBLIC_APP_URL`

## Stripe Webhook Checklist
1. `stripe listen --forward-to <APP_URL>/api/stripe/webhook`
2. Confirm raw body verification (`constructEvent`)
3. Trigger events: `checkout.session.completed`, verify Firestore updates
4. Rotate webhook secret on production cutover

## Post-Deploy
- Hit `/api/health`
- Test owner flow end-to-end (create job, subscribe, portal)
- Review logs/dashboards
