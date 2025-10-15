# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**📌 IMPORTANT**: For detailed implementation plan, data models, API specs, and design specifications, see **[MVP_IMPLEMENTATION_PLAN.md](./MVP_IMPLEMENTATION_PLAN.md)**.

## Development Commands

### Essential Commands
- `npm run dev` — Start development server with Turbopack on http://localhost:3000
- `npm run build` — Create optimized production build (always run before deployment)
- `npm run start` — Serve the production build locally for verification
- `npm run lint` — Run ESLint with Next.js TypeScript rules (must pass before commits)

### Utility Scripts
- `npm run validate-env` — Verify all required Firebase and Stripe environment variables are configured correctly (run after any .env.local changes)
- `npm run create-user` — Create test users in Firebase with proper Firestore documents and roles (useful for development and testing)

## Documentation Stack & Workflow Gates

- Use `docs/README.md` as the canonical index; it links to architecture, security, testing, deployment, analytics, observability, and Firestore rule specs.
- Governance decisions live in `docs/adr/`, operational playbooks in `docs/runbooks/`, and team cadence material in `docs/WORKFLOW_ORDER.md`, `docs/PROMPT_PACK.md`, and `docs/PLAYBOOK_SHOPMATCH.md`.
- `.github/ISSUE_TEMPLATE/*` and `.github/pull_request_template.md` drive the mock team workflow—always link evidence (tests, logs, screenshots) in PRs.
- Continue to reference the external status docs under `/CAREER/Portfolio-Projects/ShopMatchPro/` for execution journal, component registry, decision matrix, landscape alignment, and roadmap context.

### Persona Prompt Primer

- When invoking any AI persona, prefix the request with:\
  `Use my Technology Landscape 2025 and S2 maturity. If you make tech choices, justify them using my Decision Matrix weights (Business Fit 25, Maturity 20, Cost 15, Capability 15, Ecosystem 10, Security 10, Performance 5).`
- Persona-specific prompts live in `docs/PROMPT_PACK.md`—use them for PM, Tech Lead, QA, Security, Pair Programming, and Researcher flows.
- Enforce the ordered workflow from `docs/WORKFLOW_ORDER.md` (Aim → Plan → Build/SHOOT → Wrench → Gate → SKIN) and document outcomes in the Execution Journal.

## Architecture Overview

ShopMatch Pro is a Next.js 15 subscription-based job board built with the App Router pattern. The application uses Firebase for authentication and database, Stripe for subscription management, and implements a role-based access control system.

### Core Technology Stack
- **Framework**: Next.js 15 with Turbopack, React 19, TypeScript (strict mode)
- **Authentication**: Firebase Auth with email/password and Google OAuth
- **Database**: Cloud Firestore for user data and application state
- **Payments**: Stripe Checkout and Subscriptions with webhook-based synchronization
- **Styling**: Tailwind CSS v4 with class-variance-authority for component variants
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers

### Project Structure Philosophy
The codebase follows Next.js App Router conventions with these key organizational principles:

- **Route Organization**: `src/app/` contains all routes. Auth pages live in `(auth)` group to share layouts without affecting URLs. API routes follow RESTful patterns under `src/app/api/`.

- **Module Boundaries**: `src/lib/` houses shared integrations and utilities organized by service (firebase/, stripe/). `src/components/` contains reusable UI primitives built with Radix UI and Tailwind.

- **Configuration Centralization**: All Firebase and Stripe configuration lives in dedicated config files (`src/lib/firebase/`, `src/lib/stripe/config.ts`) with comprehensive documentation explaining security rationale and usage patterns.

## Implementation Status

### Feature Status Overview

| Domain                         | Status            | Notes                                                          |
|-------------------------------|-------------------|----------------------------------------------------------------|
| Auth & user management        | ✅ Implemented    | Email/password + Google OAuth, roles, Firestore user records   |
| Stripe subscriptions          | ✅ Implemented    | Checkout, portal, webhooks, custom claims (`subActive`)        |
| Health & tooling              | ✅ Implemented    | `/api/health`, env validation, user creation script            |
| Job posting CRUD              | ✅ Implemented    | Full CRUD with owner dashboard, real-time Firestore queries    |
| Applications workflow         | ✅ Implemented    | Submit, track, review with dual-mode ApplicationDetailDialog   |
| Dashboards                    | ✅ Implemented    | Owner/seeker role-based dashboards with real-time data         |
| Job discovery (public)        | ⏳ Optional       | Current: auth-required browsing; public page can be added later|

### ✅ Completed Features (Production-Ready)

**Authentication & User Management**:
- Email/password authentication with validation
- Google OAuth integration
- User role system (owner/seeker)
- Automatic user document creation in Firestore
- Password reset functionality
- Auth state management via React Context

**Subscription & Payment Processing**:
- Stripe Checkout integration for subscriptions
- Webhook-based subscription synchronization
- Custom claims for access control (subActive)
- Subscription status tracking in Firestore
- Customer portal integration ready
- Subscribe page UI with checkout flow

**Infrastructure & Tooling**:
- Next.js 15 App Router architecture
- TypeScript strict mode configuration
- Tailwind CSS v4 styling system
- UI component library (Radix UI + shadcn/ui)
- Form validation (React Hook Form + Zod)
- Environment validation script
- User creation utility script
- ESLint configuration

