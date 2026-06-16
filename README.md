# ShopMatch Pro

[![CI](https://github.com/RazonIn4K/shopmatch-pro/actions/workflows/ci.yml/badge.svg)](https://github.com/RazonIn4K/shopmatch-pro/actions/workflows/ci.yml)
[![FOSSA License Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FRazonIn4K%2Fshopmatch-pro.svg?type=shield&issueType=license)](https://app.fossa.com/projects/git%2Bgithub.com%2FRazonIn4K%2Fshopmatch-pro?ref=badge_shield&issueType=license)
[![FOSSA Security Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FRazonIn4K%2Fshopmatch-pro.svg?type=shield&issueType=security)](https://app.fossa.com/projects/git%2Bgithub.com%2FRazonIn4K%2Fshopmatch-pro?ref=badge_shield&issueType=security)

> **Portfolio Project**: A production-grade SaaS job board platform demonstrating full-stack development capabilities, modern authentication & payment systems, and professional development practices.

**Live Demo:** [shopmatch.highencodelearning.com](https://shopmatch.highencodelearning.com) | **Portfolio:** [View Showcase →](./docs/PORTFOLIO_SHOWCASE.md)

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
- ✅ **Always-On Monitoring**: Automated production smoke tests verify critical flows on every push to `main`

### **Technical Highlights** 💡

- ⚡ **Performance**: Latest verified production build keeps homepage first-load JS at 282.46 kB brotli, with `/jobs` at 292.78 kB
- 🔒 **Security**: No high/critical npm advisories; Firebase/Google transitive advisories tracked in [Security Documentation](./docs/SECURITY.md), plus Firestore rules, Stripe webhook verification, RBAC, and type-safe APIs
- 🛡️ **CI/CD**: multi-job automated pipeline (build, lint, test, a11y, smoke tests, security scan), branch protection, conventional commits
- 🎨 **Modern Stack**: Next.js 16.2.9, React 19, TypeScript 5.9, Tailwind v4, shadcn-style UI primitives
- 🧪 **Quality**: Zero ESLint errors, TypeScript strict mode, Playwright E2E tests, accessibility verified
- 📚 **Documentation**: Architecture diagrams, API docs, runbooks, AI development guide (CLAUDE.md)
- 🚀 **Deployed**: Vercel with auto-deployment, production smoke tests on every main push

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
- ⚡ Built with Next.js 16 + Turbopack

## 📈 Analytics & Insights Demo

Show clients how you reason about hiring performance with the new **Analytics & Insights** dashboard:

- **Portfolio-ready KPIs**: Jobs posted, matches generated, time-to-match, and interview rate (seeded data for demos)
- **Conversion funnel**: Visualizes drop-off from job views through hires, making it easy to discuss optimization ideas
- **Narrative insights**: Highlight top-performing roles, competitive markets, and overall pipeline health—perfect for executive summaries
- **Navigation**: `Dashboard → Analytics` (or visit `/dashboard/analytics` directly)

### Screenshot Gallery

| View | Screenshot |
|------|------------|
| Desktop overview | ![Analytics desktop](./docs/screenshots/analytics-desktop.png) |
| Mobile summary | ![Analytics mobile](./docs/screenshots/analytics-mobile.png) |

> 💡 **Client hand-off tip:** Swap the seeded data with live metrics by wiring the cards and charts to your analytics warehouse (BigQuery, Firestore, Supabase, etc.) or marketing tracking tools. The layout is fully responsive and uses the same design tokens as the rest of the dashboard, so it’s production-ready once you connect real data sources.

**Config-driven datasets:** The analytics view reads from `src/app/dashboard/analytics/demo-metrics.ts`. Flip `ACTIVE_METRIC_DATASET` (e.g., `jobBoard`, `courseMarketplace`) or add your own vertical to instantly change every KPI/funnel/insight card.

## 📁 Tech Stack

### Frontend
- **Framework:** Next.js 16.2.9 (App Router, Server Components, Turbopack)
- **Language:** TypeScript 5.9 (strict mode)
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
- **CI/CD:** GitHub Actions (branch/commit validation, build & quality checks, accessibility tests, local smoke tests, Snyk security scan, production smoke tests)
- **GitLab Security Mirror:** `gitlab.com/razonin4k/shopmatch-pro-ci` is available as a secondary scanner target; automatic GitHub-to-GitLab mirroring is configured with `GITLAB_MIRROR_TOKEN` and was verified on 2026-06-16.
- **Package Manager:** npm
- **Linting:** ESLint + Prettier
- **Testing:** Playwright E2E (smoke tests, accessibility), Jest unit tests, Firebase Emulator
- **Security:** Snyk scanning, production dependency audit clean, full audit residuals documented in [SECURITY.md](./docs/SECURITY.md), FOSSA license/security scans passing with reviewed issue remediation applied and a `fossa test --diff` regression gate in CI
- **Guardrails:** Branch naming enforced as `type/ID-slug` (`feat|fix|perf|sec|docs|test|refactor|ci|build`); use `ci` for infrastructure changes

## 🧭 Repository Structure
- `src/` – Next.js 16 App Router source (routes, components, providers, utilities)
- `e2e/` – Playwright suites (`login`, `demo-diagnostics`, `verify-demo-login` smoke tests run in CI)
- `docs/` – Comprehensive documentation (architecture, security, runbooks, checklists, ADRs)
- `.github/workflows/ci.yml` – All CI jobs (branch naming + commit checks, build, accessibility, production smoke tests)
- `scripts/` – Automation scripts (e.g., `create-demo-users.js`, CI helpers)
- `public/` – Static assets and integrations, including Google Search Console verifier `googlee573592846ba27d6.html`
- `playwright-report/` – Latest local Playwright artifacts (ignored in CI unless tests fail)
- `vercel.json` & `lighthouse-budgets.json` – Deployment routing and performance budgets

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
✓ Next.js 16 production build passing
✓ Homepage first-load JS: 282.46 kB brotli
✓ /jobs first-load JS: 292.78 kB brotli
```

## 🚀 Live Deployment

**Production Site:** [shopmatch.highencodelearning.com](https://shopmatch.highencodelearning.com)

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
- [ ] Email notifications
- [ ] Advanced search/filtering
- [ ] Resume parsing
- [ ] Persist rate limits outside in-memory serverless instances

See [FUTURE_ROADMAP.md](./docs/FUTURE_ROADMAP.md) for complete feature roadmap.

## 💬 Contact & Collaboration

**This is a portfolio demonstration project** built to showcase professional full-stack development capabilities.

**Interested in working together?**
- Review the [Portfolio Showcase](./docs/PORTFOLIO_SHOWCASE.md) for detailed technical achievements
- Explore the [Architecture Documentation](./docs/ARCHITECTURE.md) to see system design
- Check out the [live demo](https://shopmatch.highencodelearning.com) to see it in action

**For Employers:** This project demonstrates my ability to build production-grade applications from concept to deployment.

**For Clients:** I can build similar custom solutions for your business needs.

## 📄 License

ShopMatch Pro is licensed under the **MIT License**. See [LICENSE](./LICENSE) for the full license text.

### Third-Party Licenses

This project uses various open-source packages. Dependencies have been reviewed for license compatibility with commercial use. See [THIRD_PARTY_LICENSES.md](./THIRD_PARTY_LICENSES.md) for complete licensing information.

**Key Points**:
- ✅ Dependencies are commercial-compatible, including reviewed LGPL/MPL library and dev-tool usage
- ✅ Dual-licensed packages use BSD option (node-forge)
- ✅ No strong copyleft licenses (GPL, AGPL) in distribution
- ✅ FOSSA false positives and review findings are documented in [docs/FOSSA_LICENSE_REVIEW_2026-06-16.md](./docs/FOSSA_LICENSE_REVIEW_2026-06-16.md); current revision `55dcc8c3652c8e94b16735659a7a9887b8a70862` has zero unresolved FOSSA licensing, security, or quality issues

**FOSSA Configuration**: Scan targets and path filters are configured in [.fossa.yml](./.fossa.yml). License policy and reviewed ignore decisions are managed in FOSSA and through the guarded `FOSSA Reviewed Issue Remediation` workflow.

---

## 📊 Project Metrics

- **Lines of Code:** ~15,000+ (TypeScript, React, API routes)
- **Build Size:** 282.46 kB homepage first-load JS in the latest verified production build
- **API Endpoints:** 11 RESTful routes
- **Pages:** 8 user-facing pages
- **Components:** 30+ reusable React components
- **Security Rules:** Comprehensive Firestore rules
- **Documentation:** 20+ technical documents

---

**Built with Next.js 16, Firebase, and Stripe**

**Project Type:** Portfolio Demonstration  
**Status:** Production-Ready (Test Mode)  
**Last Updated:** June 16, 2026
