# ShopMatch Pro

[![CI](https://github.com/RazonIn4K/shopmatch-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/RazonIn4K/shopmatch-pro/actions/workflows/ci.yml)
[![FOSSA License Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FRazonIn4K%2Fshopmatch-pro.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2FRazonIn4K%2Fshopmatch-pro?ref=badge_shield&issueType=license)
[![FOSSA Security Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FRazonIn4K%2Fshopmatch-pro.svg?type=shield&issueType=security)](https://app.fossa.com/projects/git%2Bgithub.com%2FRazonIn4K%2Fshopmatch-pro?ref=badge_shield&issueType=security)

> **Portfolio Project**: A production-grade SaaS job board platform demonstrating full-stack development capabilities, modern authentication & payment systems, and professional development practices.

**Live Demo:** [shopmatch-pro.vercel.app](https://shopmatch-pro.vercel.app) | **Portfolio:** [View Showcase →](./docs/PORTFOLIO_SHOWCASE.md)

## 🎯 Project Purpose

**Portfolio Demonstration Project** - Built to showcase professional-level full-stack development skills

**Status:** ✅ **Production-Ready MVP** (Test Mode) - Fully functional and deployed

### **What This Project Demonstrates** 🎯

- ✅ **Full-Stack Development**: Complete MERN-equivalent stack (Next.js + Firebase + Stripe)
- ✅ **Production-Grade Architecture**: Secure, scalable, and maintainable code
- ✅ **Modern Best Practices**: TypeScript strict mode, security rules, comprehensive testing
- ✅ **Complex Integrations**: Authentication (Firebase), Payments (Stripe), Real-time data
- ✅ **Professional Workflow**: Git, CI/CD, documentation, code review process
- ✅ **AI-Assisted Development**: Effective orchestration of modern AI development tools

### **Technical Highlights** 💡

- ⚡ **Performance**: 176.9 KB first-load JS (41% under budget), ~3s builds with Turbopack
- 🔒 **Security**: Firebase security rules, Stripe webhook verification, RBAC, type-safe APIs
- 🎨 **Modern Stack**: Next.js 15, TypeScript 5.7, Tailwind v4, shadcn/ui
- 🧪 **Quality**: Zero ESLint errors, TypeScript strict mode, comprehensive testing
- 📚 **Documentation**: Architecture diagrams, API docs, runbooks, deployment guides
- 🚀 **Deployed**: Vercel with auto-deployment, CI/CD via GitHub Actions

### **Portfolio Links**
- 🌟 **[Full Portfolio Showcase →](./docs/PORTFOLIO_SHOWCASE.md)** - Detailed project overview
- 🏗️ **[Architecture Documentation →](./docs/ARCHITECTURE.md)** - System design & data flows  
- 🔐 **[Security Documentation →](./docs/SECURITY.md)** - Security model & threat analysis
- 📖 **[Complete Documentation →](./docs/)** - All technical docs

## 🚀 Quick Start

**Get started in 5 minutes:**

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   ```bash
   cp .env.local.template .env.local
   # Edit .env.local with your Firebase and Stripe credentials
   # See docs/ENVIRONMENT_VARIABLES.md for detailed instructions
   ```

3. **Validate Configuration**
   ```bash
   npm run validate-env
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```

📖 **New to the project?** See [Quick Start Guide](./QUICK_START.md) | [Full Documentation →](./docs/)

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

### Frontend
- **Framework:** Next.js 15.5.4 (App Router, Server Components, Turbopack)
- **Language:** TypeScript 5.7 (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui component library
- **Forms:** React Hook Form + Zod validation
- **State:** React Context API for auth and global state

### Backend & Services
- **Authentication:** Firebase Auth (Email/Password + Google OAuth)
- **Database:** Cloud Firestore with custom security rules
- **Payments:** Stripe API (Checkout, Subscriptions, Webhooks)
- **Hosting:** Vercel (Edge Functions, Auto-scaling)
- **Monitoring:** Sentry error tracking

### Development Tools
- **Version Control:** Git + GitHub with branch protection
- **CI/CD:** GitHub Actions (lint, build, security scans)
- **Package Manager:** npm
- **Linting:** ESLint + Prettier
- **Testing:** Manual E2E + Firebase Emulator

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

# Webhook Testing & Monitoring (requires Stripe CLI)
npm run webhook:test           # Trigger test webhook event
npm run webhook:monitor        # Monitor live events in real-time
npm run webhook:events         # Show recent webhook events
npm run webhook:events:watch   # Watch webhook events (auto-refresh)
```

💡 **Tip:** For complete webhook testing guide, see [docs/runbooks/STRIPE_WEBHOOK_RUNBOOK.md](./docs/runbooks/STRIPE_WEBHOOK_RUNBOOK.md)

## 📚 Documentation

### Production & Deployment

| Document | Description |
|----------|-------------|
| [PRODUCTION_LAUNCH_COMPLETE.md](./docs/PRODUCTION_LAUNCH_COMPLETE.md) | Complete production verification & launch report |
| [PRODUCTION_DEPLOYMENT_GUIDE.md](./docs/PRODUCTION_DEPLOYMENT_GUIDE.md) | Production deployment quick start |
| [MONITORING_CHECKLIST.md](./docs/MONITORING_CHECKLIST.md) | Daily/weekly monitoring procedures |
| [FUTURE_ROADMAP.md](./docs/FUTURE_ROADMAP.md) | 12-month feature roadmap |

### Core Architecture

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System diagrams, data flows, component architecture |
| [API_REFERENCE.yml](./docs/API_REFERENCE.yml) | Complete OpenAPI 3.0 specification |
| [SECURITY.md](./docs/SECURITY.md) | Threat model, auth, security controls |
| [TESTING.md](./docs/TESTING.md) | Test pyramid, commands, coverage budgets |

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

## 🏗️ System Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────┐
│                   CLIENT (Next.js App)                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │    Auth     │  │  Job Board  │  │  Subscriptions  │  │
│  │   Pages     │  │  Features   │  │   & Payments    │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└────────────────────────┬─────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │   Firebase   │ │  Next.js API │ │    Stripe    │
  │     Auth     │ │    Routes    │ │   Checkout   │
  └──────────────┘ └──────┬───────┘ └──────┬───────┘
                          │                │
                          ▼                │
                   ┌──────────────┐        │
                   │  Firestore   │        │
                   │   Database   │        │
                   └──────────────┘        │
                          ▲                │
                          │                │
                          └────────────────┘
                       Webhook Events
```

### Key Features

**For Job Seekers:**
- Browse and search job listings
- Apply to jobs with cover letters
- Track application status
- Personalized dashboard

**For Employers:** (Requires Pro Subscription)
- Post unlimited job listings
- Manage applications
- View application analytics
- Edit and close job postings

**Platform Features:**
- Secure authentication (Email/Password + Google OAuth)
- Stripe subscription integration
- Real-time updates with Firebase
- Fully responsive design
- Role-based access control (RBAC)

## 🎓 Skills Demonstrated

This project showcases a comprehensive skill set:

### Technical Skills
- ✅ **Full-Stack Development**: Frontend (React/Next.js) + Backend (API Routes) + Database (Firestore)
- ✅ **TypeScript Mastery**: Strict mode, advanced types, type-safe APIs
- ✅ **Authentication & Authorization**: JWT, OAuth 2.0, RBAC, custom claims
- ✅ **Payment Integration**: Stripe API, webhooks, subscription management
- ✅ **Database Design**: NoSQL data modeling, security rules, composite indexes
- ✅ **API Development**: RESTful endpoints, error handling, input validation
- ✅ **Security**: OWASP best practices, input sanitization, secure authentication
- ✅ **DevOps**: CI/CD pipelines, environment management, production deployment

### Development Practices
- ✅ **Version Control**: Git workflow, meaningful commits, PR process
- ✅ **Code Quality**: Linting, formatting, type checking, zero errors
- ✅ **Documentation**: Technical writing, architecture diagrams, API docs
- ✅ **Testing**: Manual E2E testing, security rule testing, webhook simulation
- ✅ **Problem Solving**: Debugging, researching solutions, implementing fixes
- ✅ **AI Collaboration**: Using AI tools strategically while maintaining code quality

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

**Detailed test flows:** [TESTING.md](./docs/TESTING.md)

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

## 🚀 Live Deployment

**Production Site:** [shopmatch-pro.vercel.app](https://shopmatch-pro.vercel.app)

**Test Accounts:**
```
Employer Account (can subscribe):
Email: owner@test.com
Password: testtest123

Job Seeker Account:
Email: seeker@test.com
Password: testtest123

Stripe Test Card:
4242 4242 4242 4242 | Any future date | Any CVC
```

**Deployment Details:**
- Hosted on Vercel with auto-deployment from `main` branch
- Firebase Firestore for database with security rules
- Stripe integration in test mode (full functionality)
- CI/CD via GitHub Actions (lint, build, security scans)
- Environment variables securely configured

For deployment documentation, see [DEPLOYMENT.md](./DEPLOYMENT.md)

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

**More troubleshooting:** [PRODUCTION_DEPLOYMENT_GUIDE.md](./docs/PRODUCTION_DEPLOYMENT_GUIDE.md#-common-issues)

## ✅ Project Status

**Development:** Complete  
**Deployment:** Live on Vercel  
**Testing:** All user flows verified  
**Documentation:** Comprehensive  
**Purpose:** Portfolio demonstration

### What's Working
- ✅ User authentication (Email + Google OAuth)
- ✅ Role-based access (Employer vs Job Seeker)
- ✅ Job posting and management
- ✅ Application submission and tracking
- ✅ Stripe subscription integration
- ✅ Webhook processing
- ✅ Real-time database updates
- ✅ Responsive design
- ✅ Security rules enforced

### Potential Enhancements (If Continuing Development)
- [ ] Automated test suite (Jest + Playwright)
- [ ] Email notifications
- [ ] Advanced search/filtering
- [ ] Analytics dashboard
- [ ] API rate limiting
- [ ] Resume parsing

See [FUTURE_ROADMAP.md](./docs/FUTURE_ROADMAP.md) for complete feature roadmap.

## 💬 Contact & Collaboration

**This is a portfolio demonstration project** built to showcase professional full-stack development capabilities.

**Interested in working together?**
- Review the [Portfolio Showcase](./docs/PORTFOLIO_SHOWCASE.md) for detailed technical achievements
- Explore the [Architecture Documentation](./docs/ARCHITECTURE.md) to see system design
- Check out the [live demo](https://shopmatch-pro.vercel.app) to see it in action

**For Employers:** This project demonstrates my ability to build production-grade applications from concept to deployment.

**For Clients:** I can build similar custom solutions for your business needs.

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

## 📊 Project Metrics

- **Lines of Code:** ~15,000+ (TypeScript, React, API routes)
- **Build Size:** 245 KB shared chunks (optimized)
- **Build Time:** ~3 seconds (Turbopack)
- **API Endpoints:** 11 RESTful routes
- **Pages:** 8 user-facing pages
- **Components:** 30+ reusable React components
- **Security Rules:** Comprehensive Firestore rules
- **Documentation:** 20+ technical documents

---

**Built with ❤️ using Next.js 15, Firebase, and Stripe**

**Project Type:** Portfolio Demonstration  
**Status:** Production-Ready (Test Mode)  
**Last Updated:** October 2025