**API Routes**:
- `/api/health` - Health check endpoint
- `/api/stripe/checkout` - Create subscription checkout sessions
- `/api/stripe/webhook` - Process Stripe webhook events
- `/api/stripe/portal` - Customer portal session creation
- `/api/jobs` - Job CRUD operations (GET, POST)
- `/api/jobs/[id]` - Single job operations (GET, PUT, DELETE)
- `/api/jobs/[id]/apply` - Job application submission
- `/api/applications` - List applications (role-based filtering)
- `/api/applications/[id]` - Application status updates (PATCH, DELETE)

**Job Board Features** (Phase 2 Complete):
- Job posting creation, editing, deletion with validation
- Owner dashboard with job management
- Seeker dashboard with application tracking
- Application submission with cover letter
- Application review with status updates (pending/reviewed/accepted/rejected)
- Real-time Firestore queries for both dashboards
- All 4 Firestore composite indexes operational

### ⏳ Optional Enhancements (Post-MVP)

**Public Job Discovery** (not required for MVP):
- Public job listing page (current: auth-required browsing works)
- Advanced search with Algolia/Typesense
- SEO-optimized job detail pages

**Enhanced Features** (nice-to-have):
- Resume upload to Cloud Storage
- Saved jobs functionality
- Email notifications (Firestore triggers + SendGrid)
- Company profiles
- Advanced analytics dashboard

### Current State Assessment

The application is **production-ready** with a complete end-to-end job board MVP. Phase 2 delivered all core features: authentication, subscriptions, job posting, applications workflow, and role-based dashboards. The system is tested, documented, and ready for deployment.

## Development Roadmap (Fast-Track MVP)

Follow the five-phase sequence defined in `MVP_IMPLEMENTATION_PLAN.md`:
1. **Backend Foundation (Phase 1)** — Implement Firestore models, security rules, and RESTful job/application API routes with subscription and role guards.
2. **UI Components (Phase 2)** — Build reusable job/application forms, cards, filters, and dashboard widgets using shadcn/ui and Tailwind v4.
3. **Pages & Routes (Phase 3)** — Wire public listings, job CRUD screens, and role-based dashboards; route protect with AuthContext.
4. **Testing & Polish (Phase 4)** — Execute the testing checklist (lint, flow validations, UX polish, performance passes).
5. **Deployment Prep (Phase 5)** — Run production build, finalize Firestore indexes/rules, document environment updates, and smoke-test `npm start`.

## Missing Features & Implementation Approach

### 1. Job Posting System

**Firestore Data Model**:
```typescript
// Collection: jobs
{
  id: string,
  ownerId: string,           // Firebase UID of job poster
  title: string,
  description: string,
  company: string,
  location: string,
  type: 'full-time' | 'part-time' | 'contract' | 'freelance',
  salary?: { min: number, max: number, currency: string },
  status: 'draft' | 'published' | 'closed',
  createdAt: Timestamp,
  updatedAt: Timestamp,
  expiresAt?: Timestamp
}
```

**Implementation Steps**:
1. Create API routes: `/api/jobs` (GET, POST), `/api/jobs/[id]` (GET, PUT, DELETE)
2. Add authorization middleware to verify `subActive` custom claim for job posting
3. Build UI pages: `/jobs/new`, `/jobs/[id]/edit`, `/jobs` (listing)
4. Implement form validation with Zod schema for job fields
5. Add Firestore security rules for job documents (owners can CRUD own jobs)

**Key Pattern**: Check `subActive` custom claim before allowing job creation:
```typescript
const decodedToken = await adminAuth.verifyIdToken(token)
if (!decodedToken.subActive) {
  return NextResponse.json({ error: 'Active subscription required' }, { status: 403 })
}
```

### 2. Job Application System

