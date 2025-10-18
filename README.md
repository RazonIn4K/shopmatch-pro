# ShopMatch Pro

[![CI](https://github.com/RazonIn4K/shopmatch-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/RazonIn4K/shopmatch-pro/actions/workflows/ci.yml)
[![FOSSA License Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FRazonIn4K%2Fshopmatch-pro.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2FRazonIn4K%2Fshopmatch-pro?ref=badge_shield&issueType=license)
[![FOSSA Security Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FRazonIn4K%2Fshopmatch-pro.svg?type=shield&issueType=security)](https://app.fossa.com/projects/git%2Bgithub.com%2FRazonIn4K%2Fshopmatch-pro?ref=badge_shield&issueType=security)

A modern job board platform built with Next.js 15, Firebase, and Stripe. Connect job seekers with opportunities through a subscription-based model.

## 🎯 Project Status

**✅ MVP COMPLETE - Ready for Testing**

- All core features implemented
- Production build passing
- Dev server running on http://localhost:3000
- Awaiting Firebase and Stripe configuration

📊 [View Detailed Status Report →](./PROJECT_STATUS.md)

## 🚀 Quick Start

**Get started in 5 minutes:**

1. **Configure Environment Variables**
   ```bash
   # Edit .env.local with your Firebase and Stripe credentials
   # See QUICK_START.md for detailed instructions
   ```

2. **Validate Configuration**
   ```bash
   npm run validate-env
   ```

3. **Access the Application**
   ```
   Development server is already running at:
   http://localhost:3000
   ```

📖 [Read Full Quick Start Guide →](./QUICK_START.md)

## ✨ Features

### For Job Seekers
- 🔍 Browse and search job listings
- 📝 Apply to jobs with cover letters
- 📊 Track application status
- 🎯 Personalized dashboard

### For Employers (Subscription Required)
- ✍️ Post unlimited job listings
- 📋 Manage applications
- 📈 View application analytics
- 🎛️ Edit and close job postings

### Platform Features
- 🔐 Secure authentication (Email/Password + Google OAuth)
- 💳 Stripe subscription integration
- 🔄 Real-time updates with Firebase
- 📱 Fully responsive design
- ⚡ Built with Next.js 15 + Turbopack

## 📁 Tech Stack

- **Framework:** Next.js 15.5.4 with App Router and Turbopack
- **Language:** TypeScript (strict mode)
- **Authentication:** Firebase Auth with role-based access control
- **Database:** Cloud Firestore with security rules
- **Payments:** Stripe Checkout and Subscriptions
- **Styling:** Tailwind CSS v4 with shadcn/ui components
- **Forms:** React Hook Form + Zod validation
- **State Management:** React Context API

## 🛠️ Development Commands

```bash
# Start development server (default port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Validate environment variables
npm run validate-env

# Create test users (after env setup)
npm run create-user
```

## 📚 Documentation

### Getting Started

| Document | Description |
|----------|-------------|
| [QUICK_START.md](./QUICK_START.md) | 5-minute setup guide to get testing |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md) | Complete status report with metrics |
| [MVP_IMPLEMENTATION_PLAN.md](./MVP_IMPLEMENTATION_PLAN.md) | Detailed feature breakdown |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide |

### Production Operations

| Document | Description |
|----------|-------------|
| [docs/API_REFERENCE.yml](./docs/API_REFERENCE.yml) | OpenAPI 3.0 specification for all backend endpoints |
| [docs/PRODUCTION_VERIFICATION.md](./docs/PRODUCTION_VERIFICATION.md) | Production deployment verification checklist |
| [docs/STRIPE_WEBHOOK_PRODUCTION_SETUP.md](./docs/STRIPE_WEBHOOK_PRODUCTION_SETUP.md) | Stripe webhook configuration for production |
| [docs/SDK_GENERATION.md](./docs/SDK_GENERATION.md) | API client SDK generation guide |
| [docs/VERIFICATION_CHECKLIST.md](./docs/VERIFICATION_CHECKLIST.md) | Local development verification procedures |

### AI-Powered Development

| Document | Description |
|----------|-------------|
| [CLAUDE.md](./CLAUDE.md) | AI-powered development guide with persona prompts (PM, Tech Lead, QA, Security, Pair Programmer, Researcher) |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to contribute using AI personas and SHOOT→SKIN workflow |
| [docs/](./docs/) | Complete technical documentation (Architecture, Security, Testing, APIs, Runbooks, ADRs) |

**AI Workflow Quick Links**:
- [Persona Prompts](./docs/PROMPT_PACK.md) - Copy-paste ready prompts for 6 AI personas
- [Workflow Order](./docs/WORKFLOW_ORDER.md) - AIM → Plan → Build → Wrench → Gate → SKIN
- [Playbook](./docs/PLAYBOOK_SHOPMATCH.md) - Standard Operating Procedures for each task
- [Architecture Decisions](./docs/adr/) - ADRs explaining why we chose each technology
- [Runbooks](./docs/runbooks/) - Operational procedures for common issues

**Use Persona Prompts to Simulate a Full Team**:
- 🎯 **Product Manager** - "Why this way?" business rationale and acceptance criteria
- 🏗️ **Tech Lead** - "Build on existing" minimal architectural changes
- 🧪 **QA Engineer** - Complete test plans across the test pyramid
- 🔒 **Security Engineer** - Threat modeling and vulnerability analysis
- 👥 **Pair Programmer** - Step-by-step implementation with code snippets
- 🔬 **Researcher** - Technology landscape monitoring for Decision Matrix updates

See [CLAUDE.md](./CLAUDE.md) for complete workflow documentation and copy-paste ready prompts.

## 🏗️ Project Structure

```
shopmatch-pro/
├── src/
│   ├── app/                    # Next.js App Router pages and API routes
│   │   ├── (auth)/            # Authentication pages
│   │   ├── dashboard/         # Owner and seeker dashboards
│   │   ├── jobs/              # Job listing, detail, create, edit
│   │   ├── subscribe/         # Stripe subscription page
│   │   └── api/               # Backend API routes
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── job-card.tsx      # Job display card
│   │   ├── job-form.tsx      # Job creation/edit form
│   │   └── application-card.tsx
│   ├── lib/                   # Shared utilities
│   │   ├── firebase/         # Firebase client and admin
│   │   ├── stripe/           # Stripe configuration
│   │   └── contexts/         # React contexts
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
├── scripts/                   # Utility scripts
│   ├── validate-env.js       # Environment validation
│   └── create-user.js        # Test user creation
├── firestore.rules           # Firestore security rules
├── .env.local                # Environment variables (YOU NEED TO FILL THIS)
└── package.json              # Dependencies and scripts
```

## ⚙️ Environment Setup

**Required Environment Variables:**

See [.env.local.template](./.env.local.template) for complete list.

**Quick Setup:**

1. Copy `.env.local.template` to `.env.local` (already done)
2. Fill in Firebase credentials from Firebase Console
3. Fill in Stripe credentials from Stripe Dashboard
4. Run `npm run validate-env` to verify
5. Restart dev server if needed

**Detailed instructions:** [QUICK_START.md](./QUICK_START.md#1-configure-firebase-2-minutes)

## 🧪 Testing

### Manual Testing Checklist

- [ ] Configure environment variables
- [ ] Sign up as Owner account
- [ ] Subscribe to Pro plan (Stripe test mode)
- [ ] Create a job posting
- [ ] Sign up as Seeker account (incognito window)
- [ ] Browse jobs and view details
- [ ] Submit application
- [ ] Review application as Owner
- [ ] Update application status

**Detailed test flows:** [PROJECT_STATUS.md](./PROJECT_STATUS.md#-testing-checklist)

### Testing Stripe Webhooks Locally

To test the complete subscription flow with real Stripe webhook events:

**Prerequisites:**
- [Stripe CLI](https://stripe.com/docs/stripe-cli) installed
- `.env.local` configured with Stripe keys
- Dev server running on `localhost:3000`

**Steps:**

1. **Start Stripe webhook forwarding** (in a new terminal):
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copy the webhook signing secret (`whsec_...`) and update `STRIPE_WEBHOOK_SECRET` in `.env.local`

2. **Trigger a test checkout session completed event**:
   ```bash
   stripe trigger checkout.session.completed
   ```

3. **Watch the logs** to see:
   - Stripe CLI forwarding the webhook
   - Your app at `/api/stripe/webhook` processing the event
   - Firebase custom claims being updated
   - Console logs showing subscription activation

**What happens:**
- Stripe sends a webhook event to your local endpoint
- The webhook handler verifies the signature
- User subscription status is updated in Firebase (custom claims + Firestore)
- User gains access to Pro features instantly

**For production:** Configure webhook endpoints in [Stripe Dashboard](https://dashboard.stripe.com/webhooks) pointing to your deployed URL.

### Quick Smoke Test (30 seconds)

Verify all systems are operational:

```bash
# 1. Check health endpoint (all services should return true)
curl http://localhost:3000/api/health

# Expected: {"status":"ok","checks":{"firebase":true,"stripe":true,"environment":true}}

# 2. Verify Stripe webhook endpoint
curl http://localhost:3000/api/stripe/webhook

# Expected: {"message":"Stripe webhook endpoint ready","timestamp":"...","note":"Use POST method for webhook events"}

# 3. Verify Stripe checkout endpoint
curl http://localhost:3000/api/stripe/checkout

# Expected: {"message":"Stripe checkout endpoint ready","note":"Use POST method to create checkout sessions","config":{"mode":"subscription","tier":"ShopMatch Pro"}}
```

**All endpoints returning JSON?** ✅ Your Stripe integration is working!

> **⚠️ Webhook Security:** The webhook endpoint uses raw body signature verification per [Stripe's security best practices](https://stripe.com/docs/webhooks/signatures). This prevents spoofed events and ensures only genuine Stripe webhooks are processed.

## 🔒 Security Features

- ✅ Firebase security rules for Firestore
- ✅ Role-based access control (owner/seeker)
- ✅ Stripe webhook signature verification
- ✅ Server-side authentication with Firebase Admin
- ✅ Custom claims for subscription access
- ✅ Input validation with Zod schemas
- ✅ Protected API routes with token verification

## 📊 Build Information

```
✓ Compiled successfully
✓ All TypeScript checks passing
✓ Zero ESLint errors
✓ 19 routes (8 pages, 11 API endpoints)
✓ Bundle size: 245 kB shared chunks
✓ Build time: ~3 seconds with Turbopack
```

## 🚀 Deployment

Ready to deploy to production? See [DEPLOYMENT.md](./DEPLOYMENT.md) for:

- Vercel deployment instructions
- Environment variable configuration
- Stripe webhook setup for production
- Firestore security rules deployment
- Post-deployment verification

## 🐛 Troubleshooting

### Common Issues

**Dev server won't start:**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
npm run dev
```

**Firebase errors:**
- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set
- Check `FIREBASE_PRIVATE_KEY` format (should include `\n`)
- Restart dev server after .env.local changes

**Stripe errors:**
- Verify `STRIPE_SECRET_KEY` starts with `sk_test_`
- Check `STRIPE_PRICE_ID_PRO` is correct
- Use test card `4242 4242 4242 4242` for testing

**More troubleshooting:** [QUICK_START.md](./QUICK_START.md#-troubleshooting)

## 📝 Next Steps

1. ✅ ~~Build production-ready MVP~~ (COMPLETE)
2. ⏳ Configure Firebase and Stripe credentials
3. ⏳ Test all user flows end-to-end
4. ⏳ Deploy to production (Vercel recommended)
5. ⏳ Set up monitoring and analytics

## 🤝 Contributing

This is a private MVP project. For questions or issues, refer to the documentation files listed above.

## 📄 License

ShopMatch Pro is licensed under the **MIT License**. See [LICENSE](./LICENSE) for the full license text.

### Third-Party Licenses

This project uses various open-source packages. All dependencies have been reviewed for license compatibility with commercial use. See [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md) for complete licensing information.

**Key Points**:
- ✅ All dependencies are permissively licensed (MIT, Apache-2.0, BSD, ISC)
- ✅ Compatible with commercial and proprietary software
- ✅ Dual-licensed packages use BSD option (node-forge)
- ✅ No strong copyleft licenses (GPL, AGPL) in distribution

**FOSSA Configuration**: License scanning policy is configured in [.fossa.yml](./.fossa.yml).

---

**Built with ❤️ using Next.js 15, Firebase, and Stripe**

**Status:** Development server running → Ready for testing
**Last Updated:** 2025-10-10
