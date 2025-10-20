# Environment Variables Reference

Complete guide to configuring environment variables for ShopMatch Pro across all environments.

## Table of Contents

- [Overview](#overview)
- [Environment Files](#environment-files)
- [Firebase Configuration](#firebase-configuration)
- [Stripe Configuration](#stripe-configuration)
- [Validation](#validation)
- [Troubleshooting](#troubleshooting)
- [Security Best Practices](#security-best-practices)

## Overview

ShopMatch Pro requires environment variables for three core integrations:

1. **Firebase** (Authentication, Firestore, Storage)
2. **Stripe** (Subscription payments, webhooks)
3. **Application** (URL configuration for OAuth redirects)

### Variable Prefixes

- **`NEXT_PUBLIC_*`** — Exposed to browser (client-side code). Only use for non-sensitive data.
- **No prefix** — Server-side only. Never exposed to browser. Used for secrets.

### Environment Types

| Environment | File | Purpose | Validation |
|------------|------|---------|------------|
| **Local Development** | `.env.local` | Real Firebase/Stripe credentials for dev | `npm run validate-env` |
| **CI/Testing** | `.env.test` | Mock credentials for automated tests | Automatic in CI |
| **Production** | Platform env vars | Real production credentials | Deploy-time |

## Environment Files

### .env.local (Local Development)

**Location**: Root directory (NOT committed to git)

**Setup**:
```bash
cp .env.local.template .env.local
# Edit .env.local with your real credentials
npm run validate-env  # Verify configuration
```

**Contents**: All variables listed in `.env.local.template` with real values from Firebase Console and Stripe Dashboard.

### .env.test (Testing)

**Location**: Root directory (NOT committed to git)

**Setup**:
```bash
cp .env.test.example .env.test
# Use as-is for mock testing, or customize for real Firebase test project
```

**Contents**: Mock credentials for CI and local E2E testing. See [.env.test.example](../.env.test.example).

### .env.local.template (Template)

**Location**: Root directory (committed to git)

**Purpose**: Blueprint for required variables. Copy this to create your `.env.local`.

**Never contains real values** — only placeholder text.

## Firebase Configuration

Firebase requires two separate configurations: **Client SDK** (browser) and **Admin SDK** (server).

### Client SDK Variables (NEXT_PUBLIC_*)

These are exposed to the browser and configure the Firebase JavaScript SDK used in React components.

#### How to Get These Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. Select your web app (or create one if none exists)
6. Copy values from the **Firebase SDK snippet**

#### Required Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyD...` | Firebase API key for client SDK |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `my-project.firebaseapp.com` | Auth domain for OAuth redirects |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `my-project-id` | Firebase project identifier |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `my-project.appspot.com` | Cloud Storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789` | FCM sender ID (numeric) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:123456789:web:abc123` | Firebase app identifier |

**Important**: The API key is not a secret — it's intended for browser use and restricted by Firebase security rules.

### Admin SDK Variables (Server-side)

These are used by the Firebase Admin SDK for server-side operations (API routes, webhooks).

#### How to Get These Values

**Method 1: Service Account Key (Recommended)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Project Settings** → **Service Accounts**
3. Click **Generate New Private Key**
4. Download JSON file
5. Extract values from JSON:
   - `project_id` → `FIREBASE_PROJECT_ID`
   - `client_email` → `FIREBASE_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_PRIVATE_KEY` (keep `\n` escapes intact)

**Method 2: Application Default Credentials (NOT Recommended)**

Uses `gcloud` CLI authentication. Not portable across environments. See [src/lib/firebase/admin.ts](../src/lib/firebase/admin.ts) for why we don't use this.

#### Required Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `FIREBASE_PROJECT_ID` | `my-project-id` | Must match Client SDK project ID |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-xxxxx@my-project.iam.gserviceaccount.com` | Service account email |
| `FIREBASE_PRIVATE_KEY` | `"-----BEGIN PRIVATE KEY-----\n..."` | Private key with escaped newlines |

**Critical**: The private key must include `\n` characters for newlines. It should look like:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQ...\n-----END PRIVATE KEY-----\n"
```

### Firebase Security Configuration

#### Firestore Security Rules

**Location**: [firestore.rules](../firestore.rules)

**Deployment**:
```bash
firebase deploy --only firestore:rules
```

**Testing**:
```bash
firebase emulators:start --only firestore
# Test rules in Firestore Emulator UI at http://localhost:4000
```

#### Firebase Emulators (Optional)

For fully local testing without cloud services:

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize emulators
firebase init emulators

# Start emulators
firebase emulators:start

# In .env.test or .env.local, add:
FIRESTORE_EMULATOR_HOST=localhost:8080
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
```

## Stripe Configuration

Stripe integration requires API keys and webhook secrets for subscription management.

### How to Get Stripe Values

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Switch to **Test mode** (toggle in top right)
3. Navigate to **Developers** → **API keys**
4. Copy **Secret key** (starts with `sk_test_`)

### Required Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `STRIPE_SECRET_KEY` | `sk_test_51Abc...` | Stripe API secret key (server-side) |
| `STRIPE_WEBHOOK_SECRET` | `whsec_abc123...` | Webhook signing secret for verification |
| `STRIPE_PRICE_ID_PRO` | `price_1Abc...` | Price ID for Pro subscription tier |

### Getting Webhook Secret

#### Local Development (with ngrok)

1. **Start ngrok**:
   ```bash
   ngrok http 3000
   ```

2. **Create webhook endpoint**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/) → **Developers** → **Webhooks**
   - Click **Add endpoint**
   - URL: `https://YOUR-NGROK-ID.ngrok-free.app/api/stripe/webhook`
   - Events to send:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Click **Add endpoint**

3. **Copy signing secret**:
   - Click on your new endpoint
   - Reveal **Signing secret** (starts with `whsec_`)
   - Copy to `STRIPE_WEBHOOK_SECRET` in `.env.local`

#### Testing Webhooks

**Stripe CLI** (alternative to ngrok):
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In another terminal, trigger test events
stripe trigger checkout.session.completed
```

### Getting Price ID

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/) → **Products**
2. Click on your Pro subscription product
3. Find the **Pricing** section
4. Copy the **Price ID** (starts with `price_`)
5. Add to `STRIPE_PRICE_ID_PRO` in `.env.local`

**Creating a new price**:
```bash
# Via Stripe Dashboard
Products → Create product → Add pricing → Copy Price ID

# Via Stripe CLI
stripe prices create \
  --product YOUR_PRODUCT_ID \
  --unit-amount 2900 \
  --currency usd \
  --recurring interval=month
```

## Application Configuration

### NEXT_PUBLIC_APP_URL

**Description**: Base URL of your application, used for OAuth redirects and webhook callbacks.

**Values by environment**:
| Environment | Value | Used For |
|------------|-------|----------|
| **Local Development** | `http://localhost:3000` | OAuth redirect URIs |
| **Staging** | `https://staging.example.com` | Webhook callbacks |
| **Production** | `https://shopmatch.pro` | All external integrations |

**Vercel Fallbacks**: If `NEXT_PUBLIC_APP_URL` is not set, the application now derives the base URL from Vercel-provided variables (like `VERCEL_URL`). Set the variable explicitly when you have a canonical domain so metadata and redirects remain stable across preview and production deployments.

**OAuth Configuration**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to **Authentication** → **Settings** → **Authorized domains**
3. Add your domain (e.g., `shopmatch.pro`)
4. For local development, `localhost` is pre-authorized

### NEXT_PUBLIC_SENTRY_DSN (Optional - Monitoring)

**Description**: Sentry Data Source Name (DSN) for error tracking and performance monitoring.

**How to Get**:
1. Create a Sentry account at https://sentry.io/signup/
2. Create a new project (select "Next.js" as the platform)
3. Copy the DSN from Settings → Projects → [Your Project] → Client Keys (DSN)

**Format**: `https://PUBLIC_KEY@o0.ingest.sentry.io/PROJECT_ID`

**Example**: `https://abc123def456@o123456.ingest.sentry.io/7890123`

**Environment-specific values**:
| Environment | Value | Purpose |
|------------|-------|---------|
| **Local Development** | Optional (comment out for local dev) | Avoid noise in Sentry dashboard |
| **Staging** | Use staging project DSN | Test error tracking before production |
| **Production** | Use production project DSN | Real error monitoring |

**Note**: This variable is prefixed with `NEXT_PUBLIC_` because Sentry captures errors from both client and server. The DSN is not a secret - it's safe to expose in browser code.

## Validation

### Automatic Validation Script

Run after any environment variable changes:

```bash
npm run validate-env
```

**What it checks**:
- All required variables are defined
- No empty string values
- Firebase private key format is correct
- Stripe keys have correct prefixes
- No accidental production keys in test environment

**Output**:
```
✅ All required environment variables are configured correctly!
```

**On error**:
```
❌ Missing required environment variable: FIREBASE_PRIVATE_KEY
❌ STRIPE_SECRET_KEY must start with 'sk_test_' or 'sk_live_'
```

### Manual Validation

#### Test Firebase Connection

```bash
npm run create-user  # Attempts to create a test user
# If successful, Firebase Admin SDK is configured correctly
```

#### Test Stripe Connection

```bash
curl http://localhost:3000/api/health
# Returns:
# {
#   "status": "healthy",
#   "timestamp": "2025-10-15T..."
# }
```

#### Test Full Application

```bash
npm run build      # Verify build succeeds
npm start          # Start production server
# Visit http://localhost:3000 and test authentication
```

## Troubleshooting

### Firebase Errors

#### "Firebase: Error (auth/invalid-api-key)"

**Cause**: Invalid `NEXT_PUBLIC_FIREBASE_API_KEY`

**Fix**:
1. Verify you copied the full API key from Firebase Console
2. Check for extra spaces or quotes
3. Ensure you're using the correct project

#### "Error: Credential implementation provided to initializeApp() via the credential property failed to fetch a valid Google OAuth2 access token"

**Cause**: Invalid `FIREBASE_PRIVATE_KEY` format

**Fix**:
1. Ensure private key includes `\n` characters (not literal newlines)
2. Key should start with `"-----BEGIN PRIVATE KEY-----\n`
3. Key should end with `\n-----END PRIVATE KEY-----\n"`
4. Entire key should be wrapped in double quotes

**Example (correct)**:
```bash
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQ...\n-----END PRIVATE KEY-----\n"
```

**Example (incorrect)**:
```bash
# Missing quotes
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...

# Missing \n escapes
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQ...
-----END PRIVATE KEY-----"
```

#### "Firebase Admin SDK not initialized"

**Cause**: Missing service account variables OR CI fallback mode active

**Debug**:
```typescript
// Check src/lib/firebase/admin.ts logs
console.log('Firebase Admin SDK initialization:', {
  hasServiceAccount: Boolean(process.env.FIREBASE_PRIVATE_KEY),
  hasEmail: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
  projectId: process.env.FIREBASE_PROJECT_ID
})
```

**Fix**:
1. Ensure `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` are all set
2. If in CI, fallback mode is intentional (mock credentials)
3. For local dev, download a new service account key from Firebase Console

### Stripe Errors

#### "No signatures found matching the expected signature for payload"

**Cause**: Webhook signature verification failed

**Reasons**:
1. Wrong `STRIPE_WEBHOOK_SECRET` (using test secret with live keys, or vice versa)
2. Request body was modified before reaching webhook handler
3. Using Edge Runtime instead of Node.js runtime for webhook route

**Fix**:
1. Verify `STRIPE_WEBHOOK_SECRET` matches the endpoint in Stripe Dashboard
2. Check that webhook route has `export const runtime = 'nodejs'`
3. Ensure no middleware is modifying the raw request body

#### "No such price: price_..."

**Cause**: Invalid `STRIPE_PRICE_ID_PRO`

**Fix**:
1. Go to Stripe Dashboard → Products
2. Verify the Price ID exists in your Stripe account
3. Ensure you're using the correct mode (test vs. live)
4. Update `.env.local` with correct Price ID

#### "Invalid API Key provided"

**Cause**: Wrong `STRIPE_SECRET_KEY` or key expired

**Fix**:
1. Go to Stripe Dashboard → Developers → API keys
2. Verify you're using the correct mode (test vs. live)
3. Copy the **Secret key** (starts with `sk_test_` or `sk_live_`)
4. If key was rotated, generate a new one

### Build Errors

#### "Error: Missing required environment variables"

**Cause**: Variables not set at build time

**Fix (Vercel)**:
1. Go to project settings → Environment Variables
2. Add all required variables for Production, Preview, Development
3. Redeploy

**Fix (Local)**:
```bash
# Ensure .env.local exists
ls -la .env.local

# Verify contents
npm run validate-env
```

#### "Failed to compile: Cannot find module '@/lib/firebase/client'"

**Cause**: TypeScript path alias misconfiguration (NOT env vars)

**Fix**:
1. Check [tsconfig.json](../tsconfig.json) has `"@/*": ["./src/*"]`
2. Restart TypeScript server in IDE
3. Run `npm run build` to verify

## Secret Rotation Schedule

**Naming Convention**: All GitHub secrets use `UPPER_SNAKE_CASE` for consistency with industry standards.

**Least-Privilege Service Accounts**: CI uses a dedicated Firebase service account with ONLY:
- `Firebase Authentication Admin`
- `Cloud Datastore User`

Do NOT grant Owner, Editor, or excessive permissions to CI service accounts.

### Rotation Cadence

| Secret | Rotation Period | Trigger Event | Process |
|--------|----------------|---------------|---------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | **90 days** | Key compromise, team change | Generate new key → Update GitHub/Vercel secrets → Revoke old key (7-day grace period) |
| `STRIPE_SECRET_KEY` | **On compromise** | Key exposed, unauthorized access | Rotate in Stripe Dashboard → Update all environments → Monitor webhook failures |
| `VERCEL_TOKEN` | **180 days** | API changes, security audit | Regenerate in Vercel Account Settings → Update GitHub secret |
| `STRIPE_WEBHOOK_SECRET` | **On endpoint change** | New webhook URL, ngrok rotation | Create new endpoint → Update secret → Delete old endpoint |

### Rotation Procedure

**For Firebase Service Account**:
```bash
# 1. Create new service account (or generate new key for existing)
# Firebase Console → Settings → Service Accounts → Generate new private key

# 2. Update GitHub secrets
# Settings → Secrets → FIREBASE_SERVICE_ACCOUNT_JSON → Update

# 3. Update production environment (Vercel/Netlify)
# Project Settings → Environment Variables → Edit

# 4. Trigger redeploy to use new credentials
vercel --prod

# 5. Monitor logs for 24 hours
# Check Vercel logs or Sentry for auth errors

# 6. Revoke old key after grace period (7 days)
# Google Cloud Console → IAM & Admin → Service accounts → Keys → Delete
```

**For Stripe Keys**:
```bash
# 1. Roll key in Stripe Dashboard
# Developers → API keys → Roll secret key → Confirm

# 2. Update all environments immediately (Stripe provides 24hr grace period)
# GitHub: Settings → Secrets → STRIPE_SECRET_KEY
# Vercel: Project Settings → Environment Variables

# 3. Verify webhooks still work
stripe listen --forward-to https://your-domain.com/api/stripe/webhook

# 4. Old key auto-expires after 24 hours (Stripe handles this)
```

### Post-Rotation Verification

After rotating any secret, run this checklist:

- [ ] `npm run validate-env` passes locally
- [ ] CI build succeeds on main branch
- [ ] Production deployment completes without errors
- [ ] Health check returns 200: `curl https://your-domain.com/api/health`
- [ ] Test authentication flow (signup, login)
- [ ] Test Stripe webhook (create test subscription)
- [ ] Monitor error logs for 24 hours
- [ ] Document rotation in `docs/INCIDENT_RESPONSE.md` (if triggered by incident)

## Security Best Practices

### DO ✅

1. **Use `.env.local` for secrets** — Never commit to git
2. **Rotate keys on schedule** — See rotation cadence table above
3. **Use test mode in development** — Stripe test keys start with `sk_test_`
4. **Validate environment on startup** — Run `npm run validate-env`
5. **Use different Firebase projects** — Separate dev/staging/production
6. **Restrict Firebase API keys** — Use Application restrictions in Firebase Console
7. **Enable Stripe webhook signature verification** — Always verify `stripe-signature` header
8. **Use environment-specific webhook endpoints** — Different URLs for dev/staging/production
9. **Use least-privilege service accounts** — Grant only required permissions (Auth + Firestore, NOT Owner)
10. **Document rotation events** — Track when and why keys were rotated

### DON'T ❌

1. **Never commit `.env.local`** — Add to `.gitignore` (already done)
2. **Never commit service account JSON** — Extract values to env vars instead
3. **Never use production keys in development** — Always use test keys locally
4. **Never disable webhook signature verification** — Required for security
5. **Never expose server-side env vars to client** — Only use `NEXT_PUBLIC_*` for client code
6. **Never share API keys via Slack/email** — Use secure password managers
7. **Never log secrets** — Sanitize logs before sending to monitoring services

### .gitignore Protections

The following files are already ignored and should NEVER be committed:

```gitignore
# Environment files
.env.local
.env.test
.env.test.local
.env*.local

# Service account keys
serviceAccountKey.json
*-firebase-adminsdk-*.json
```

### Key Rotation Procedure

When rotating sensitive credentials:

1. **Generate new key** in Firebase Console or Stripe Dashboard
2. **Update `.env.local`** with new value
3. **Verify locally**: `npm run validate-env && npm run build`
4. **Update production environment variables** (Vercel, Netlify, etc.)
5. **Deploy application** with new credentials
6. **Monitor for errors** in production logs
7. **Revoke old key** after confirming new key works
8. **Update team password manager** with new values

### Incident Response

If credentials are accidentally committed:

1. **Immediately rotate ALL affected keys** (Firebase, Stripe)
2. **Rewrite git history** to remove secrets:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   git push origin --force --all
   ```
3. **Notify team** via [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md)
4. **Review access logs** for unauthorized usage
5. **Update [SECURITY.md](./SECURITY.md)** with lessons learned

## Reference

### Complete Variable List

For the authoritative list of all required and optional variables, see:
- [.env.local.template](../.env.local.template) — Local development
- [.env.test.example](../.env.test.example) — Testing environment
- [scripts/validate-env.js](../scripts/validate-env.js) — Validation logic

### Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — How integrations work together
- [SECURITY.md](./SECURITY.md) — Security policies and procedures
- [CLAUDE.md](../CLAUDE.md) — Development workflow and commands
- [Firebase Admin SDK Setup](https://firebase.google.com/docs/admin/setup)
- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