**Firestore Data Model**:
```typescript
// Collection: applications
{
  id: string,
  jobId: string,             // Reference to jobs collection
  seekerId: string,          // Firebase UID of applicant
  ownerId: string,           // Job owner UID (denormalized for queries)
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected',
  coverLetter?: string,
  resumeUrl?: string,        // Cloud Storage URL
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Implementation Steps**:
1. Create API routes: `/api/jobs/[id]/apply` (POST), `/api/applications` (GET)
2. Add Cloud Storage integration for resume uploads (optional for MVP)
3. Build application form UI on job detail pages
4. Create application list views for both owners and seekers
5. Implement status update functionality for job owners

**Key Pattern**: Denormalize ownerId for efficient querying:
```typescript
// Owner can query: applications.where('ownerId', '==', userId)
// Seeker can query: applications.where('seekerId', '==', userId)
```

### 3. Dashboard Views

**Owner Dashboard** (`/dashboard/owner`):
- Display jobs posted by user (with application counts)
- Recent applications received
- Quick actions: Create job, View applications

**Seeker Dashboard** (`/dashboard/seeker`):
- Applied jobs with application status
- Saved jobs (optional for MVP)
- Profile completion status

**Implementation Steps**:
1. Create protected dashboard routes with role-based rendering
2. Build dashboard components using existing UI primitives
3. Implement real-time Firestore queries for live updates
4. Add pagination for job/application lists

### 4. Job Browsing & Search

**Implementation Steps**:
1. Create `/jobs` public listing page with server-side rendering
2. Implement Firestore compound queries with filters (type, location)
3. Add client-side search using Firestore text search or Algolia integration
4. Build filter UI components (location, job type, salary range)
5. Implement pagination or infinite scroll

**Performance Consideration**: For production, consider Algolia or Typesense for full-text search. For MVP, basic Firestore queries with limited filters are sufficient.

## Development Roadmap

### Phase 1: Job Posting Foundation (Week 1)
**Goal**: Enable subscription holders to create and manage job postings

- [ ] Define Firestore data models and security rules for jobs collection
- [ ] Implement `/api/jobs` CRUD endpoints with subscription verification
- [ ] Build job creation form (`/jobs/new`) with Zod validation
- [ ] Create job listing page for owners (`/dashboard/jobs`)
- [ ] Add job edit/delete functionality
- [ ] **Milestone**: Job owners can post, edit, and delete jobs

### Phase 2: Job Discovery (Week 2)
**Goal**: Public job browsing and viewing

- [ ] Build public job listing page (`/jobs`) with SSR
- [ ] Create job detail view page (`/jobs/[id]`)
- [ ] Implement basic filtering (job type, location)
- [ ] Add search functionality (Firestore queries or client-side)
- [ ] Build responsive UI for job cards and lists
- [ ] **Milestone**: Anyone can browse and view job postings

### Phase 3: Application System (Week 3)
**Goal**: Job seekers can apply, owners can review applications

- [ ] Define applications data model and security rules
- [ ] Implement `/api/jobs/[id]/apply` endpoint
- [ ] Build application form UI with validation
- [ ] Create applications list for seekers (`/dashboard/applications`)
- [ ] Build application review interface for owners (`/dashboard/applicants`)
- [ ] Add application status updates (accept/reject)
- [ ] **Milestone**: Complete application workflow functional

### Phase 4: Dashboard & Polish (Week 4)
**Goal**: Unified dashboards and MVP refinement

- [ ] Build unified dashboard with role-based routing (`/dashboard`)
- [ ] Add analytics (job view counts, application counts)
- [ ] Implement email notifications (optional, using Firestore triggers)
- [ ] Add loading states, error handling, empty states
- [ ] Perform end-to-end testing of all flows
- [ ] Fix bugs and polish UI/UX
- [ ] **Milestone**: MVP ready for demonstration

### Optional Enhancements (Post-MVP)
- Resume upload to Cloud Storage
- Advanced search with Algolia/Typesense
- Saved jobs functionality
- Job recommendations
- Email notifications for applications
- Admin panel for moderation
- Company profiles

### Pre-Launch Checklist
- [ ] All Firestore security rules tested and deployed
- [ ] Environment variables configured for production
- [ ] Stripe webhooks tested with production keys
- [ ] Error monitoring configured (Sentry)
- [ ] SEO meta tags added to public pages
- [ ] Performance optimization (image optimization, code splitting)
- [ ] Accessibility audit (WCAG 2.1 AA compliance)

## Firebase Integration Architecture

### Dual-Context Pattern
The application uses two separate Firebase contexts that must never be mixed:

**Client-Side (`src/lib/firebase/client.ts`)**:
- Initialized with NEXT_PUBLIC_ environment variables (safe for browser exposure)
- Used in React components and client-side code
- Handles user-facing authentication flows and real-time data subscriptions
- Powers the AuthContext provider for application-wide auth state

**Server-Side (`src/lib/firebase/admin.ts`)**:
- Uses Firebase Admin SDK with service account credentials
- Operates with elevated privileges for administrative operations
- Critical for custom claims management (role, subActive) via `adminAuth.setCustomUserClaims()`
- Required for Stripe webhook processing to update user subscription status

### Service Account Credentials Approach
This codebase uses service account credentials (NOT Application Default Credentials) for Firebase Admin SDK:
- Environment variables: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- No Google account login or gcloud CLI required for development
- Works consistently across all deployment environments
- See detailed rationale in `src/lib/firebase/admin.ts` comments

### Authentication Context Architecture
The `AuthContext` (`src/lib/contexts/AuthContext.tsx`) provides global authentication state with these key features:
- Automatic user document creation in Firestore on signup with role assignment (owner/seeker)
- Real-time auth state synchronization via `onAuthStateChanged`
- Merges Firebase Auth user with Firestore user data for extended properties (role, subscription status)
- Provides type-safe `AppUser` interface extending Firebase User with application-specific fields

## Stripe Integration Architecture

### Subscription Lifecycle Flow
The subscription system uses a webhook-driven architecture to maintain synchronization:

1. **Checkout Initiation** (`src/app/api/stripe/checkout/route.ts`):
   - Verifies user authentication via Firebase Admin token verification
   - Creates Stripe Checkout Session with `client_reference_id` set to Firebase UID
   - Redirects to hosted Stripe checkout page

2. **Webhook Processing** (`src/app/api/stripe/webhook/route.ts`):
   - Receives Stripe events (subscription.created/updated/deleted, checkout.session.completed)
   - Verifies webhook signature using raw request body (CRITICAL for security)
   - Updates Firebase custom claims via `adminAuth.setCustomUserClaims()` to control access
   - Synchronizes subscription status to Firestore users collection

3. **Access Control**:
   - Custom claims (`subActive: true/false`) stored on Firebase Auth user token
   - Client-side code checks custom claims after token refresh to enable/disable features
   - Firestore documents maintain duplicate subscription data for querying and reporting

### Critical Stripe Route Requirements
All Stripe API routes MUST use Node.js runtime (NOT Edge Runtime) due to:
- Raw request body access required for webhook signature verification
- Firebase Admin SDK compatibility requirements
- Stripe SDK dependency on Node.js APIs

Add this to any new Stripe route files:
```typescript
export const runtime = 'nodejs' // Required for Stripe webhook signature verification
```

### Webhook Security Architecture
The webhook handler implements multiple security layers:
1. Signature verification using `stripe.webhooks.constructEvent()` with raw body
2. Event type validation against known webhook events
3. User lookup via Firestore query (stripeCustomerId → Firebase UID mapping)
4. Atomic custom claims updates to prevent race conditions
5. Error handling that prevents information leakage while logging for debugging

## Environment Variable Architecture

### Required Variables
The application requires strict environment variable configuration validated by `scripts/validate-env.js`:

**Client-Side (NEXT_PUBLIC_ prefix - exposed to browser)**:
- Firebase configuration: API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID
- APP_URL for OAuth redirects and webhook callback URLs

**Server-Side (never exposed to browser)**:
- Firebase Admin: PROJECT_ID, CLIENT_EMAIL, PRIVATE_KEY (service account credentials)
- Stripe: SECRET_KEY, WEBHOOK_SECRET, PRICE_ID_PRO

### Configuration Validation
Always run `npm run validate-env` after:
- Copying .env.local.template to .env.local
- Modifying any environment variables
- Before deploying to new environments
- When encountering Firebase or Stripe initialization errors

## TypeScript Configuration

The project uses strict TypeScript with these key settings:
- `strict: true` — All strict type checking enabled
- `target: "ES2017"` — Modern JavaScript features with broad compatibility
- Path alias `@/*` maps to `src/*` for clean imports
- `noEmit: true` — TypeScript only for type checking, Next.js handles compilation

When adding new files, always use absolute imports: `import { X } from '@/lib/...'` instead of relative paths.

## Tailwind CSS v4 Configuration

The project uses Tailwind CSS v4 with the new oxide engine:
- Configuration via `@tailwind` directives in global CSS (no tailwind.config.js)
- PostCSS integration via `@tailwindcss/postcss` plugin
- Theme customization through CSS custom properties
- Component composition using `class-variance-authority` for type-safe variant APIs

## Key Development Patterns

### Form Validation Pattern
Forms use React Hook Form + Zod with server-side type safety:
```typescript
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({ /* fields */ })
type FormData = z.infer<typeof schema>

