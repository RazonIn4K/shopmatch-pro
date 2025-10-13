# Quick Start Guide - ShopMatch Pro

**Get ShopMatch Pro running in 5 minutes**

This guide walks you through the minimum steps to get the application running locally for testing and development.

---

## Prerequisites (2 minutes)

Before you begin, ensure you have:

- [x] **Node.js 18+** installed ([download here](https://nodejs.org/))
- [x] **npm** or **yarn** package manager
- [x] **Git** for cloning the repository
- [x] **Firebase account** (free tier works) - [console.firebase.google.com](https://console.firebase.google.com)
- [x] **Stripe account** (test mode) - [dashboard.stripe.com](https://dashboard.stripe.com)

**Verify your setup**:
```bash
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

---

## Step 1: Clone and Install (1 minute)

```bash
# Clone the repository
git clone https://github.com/RazonIn4K/shopmatch-pro.git
cd shopmatch-pro

# Install dependencies
npm install

# Expected output: "added XXX packages" with no errors
```

---

## Step 2: Configure Firebase (2 minutes)

### 2.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **"Add project"**
3. Name: `shopmatch-pro-dev` (or your preferred name)
4. Disable Google Analytics (optional for testing)
5. Click **"Create project"**

### 2.2 Enable Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Click **"Sign-in method"** tab
3. Enable **"Email/Password"**
4. Enable **"Google"** (optional but recommended)

### 2.3 Create Firestore Database

1. In Firebase Console → **Firestore Database** → **Create database**
2. Choose **"Start in test mode"** (we'll add security rules later)
3. Select a location (choose closest to you)
4. Click **"Enable"**

### 2.4 Get Firebase Configuration

**For Client-Side (Public Config)**:
1. Go to **Project Settings** (gear icon) → **General** tab
2. Scroll to "Your apps" → Click **"Web"** icon `</>`
3. Register app name: `ShopMatch Pro`
4. Copy the config object values

**For Server-Side (Service Account)**:
1. Go to **Project Settings** → **Service accounts** tab
2. Click **"Generate new private key"**
3. Save the JSON file (we'll use these values in `.env.local`)

---

## Step 3: Configure Stripe (1 minute)

### 3.1 Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Make sure you're in **"Test mode"** (toggle in top right)
3. Copy your **"Secret key"** (starts with `sk_test_...`)

### 3.2 Create a Product and Price

1. Go to **Products** → **Add product**
2. Name: `ShopMatch Pro Subscription`
3. Description: `Monthly subscription to ShopMatch Pro`
4. Pricing model: **Recurring**
5. Price: `$29.99` (or your preferred amount)
6. Billing period: **Monthly**
7. Click **"Save product"**
8. Copy the **Price ID** (starts with `price_...`)

### 3.3 Get Webhook Secret (For Local Testing)

**Option A: Using Stripe CLI** (Recommended):
```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret (whsec_...) from the output
```

**Option B: Use a placeholder** (webhook won't work, but app will run):
```bash
# Use this temporary value in .env.local:
# STRIPE_WEBHOOK_SECRET=whsec_placeholder_for_testing
```

---

## Step 4: Create Environment File (1 minute)

```bash
# Copy the example file
cp .env.local.example .env.local

# Open .env.local in your editor
# (VS Code, nano, vim, etc.)
```

**Fill in the values** (use the config from Steps 2-3):

```bash
# ===== Firebase Client-Side (Public) =====
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# ===== Firebase Admin (Server-Side, from service account JSON) =====
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"

# ===== Stripe (Test Mode) =====
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRICE_ID_PRO=price_your_price_id

# ===== App Configuration =====
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**⚠️ Important**:
- The private key must have `\n` (not actual newlines)
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- All values are case-sensitive

---

## Step 5: Validate Configuration (30 seconds)

```bash
# Run the environment validation script
npm run validate-env

# Expected output: All checks passing ✅
```

**If validation fails**:
- Check for typos in environment variable names
- Ensure private key has escaped newlines (`\n`)
- Verify Stripe keys are from **test mode**

---

## Step 6: Start Development Server (30 seconds)

```bash
# Start the Next.js development server
npm run dev

# Expected output:
# ✓ Ready in 2.3s
# ○ Local: http://localhost:3000
```

**Open your browser**: http://localhost:3000

You should see the ShopMatch Pro homepage! 🎉

---

## Quick Smoke Test (30 seconds)

Verify all systems are operational:

```bash
# Test 1: Health check (all services should return true)
curl http://localhost:3000/api/health

# Expected: {"status":"ok","checks":{"firebase":true,"stripe":true,"environment":true}}

# Test 2: Stripe webhook endpoint
curl http://localhost:3000/api/stripe/webhook

# Expected: {"message":"Stripe webhook endpoint ready",...}

# Test 3: Stripe checkout endpoint
curl http://localhost:3000/api/stripe/checkout

# Expected: {"message":"Stripe checkout endpoint ready",...}
```

**All returning JSON?** ✅ Your setup is complete!

---

## Next Steps

### Test the Authentication Flow

1. Click **"Sign Up"** in the navigation
2. Create an account with email/password or Google
3. Choose a role: **Owner** or **Seeker**
4. You're logged in! 🎉

### Test the Subscription Flow

1. Navigate to **"/subscribe"** page
2. Click **"Subscribe Now"** (uses Stripe test mode)
3. Use test card: `4242 4242 4242 4242`
4. Any future date, any CVC, any ZIP
5. Complete checkout → You're subscribed!

### Test Stripe Webhooks (Advanced)

If you installed Stripe CLI:

```bash
# Terminal 1: Keep your dev server running
npm run dev

# Terminal 2: Start Stripe CLI listener
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Terminal 3: Trigger a test event
stripe trigger checkout.session.completed

# Check Terminal 1: You should see webhook logs
```

---

## Troubleshooting

### Error: "Firebase initialization failed"

**Cause**: Missing or incorrect Firebase environment variables

**Fix**:
1. Check that `FIREBASE_PRIVATE_KEY` has escaped newlines (`\n`)
2. Verify `FIREBASE_CLIENT_EMAIL` matches your service account
3. Run `npm run validate-env` to identify the issue

### Error: "Stripe webhook signature verification failed"

**Cause**: Incorrect `STRIPE_WEBHOOK_SECRET`

**Fix**:
- If using Stripe CLI: Copy the secret from `stripe listen` output
- If testing without webhooks: Use placeholder `whsec_placeholder`
- **Note**: Webhooks won't work with placeholder, but app will run

### Error: "Port 3000 already in use"

**Cause**: Another process is using port 3000

**Fix**:
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Error: "Module not found" or "Cannot find package"

**Cause**: Dependencies not installed or corrupted

**Fix**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production (verify before deploying)
npm run build

# Start production server (after build)
npm start

# Run linter (check code quality)
npm run lint

# Validate environment variables
npm run validate-env

# Create a test user (requires valid .env.local)
npm run create-user
```

---

## Project Structure Overview

```
shopmatch-pro/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   ├── api/               # API routes (Stripe, health)
│   │   ├── subscribe/         # Subscription page
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                   # Shared utilities
│   │   ├── firebase/         # Firebase client & admin
│   │   ├── stripe/           # Stripe configuration
│   │   └── contexts/         # React contexts (Auth)
│   └── types/                 # TypeScript types
├── public/                    # Static assets
├── .env.local                # Environment variables (you create this)
├── .env.local.example        # Environment template
├── package.json              # Dependencies
└── README.md                 # Main documentation
```

---

## What's Next?

- **For Development**: See [CLAUDE.md](./CLAUDE.md) for architecture details
- **For Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup
- **For Status**: See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for feature completeness

---

## Need Help?

- **Documentation**: Check [README.md](./README.md) for comprehensive guide
- **Architecture**: Read [CLAUDE.md](./CLAUDE.md) for development patterns
- **Firebase Issues**: Review Firebase console error logs
- **Stripe Issues**: Check Stripe dashboard → Developers → Logs

---

**That's it!** You now have ShopMatch Pro running locally. Time to build! 🚀