const form = useForm<FormData>({ resolver: zodResolver(schema) })
```

### API Route Authentication Pattern
Server-side routes verify Firebase tokens before processing:
```typescript
const authHeader = request.headers.get('authorization')
const token = authHeader?.substring(7) // Remove 'Bearer '
const decodedToken = await adminAuth.verifyIdToken(token)
const userId = decodedToken.uid
```

### Custom Claims Pattern
Subscription status is controlled via Firebase custom claims (NOT just Firestore):
- Firestore documents store subscription data for queries and UI display
- Custom claims control access (checked on every authenticated request)
- Claims are updated by Stripe webhooks via `adminAuth.setCustomUserClaims()`
- Client code must refresh tokens after subscription changes to get updated claims

## Testing Stripe Webhooks Locally

When developing Stripe integration features:

1. **Use ngrok for webhook forwarding**:
   ```bash
   ngrok http 3000
   ```

2. **Configure Stripe webhook endpoint**:
   - Go to Stripe Dashboard → Webhooks
   - Create endpoint with ngrok URL: `https://xxx.ngrok-free.app/api/stripe/webhook`
   - Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` in .env.local

3. **Test webhook events**:
   - Use Stripe Dashboard → Webhooks → Send test webhook
   - Or use Stripe CLI: `stripe trigger checkout.session.completed`
   - Check server logs for webhook processing confirmation

## Common Development Tasks

### Adding a New Subscription Tier
1. Create new Price in Stripe Dashboard
2. Add price ID to `STRIPE_CONFIG` in `src/lib/stripe/config.ts`
3. Add tier definition to `SUBSCRIPTION_TIERS`
4. Update checkout route to support new tier parameter
5. Update webhook handler if tier-specific logic needed

### Adding a New Authentication Provider
1. Enable provider in Firebase Console → Authentication → Sign-in method
2. Add provider configuration to client-side auth flow in `AuthContext.tsx`
3. Handle provider-specific user document creation in `createUserDocument()`
4. Update UI to show new sign-in button

### Extending User Roles
1. Update `UserRole` type in `src/lib/contexts/AuthContext.tsx`
2. Modify user document creation to support new role
3. Update custom claims structure if role affects access control
4. Add role-specific UI logic and routing rules

## Security Considerations

### Never Commit These Files
- `.env.local` — Contains all secrets and API keys
- `serviceAccountKey.json` — Firebase service account credentials (if you generate one)
- Any files with `PRIVATE_KEY` or `SECRET` in contents

### Firestore Security Rules
When modifying Firestore documents, ensure security rules allow the operation:
- User documents: Users can read/write their own documents
- Admin operations: Server-side Admin SDK bypasses security rules
- Query operations: Ensure indexes exist for compound queries

### API Route Security Checklist
Before deploying new API routes:
- [ ] Verify user authentication for protected endpoints
- [ ] Validate and sanitize all input parameters
- [ ] Use Firebase Admin SDK for elevated privilege operations
- [ ] Return appropriate HTTP status codes
- [ ] Log errors server-side but don't expose to client
- [ ] Rate limit sensitive endpoints if needed

## Deployment Configuration

When deploying to production:

1. **Environment Variables**: Set all required env vars in hosting platform (Vercel, Netlify, etc.)
2. **Stripe Webhooks**: Update webhook endpoint URL to production domain
3. **Firebase Security Rules**: Review and tighten Firestore/Storage rules for production
4. **CORS Configuration**: Update Stripe allowed origins if using custom domains
5. **Build Verification**: Run `npm run build` locally to catch build-time errors early

---

## AI-Powered Development Workflow

ShopMatch Pro uses an **AI-powered team simulation workflow** to accelerate development while maintaining professional standards. This section documents how to leverage AI tools (Claude, GPT-5, Cursor, Perplexity) to simulate a full engineering team.

### SHOOT→SKIN Methodology

Every feature follows this iterative loop:

**SHOOT (Implementation Phase)**:
- **S**ystem - Core implementation (business logic, APIs, UI)
- **H**ooks - Integration points (webhooks, events, triggers)
- **O**bservability - Logging, metrics, traces
- **O**perations - Runbooks, alerts, incident response
- **T**ests - Unit, component, integration, E2E, security

**SKIN (Documentation Phase)**:
- **S**ynthesis - Update Execution Journal with what shipped
- **K**nowledge - Update Component Registry and Architecture docs
- **I**nsights - Document learnings, gotchas, and trade-offs
- **N**otes - Add to ADRs if architectural decisions were made

**Reference Documents**:
- Full workflow: [docs/WORKFLOW_ORDER.md](./docs/WORKFLOW_ORDER.md)
- Task SOP: [docs/PLAYBOOK_SHOPMATCH.md](./docs/PLAYBOOK_SHOPMATCH.md)
- Testing strategy: [docs/TESTING.md](./docs/TESTING.md)

### Daily Development Rhythm

**Morning (10 min)**:
1. Review [Current Roadmap](../SHOPMATCH_PRO_CURRENT_ROADMAP.md) and pick next card
2. Check [Execution Journal](../SHOPMATCH_PRO_EXECUTION_JOURNAL.md) for context
3. Run **Product Manager** prompt to define acceptance criteria and evidence plan

**During Development (per task)**:
1. **Kickoff** - Run PM persona prompt → get acceptance criteria
2. **Micro-CPM** - Quick risk assessment (5 min) → identify layers touched (L2/L4/L5/L6/L9)
3. **Build** - Use Pair Programmer prompt → implement with tests
4. **Inject Wrench** - Deliberately introduce one realistic problem (auth failure, API timeout, etc.)
5. **Resolve** - Use [runbooks](./docs/runbooks/) and Security Engineer prompt
6. **Gate** - CI green ✅ + tests pass ✅ + docs updated ✅ + evidence linked ✅

**End of Day (10 min)**:
1. **SKIN Entry** - Add synthesis note to Execution Journal
2. **Update Registry** - Add new components to [Component Registry](../SHOPMATCH_PRO_COMPONENT_REGISTRY.md)
3. **Commit Evidence** - Link test outputs, screenshots, logs in PR

**Reference**: [docs/WORKFLOW_ORDER.md](./docs/WORKFLOW_ORDER.md) for complete gate requirements

### Quality Gates & Evidence Requirements

**Pre-Merge Checklist** (enforced by [.github/pull_request_template.md](./.github/pull_request_template.md)):
- [ ] CI passing (lint, typecheck, build)
- [ ] Tests written and passing (unit, component, E2E as applicable)
- [ ] Documentation updated ([ARCHITECTURE.md](./docs/ARCHITECTURE.md), [API_REFERENCE.yml](./docs/API_REFERENCE.yml), etc.)
- [ ] Evidence linked (test output, screenshot, logs, metrics)
- [ ] Bundle budget respected (≤ 300 kB first-load JS)
- [ ] Accessibility checks passed (axe, keyboard navigation)
- [ ] Security review completed (if touching auth, payments, or sensitive data)

**Testing Commands** (from [docs/TESTING.md](./docs/TESTING.md)):
```bash
npm run lint                 # ESLint + TypeScript checks
npm run build                # Production build verification
npm run validate-env         # Environment variable validation
node scripts/verify-end-to-end.js  # Firestore index verification
```

**Evidence Artifacts** (required in PR description):
- Test output (screenshot or copy-paste)
- Lighthouse score (if frontend changes)
- API response examples (if backend changes)
- Firestore query performance (if database changes)
- Security review notes (if auth/payment changes)

### Risk Assessment Framework

For every feature, document risks across these layers:

- **L2 (Data)** - Firestore schema changes, migrations, indexes
- **L4 (API)** - New routes, breaking changes, rate limits
- **L5 (Integration)** - Firebase, Stripe, external services
- **L6 (Auth/Security)** - Authentication, authorization, secrets
- **L9 (UX/UI)** - Accessibility, responsive design, loading states

**Example Risk Entry** (add to task description):
```markdown
### Risks
- L2: New composite index required (applications by seekerId + createdAt)
- L5: Stripe webhook must handle new subscription.updated event
- L6: Ensure seeker role cannot delete other users' applications
```

---

## AI Persona Prompts (Copy-Paste Ready)

Use these prompts with your AI tools to simulate different team roles. Always prefix with:

> "Use my **Technology Landscape 2025** and **S2 maturity** level. When choosing tech, justify using my **Decision Matrix** weights (Business Fit 25, Maturity 20, Cost 15, Capability 15, Ecosystem 10, Security 10, Performance 5). Quote specific file paths from the codebase you relied on."

### Product Manager - "Why This Way?"

**Purpose**: Analyze business rationale, acceptance criteria, and define evidence plan

**Prompt**:
```
Given `docs/ARCHITECTURE.md` + `docs/ANALYTICS_SCHEMA.md`, explain **why** we should implement feature X now instead of later.

Return:
1. 5 benefits tied to business goals
2. 3 trade-offs and their impact on velocity/cost/complexity
3. 1 counter-metric to watch (what could go wrong?)
4. Acceptance criteria (user-facing outcomes)
5. Evidence plan mapping to `TESTING.md` (unit, component, E2E) and `OBSERVABILITY.md` (events, metrics)

Format as a structured markdown document I can copy into the issue.
```

**When to Use**: Start of every feature, when prioritizing roadmap items, when stakeholders ask "why not feature Y instead?"

**Expected Output**: Markdown document with rationale, acceptance criteria, and test plan

---

### Tech Lead - "Build on Existing"

**Purpose**: Propose minimal architectural changes that leverage existing patterns

**Prompt**:
```
Given the current architecture in `docs/ARCHITECTURE.md` and component patterns in `SHOPMATCH_PRO_COMPONENT_REGISTRY.md`, propose the **smallest architectural change** to support feature X without:
- Breaking bundle budgets (≤ 300 kB first-load JS)
- Introducing new dependencies (unless Decision Matrix score > 80)
- Changing existing API contracts (unless versioned)

Return:
1. File-by-file implementation plan (which files to create, modify, delete)
2. Expected git diff skeleton (not full code, just structure)
3. New dependencies (if any) with Decision Matrix justification
4. Risks by layer (L2, L4, L5, L6, L9)
5. Snippet to update `ARCHITECTURE.md` System Components section

Reference existing patterns from the codebase where possible.
```

**When to Use**: Before starting implementation, during architecture review, when considering refactoring

**Expected Output**: Step-by-step file plan with risk assessment

---

### QA Engineer - "Test Plan"

**Purpose**: Generate comprehensive test coverage across the test pyramid

**Prompt**:
```
Create a complete test plan for feature X covering:

1. **Unit Tests** (src/lib, utilities, pure functions)
2. **Component Tests** (React components, forms, UI logic)
3. **E2E Tests** (user flows, happy path + edge cases)
4. **Firestore Rules Emulator Tests** (security rules validation)

For each test type:
- Test cases (arrange, act, assert format)
- Pass/fail criteria
- Mock requirements (Firebase, Stripe, external APIs)

Provide a minimal Playwright spec skeleton for the critical user flow.

Reference commands from `docs/TESTING.md` and security requirements from `docs/FIRESTORE_RULES_SPEC.md`.
```

**When to Use**: After Tech Lead plan approved, before implementation starts, when bugs are found

**Expected Output**: Structured test plan with Playwright skeleton

---

### Security Engineer - "Threat Model"

**Purpose**: Identify vulnerabilities and attack vectors before code ships

**Prompt**:
```
Perform a security audit for feature X touching these areas:
- API routes: [list routes]
- Firestore collections: [list collections]
- User roles: [owner/seeker/admin]

Return:
1. **3 Abuse Vectors** (what could an attacker do?)
2. **Mitigations** (how we prevent each attack)
3. **Test Plan** (how to verify mitigations work)
4. **Rate Limiting Recommendations** (if applicable)
5. **Zod Schema Validation** (input validation requirements)

Reference threat model from `docs/SECURITY.md` and rules spec from `docs/FIRESTORE_RULES_SPEC.md`.

For each mitigation, specify:
- Where implemented (Firestore rules, API middleware, client validation)
- How tested (emulator test, E2E test, manual verification)
```

**When to Use**: Before implementing auth/payment features, when adding new API routes, during security reviews

**Expected Output**: Threat matrix with mitigations and test plan

---

### Pair Programmer - "Implementation Diffs"

**Purpose**: Generate step-by-step implementation with code snippets

**Prompt**:
```
Generate a step-by-step implementation plan for feature X:

1. **File Structure** (new files, modified files)
2. **Implementation Order** (which file to start with, dependencies)
3. **Code Snippets** (key functions, API routes, React components)
4. **Accessibility Notes** (ARIA labels, keyboard navigation, focus management)
5. **Bundle Budget Impact** (estimate added KB, how to optimize)

Follow these constraints:
- Use existing patterns from `src/app/api/`, `src/components/`, `src/lib/`
- Respect TypeScript strict mode
- Use shadcn/ui components where possible
- Add Zod validation for all forms
- Include error boundaries and loading states

Reference style guide from `docs/ARCHITECTURE.md` Component Patterns section.
```

**When to Use**: During active development, when stuck on implementation details, for code review preparation

**Expected Output**: Annotated code snippets with accessibility and performance notes

---

### Researcher - "Landscape Drift"

**Purpose**: Monitor technology landscape for changes affecting our Decision Matrix

**Prompt**:
```
Scan for 2025 changes in:
- Firebase (Auth, Firestore, Cloud Functions)
- Stripe (Checkout, Subscriptions, Webhooks)
- Vercel (Next.js hosting, edge functions, serverless)
- Next.js 15+ (App Router, Turbopack, React Server Components)

Identify changes that would:
1. **Increase** our Decision Matrix scores (new features, better pricing, improved DX)
2. **Decrease** our scores (deprecations, price increases, breaking changes)
3. **Require ADR updates** (architectural decisions invalidated by new info)

For each significant change:
- Impact summary (5-10 words)
- Recommended action (adopt, investigate, defer, ignore)
- ADR to update (if applicable)

Reference current scores from `SHOPMATCH_PRO_TECH_DECISION_MATRIX.md`.
```

**When to Use**: Monthly landscape review, before adding new dependencies, when considering migrations

**Expected Output**: Change summary with ADR update recommendations

---

## Documentation Navigation Map

### Core Technical Documentation (`/docs/`)

**Architecture & Design**:
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System diagram, data flows, component architecture
- [API_REFERENCE.yml](./docs/API_REFERENCE.yml) - OpenAPI 3.0 spec for all REST endpoints and webhooks
- [ANALYTICS_SCHEMA.md](./docs/ANALYTICS_SCHEMA.md) - Product analytics event taxonomy and schema

**Security & Compliance**:
- [SECURITY.md](./docs/SECURITY.md) - Threat model, security controls, auth patterns
- [FIRESTORE_RULES_SPEC.md](./docs/FIRESTORE_RULES_SPEC.md) - Firestore security rules with allow/deny matrix

**Testing & Quality**:
- [TESTING.md](./docs/TESTING.md) - Test pyramid, commands, coverage budgets, CI gates

**Operations & Deployment**:
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Vercel deployment checklist, Stripe webhook config
- [OBSERVABILITY.md](./docs/OBSERVABILITY.md) - Events, metrics, logs, dashboards
- [INCIDENT_RESPONSE.md](./docs/INCIDENT_RESPONSE.md) - Incident severity levels, escalation, postmortem template

**Runbooks** (`/docs/runbooks/`):
- [STRIPE_WEBHOOK_RUNBOOK.md](./docs/runbooks/STRIPE_WEBHOOK_RUNBOOK.md) - Troubleshooting Stripe webhook failures

**Architecture Decision Records** (`/docs/adr/`):
- [0001-payments-stripe.md](./docs/adr/0001-payments-stripe.md) - Why Stripe over PayPal/Square
- [0002-auth-firestore.md](./docs/adr/0002-auth-firestore.md) - Why Firebase Auth over Auth0/Clerk
- [0003-hosting-vercel.md](./docs/adr/0003-hosting-vercel.md) - Why Vercel over Netlify/Railway

**Team Workflow** (`/docs/`):
- [WORKFLOW_ORDER.md](./docs/WORKFLOW_ORDER.md) - AIM → Plan → Build → Wrench → Gate → SKIN
- [PROMPT_PACK.md](./docs/PROMPT_PACK.md) - AI persona prompts (PM, TL, QA, Security, Pair, Researcher)
- [PLAYBOOK_SHOPMATCH.md](./docs/PLAYBOOK_SHOPMATCH.md) - Standard Operating Procedures for each task type

### Project Status Documentation (External)

These documents track execution progress and live outside the codebase (in your `/CAREER/Portfolio-Projects/ShopMatchPro/` directory):

- **SHOPMATCH_PRO_EXECUTION_JOURNAL.md** - Daily development log with SKIN entries
- **SHOPMATCH_PRO_COMPONENT_REGISTRY.md** - Catalog of all components, hooks, utilities
- **SHOPMATCH_PRO_TECH_DECISION_MATRIX.md** - Decision Matrix scores for all tech choices
- **SHOPMATCH_PRO_LANDSCAPE_ALIGNMENT.md** - S-Tier maturity assessment and 2025 landscape alignment
- **SHOPMATCH_PRO_CURRENT_ROADMAP.md** - Now/Next/Later roadmap with priorities

### GitHub Templates (`.github/`)

- **ISSUE_TEMPLATE/bug_report.md** - Bug report template with repro steps, environment, logs
- **ISSUE_TEMPLATE/feature_request.md** - Feature request with acceptance criteria, evidence plan
- **pull_request_template.md** - PR template requiring evidence, tests, docs, security review

### Root-Level Documentation

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute using AI personas and SHOOT→SKIN workflow
- **[MVP_IMPLEMENTATION_PLAN.md](./MVP_IMPLEMENTATION_PLAN.md)** - Phase-by-phase feature breakdown, data models, API specs
- **[README.md](./README.md)** - Project overview, quick start, tech stack
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide
- **CLAUDE.md** (this file) - AI-powered development guide and architecture reference

---

## Decision Framework Integration

### Technology Landscape 2025 & S-Tier Maturity

ShopMatch Pro is assessed as **S2 (Standardized)** maturity:
- Standard tech stack (Next.js, Firebase, Stripe)
- Industry best practices (security rules, webhooks, role-based auth)
- Production-ready patterns (error handling, testing, observability)

**Decision Matrix Weights** (used for all technology choices):
- **Business Fit**: 25 - Does it solve our problem directly?
- **Maturity**: 20 - Is it production-ready with stable APIs?
- **Cost**: 15 - Total cost of ownership (licenses, hosting, maintenance)
- **Capability**: 15 - Feature completeness vs. requirements
- **Ecosystem**: 10 - Community size, plugins, integrations
- **Security**: 10 - Security track record, compliance, audit tools
- **Performance**: 5 - Speed, scalability, resource efficiency

**How to Use the Decision Matrix**:

1. **When Evaluating New Dependencies**:
   - Score candidate on 0-100 scale for each weight
   - Calculate weighted score: `(BusinessFit × 0.25) + (Maturity × 0.20) + ... + (Performance × 0.05)`
   - Threshold: Adopt if score ≥ 80, investigate if 60-79, reject if < 60

2. **When Writing ADRs**:
   - Document Decision Matrix scores for finalist options
   - Explain why chosen option scored highest
   - Note trade-offs (what we sacrificed for higher scores in priority weights)

3. **Example** (Stripe vs. PayPal for payments):
   ```
   Stripe: Business Fit 90, Maturity 95, Cost 70, Capability 90, Ecosystem 85, Security 90, Performance 85
   Weighted Score: (90×0.25) + (95×0.20) + (70×0.15) + (90×0.15) + (85×0.10) + (90×0.10) + (85×0.05) = 87.25

   PayPal: Business Fit 80, Maturity 90, Cost 75, Capability 70, Ecosystem 80, Security 85, Performance 75
   Weighted Score: 80.25

   Decision: Choose Stripe (higher score, better developer experience, more capabilities)
   ```

**Reference**: `SHOPMATCH_PRO_TECH_DECISION_MATRIX.md` for complete scores of all dependencies

---

## Automation & Tooling Tips

### Saved Prompts (Recommended Setup)

**Raycast (macOS)**:
1. Create Raycast Quicklink for each persona prompt
2. Assign keyboard shortcuts: `⌘⌥P` (PM), `⌘⌥T` (TL), `⌘⌥Q` (QA), etc.
3. Include auto-populated context (current file path, git branch)

**Shortcuts (iOS/macOS)**:
1. Create shortcut to read prompt from Notes app
2. Auto-append current task from Reminders
3. Send to ChatGPT/Claude API with one tap

**Stream Deck (Hardware)**:
1. Assign button per persona
2. Button press copies prompt to clipboard + opens AI tool
3. Color-code by role (blue=TL, red=Security, green=QA)

**VS Code / Cursor**:
1. Save prompts as code snippets (prefix: `pm-`, `tl-`, `qa-`)
2. Use Cursor Rules (`.cursorrules`) to inject context automatically
3. Configure Copilot to reference `docs/` in suggestions

### CI/CD Integration Points

**Bundle Budget Check** (add to `.github/workflows/ci.yml`):
```yaml
- name: Check Bundle Size
  run: |
    npm run build
    BUNDLE_SIZE=$(du -sk .next/static | cut -f1)
    MAX_SIZE=307200  # 300 KB in KB
    if [ $BUNDLE_SIZE -gt $MAX_SIZE ]; then
      echo "❌ Bundle size $BUNDLE_SIZE KB exceeds limit $MAX_SIZE KB"
      exit 1
    fi
    echo "✅ Bundle size $BUNDLE_SIZE KB within limit"
```

**Accessibility Check** (add axe-core E2E test):
```typescript
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('homepage accessibility', async ({ page }) => {
  await page.goto('http://localhost:3000')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
```

**Firestore Rules Validation**:
```bash
# Add to CI pipeline
firebase emulators:exec --only firestore \
  "node scripts/test-firestore-rules.js"
```

### Recommended AI Tool Combinations

**For Solo Development**:
- **Claude (via API or web)** - Best for architecture analysis, security reviews, long-context tasks
- **GPT-5 Thinking** - Best for complex problem-solving, multi-step planning
- **Cursor / Copilot** - Best for code generation during active development
- **Perplexity** - Best for researching latest package versions, API changes

**Workflow Example** (feature implementation):
1. Morning: **GPT-5 Thinking** for PM "why this way?" analysis
2. Pre-coding: **Claude** for Tech Lead architectural plan
3. Coding: **Cursor** for Pair Programmer implementation
4. Testing: **Claude** for QA test plan generation
5. Security review: **Claude** for Security Engineer threat model
6. Research: **Perplexity** for dependency updates

### Evidence Automation

**Playwright Test Reports**:
```bash
# Generate HTML report with screenshots
npm run test:e2e -- --reporter=html
# Attach report to PR automatically via GitHub Actions
```

**Lighthouse CI** (add to CI pipeline):
```yaml
- name: Run Lighthouse CI
  uses: treosh/lighthouse-ci-action@v9
  with:
    urls: |
      http://localhost:3000
      http://localhost:3000/dashboard
    uploadArtifacts: true
```

**Firestore Query Profiling**:
```typescript
// Add to API routes during development
const startTime = Date.now()
const snapshot = await query.get()
console.log(`Query took ${Date.now() - startTime}ms, returned ${snapshot.size} docs`)
```

---

## Conclusion

This AI-powered workflow enables **solo developers to operate at team velocity** while maintaining enterprise-grade quality. By using AI persona prompts systematically and following the SHOOT→SKIN methodology, you ensure:

- ✅ Business rationale is documented (PM)
- ✅ Architecture is sound and maintainable (TL)
- ✅ Tests cover all scenarios (QA)
- ✅ Security vulnerabilities are caught early (Security)
- ✅ Code follows best practices (Pair Programmer)
- ✅ Tech stack stays current (Researcher)

**Key Success Factors**:
1. Use prompts consistently (not just when stuck)
2. Link evidence in every PR (screenshots, test output, metrics)
3. Update Execution Journal daily (SKIN entries)
4. Run quality gates before every merge (CI, bundle, a11y)
5. Review Decision Matrix when adding dependencies

**Next Steps**:
- Wire prompts into your IDE/Raycast/Stream Deck
- Add bundle budget and a11y checks to CI
- Create first GitHub Issues from roadmap with persona labels
- Start daily Execution Journal entries with SKIN format

For questions or issues with this workflow, refer to [WORKFLOW_ORDER.md](./docs/WORKFLOW_ORDER.md) and [PLAYBOOK_SHOPMATCH.md](./docs/PLAYBOOK_SHOPMATCH.md)
