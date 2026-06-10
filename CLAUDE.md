# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ShopMatch Pro** is a production-grade SaaS job board platform built with Next.js 15, Firebase, and Stripe. It demonstrates full-stack development capabilities with authentication, payments, and role-based access control.

**Live Demo**: https://shopmatch-pro.vercel.app
**Status**: Production-Ready MVP (Test Mode)

## Development Commands

### Essential Commands
```bash
# Development
npm run dev                    # Start dev server with Turbopack (port 3000)
npm run build                  # Production build (required before commits)
npm run start                  # Start production server

# Code Quality
npm run lint                   # Run ESLint (must pass before commits)
npm run typecheck              # TypeScript type checking (strict mode)

# Environment Setup
npm run validate-env           # Validate all required env vars are set
npm run create-demo-users      # Create test users (owner@test.com, seeker@test.com)

# Testing
npm run test:e2e               # Run all Playwright E2E tests
npm run test:e2e:ui            # Playwright UI mode (debugging)
npm run test:a11y              # Accessibility tests (axe-core)
npm run test:rules             # Test Firestore security rules
npm run test:unit              # Jest unit tests (if any)

# Stripe Development
npm run webhook:test           # Trigger test webhook event
npm run webhook:monitor        # Monitor live webhook events (requires Stripe CLI)
npm run webhook:events         # Show recent webhook events
```

### Running a Single Test
```bash
# Run specific test file
npx playwright test e2e/login.spec.ts

# Run specific test by name
npx playwright test -g "should login as demo owner"

# Debug mode
npx playwright test e2e/login.spec.ts --debug
```

### Local Development with Stripe Webhooks
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Forward webhooks (copy webhook secret to .env.local)
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Terminal 3: Trigger test events
stripe trigger checkout.session.completed
```

## High-Level Architecture

### Application Structure

This is a **Next.js 15 App Router** application. Public surfaces are server-rendered for SEO; dashboards and forms are client components:

```
src/app/
   (auth)/              # Auth pages (login, signup) - route group
   dashboard/           # Protected dashboards (owner, seeker, analytics)
   jobs/                # Job listing (SSR), detail, create, edit pages
   legal/               # Privacy + terms pages
   subscribe/           # Stripe subscription flow
   sitemap.ts/robots.ts # SEO endpoints (fallback-mode aware)
   api/                 # Backend API routes (REST endpoints)
       users/          # Custom claims initialization
       jobs/           # Job CRUD + apply (delegates to src/lib/server)
       applications/   # Application management + CSV export
       stripe/         # Stripe checkout, portal, webhook
       events/         # Client telemetry ingestion
       health/         # Health check endpoint

src/lib/
   api/                 # HTTP guards: verifyAuth/assertRole, ApiError, rate limiters
   server/              # Server data layer - ALL Firestore access (ADR 0004)
   firebase/            # client.ts (browser SDK) vs admin.ts (service account)
   contexts/            # AuthContext (client auth state)
```

### Key Architectural Patterns

**1. Mixed Rendering (SSR where SEO matters)**
- Public jobs listing is server-rendered (`/jobs`, since #97) plus `sitemap.ts`/`robots.ts`
- Dashboards, auth pages, and the job detail page are client components (`'use client'`)
- Known follow-up: convert the job detail page to SSR reusing the data layer (ADR 0004)

**2. Three-Layer Security Model**
1. **Client-side route guards**: Redirect unauthenticated users
2. **API token verification**: `verifyAuth()` on every protected endpoint
3. **Firestore security rules**: Database-level access control

**3. Custom Claims for Authorization**
- JWT custom claims store `role` (owner/seeker) and `subActive` (subscription status)
- Set via `/api/users/initialize-claims` after signup
- Verified in API routes AND Firestore rules
- **Critical**: Must call `user.getIdToken(true)` after claim changes to refresh token

**4. Denormalized Data Model**
- Applications store snapshot data: `jobTitle`, `company`, `seekerName`
- Reduces Firestore reads and preserves historical records
- Trade-off: Must update if source data changes

**5. Server Data Layer (ADR 0004)**
- ALL Firestore access for domain data lives in `src/lib/server/` (`jobs.ts`, `applications.ts`, `users.ts`)
- Route handlers keep HTTP concerns only: parsing, Zod validation, auth guards, response shaping
- Data functions throw `ApiError`; `handleApiError` maps them to HTTP responses
- New Firestore queries belong in `src/lib/server/`, never inline in routes

### Authentication Flow (Critical Path)

```
1. User submits signup form
   ↓
2. AuthContext.signup() creates Firebase Auth user
   ↓
3. Create Firestore user document in users/ collection
   ↓
4. POST /api/users/initialize-claims → sets JWT custom claims
   ↓
5. user.getIdToken(true) → forces token refresh
   ↓
6. User now has JWT with role and subActive claims
```

**Important**: The custom claims flow is critical for authorization. If claims aren't set, users can't access protected features even if authenticated.

### Stripe Subscription Flow

```
1. Client: POST /api/stripe/checkout (creates checkout session)
   - Passes userId as client_reference_id
   - Returns checkout URL
   ↓
2. User completes payment on checkout.stripe.com
   ↓
3. Stripe webhook: POST /api/stripe/webhook
   - Event: checkout.session.completed
   - Verifies signature (raw body required)
   - Links Stripe customer ID to user
   - Sets custom claim: subActive = true
   - Updates Firestore user document
   ↓
4. User gains instant access to Pro features
```

**Critical Details**:
- Webhook route MUST use `export const runtime = 'nodejs'` for raw body access
- Signature verification prevents webhook spoofing
- Custom claims provide instant access (no DB query needed)
- Idempotency keys prevent duplicate checkout sessions
- Webhook events are deduplicated and processing failures rethrow so Stripe retries (#191)

### Data Flow Patterns

**Job Posting (Owner)**:
```typescript
Client: job-form.tsx (react-hook-form + Zod)
  → POST /api/jobs with Authorization header
API: verifyAuth() + assertActiveSubscription()
  → Firebase Admin SDK
Firestore: Create job document with ownerId, timestamps, counters
  → Response: Created job
Client: router.push(`/jobs/${jobId}`)
```

**Job Application (Seeker)**:
```typescript
Client: Apply button on job detail page
  → POST /api/jobs/[id]/apply
API: verifyAuth() + assertRole('seeker') + applicationSubmitLimiter (20/hour)
  → submitApplication() in src/lib/server/applications.ts
Firestore TRANSACTION: job exists + published, duplicate checks
  (deterministic `${jobId}_${uid}` doc ID + legacy jobId/seekerId query),
  create application + increment job.applicationCount atomically (#190)
  → Response: Created application with denormalized data
```

### Important Firestore Collections

**users/** - User profiles
- Fields: `email`, `displayName`, `role` (owner/seeker), `subActive`, `stripeCustomerId`
- Rules (v2, #188): self-only read/write; billing/entitlement fields (`subActive`) locked from client writes (Stripe webhook sets them via Admin SDK)
- Indexed: None required (queries by UID only)

**jobs/** - Job postings
- Fields: `title`, `company`, `location`, `type`, `salary`, `requirements[]`, `skills[]`, `status`, `ownerId`, `applicationCount`, `viewCount`, `timestamps`
- Rules (v2): anyone reads published jobs, owner reads/writes own; creation gated on JWT claims
- Indexed: Composite index on `status + createdAt` for published jobs

**applications/** - Job applications
- Fields: `jobId`, `seekerId`, `ownerId`, `coverLetter`, `status`, denormalized job/seeker data
- Rules (v2): canonical ownership - `ownerId` is verified against `jobs/{jobId}` (spoofed values rejected); immutable fields locked on update; applications only creatable against published jobs; seekers cannot change status
- Prevents duplicates: deterministic `${jobId}_${uid}` doc ID + legacy query, inside the submit transaction
- Updates: Only job owner can change status

**IMPORTANT (ops)**: the v2 rules authorize through JWT custom claims. Existing users must be backfilled (`node scripts/backfill-claims.js`) BEFORE deploying rules to production. There is deliberately no automated rules deploy in CI.

## Critical Code Patterns

### API Route Structure
```typescript
// src/app/api/example/route.ts
import { NextResponse } from 'next/server'

import { assertActiveSubscription, verifyAuth } from '@/lib/api/auth'
import { ApiError, handleApiError } from '@/lib/api/errors'
import { createExample } from '@/lib/server/examples'
import { exampleSchema } from '@/types'

export async function POST(request: Request) {
  try {
    // 1. Verify authentication (returns { uid, token, claims })
    const auth = await verifyAuth(request)

    // 2. Check authorization via JWT custom claims
    assertActiveSubscription(auth) // throws ApiError(403) if !claims.subActive

    // 3. Parse and validate input
    const parsed = exampleSchema.safeParse(await request.json())
    if (!parsed.success) {
      throw new ApiError('Validation failed', 422, { issues: parsed.error.issues })
    }

    // 4. Delegate ALL Firestore work to the data layer (src/lib/server)
    const example = await createExample(parsed.data, auth.uid)

    return NextResponse.json({ example }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
```

### Client Component with Auth
```typescript
'use client'

import { useAuth } from '@/lib/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ProtectedPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return <div>Protected content</div>
}
```

### Form with Validation
```typescript
// Define Zod schema
const JobFormSchema = z.object({
  title: z.string().min(3).max(100),
  requirements: z.array(z.string().min(1)).min(1).max(10),
  salary: z.string().regex(/^\d+k-\d+k$/).optional()
})

type JobFormValues = z.infer<typeof JobFormSchema>

// In component
const form = useForm<JobFormValues>({
  resolver: zodResolver(JobFormSchema),
  defaultValues: { /* ... */ }
})

const onSubmit = async (data: JobFormValues) => {
  const token = await user.getIdToken()
  const response = await fetch('/api/jobs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  // Handle response
}
```

## Common Development Tasks

### Adding a New API Route

1. Create route file: `src/app/api/feature/route.ts`
2. Use `verifyAuth()` for authentication
3. Define Zod schema for input validation
4. Check custom claims if needed (`token.role`, `token.subActive`)
5. Use Firebase Admin SDK for Firestore operations
6. Return `NextResponse.json()` with proper status codes
7. Update `docs/API_REFERENCE.yml` with endpoint documentation

### Adding a New Page

1. Create page: `src/app/feature/page.tsx`
2. Default to server component (no 'use client')
3. Add client directive only if using hooks/events
4. Implement auth guards if protected
5. Use server-side data fetching when possible
6. Add to navigation if needed

### Adding a New Firestore Collection

1. Define TypeScript type in `src/types/`
2. Create Zod schema for validation
3. Add security rules in `firestore.rules`
4. Test rules with `npm run test:rules`
5. Create composite indexes if needed (Firestore will prompt)
6. Document schema in code comments

### Modifying Subscription Logic

1. Update custom claims in `/api/stripe/webhook`
2. Test with `stripe trigger` events
3. Update Firestore rules if access control changes
4. Force token refresh on client: `user.getIdToken(true)`
5. Test both webhook flow and manual claim updates

## Testing Strategy

### E2E Tests (Playwright)
- **Location**: `e2e/` directory
- **Run**: `npm run test:e2e`
- **Key tests**:
  - `smoke.spec.ts`: Local smoke suite (CI runs it against a mock-config build; authenticated cases skip without demo secrets)
  - `verify-demo-login.spec.ts`: Production smoke - runs in CI on every push to main against the live deployment
  - `accessibility.spec.ts`: Axe-core page scans (CI job currently advisory via continue-on-error)
  - `login.spec.ts`: Login/reset form flows (form behavior only, no real auth assertions)
- **Test accounts**: owner@test.com / seeker@test.com (password: testtest123)

### Unit Tests (Jest)
- **Location**: `__tests__/` or colocated `*.test.ts`
- **Run**: `npm run test:unit`
- **Current coverage**: login/reset hooks, JobForm interactions + axe, server data-layer helpers (`src/lib/server/__tests__/`)
- **Gotcha**: `src/lib/csv/__tests__/to-csv.test.ts` uses a custom runner and is EXCLUDED from Jest - run it manually if you touch the CSV utility

### Firestore Rules Tests (emulator)
- **Run**: `npm run test:rules` (needs Java locally for the emulator)
- **CI**: dedicated `rules-tests` job runs on every push and PR
- **Covers**: canonical ownership, immutable field locks, billing-field locks, published-job gating

### Manual Testing Checklist
1. Sign up as owner → Subscribe → Create job
2. Sign up as seeker → Browse jobs → Apply
3. Owner reviews application → Update status
4. Verify Firestore rules prevent unauthorized access
5. Test webhook flow with Stripe CLI

## CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci.yml`)

**Branch Validation** (PRs only):
- Enforces branch naming: `type/ID-slug` format
- Types: `feat`, `fix`, `perf`, `sec`, `docs`, `test`, `refactor`, `ci`, `build`
- Commit message validation (Conventional Commits)
- Skips validation for Dependabot branches

**Build & Quality Checks** (all PRs & pushes):
- ESLint (zero errors enforced)
- TypeScript strict mode (zero type errors)
- Next.js production build
- Bundle size budget (300KB first-load JS limit)
- Unit tests (Jest)

**Firestore Rules Tests** (all PRs & pushes):
- `rules-tests` job: `npm run test:rules` against the Firestore emulator (Temurin Java 21)

**Accessibility Tests** (all PRs & pushes):
- Automated axe-core tests on all pages
- Zero violations enforced (currently `continue-on-error: true`)
- Tests against local build (http://localhost:3000)

**Smoke Tests - Local** (all PRs & pushes):
- Runs comprehensive smoke test suite (`e2e/smoke.spec.ts`)
- Tests against local build (http://localhost:3000)
- Validates: Landing page, auth flows, dashboard, analytics, job listings
- Requires secrets: `DEMO_OWNER_EMAIL`, `DEMO_OWNER_PASSWORD`

**Production Smoke Tests** (push to main only):
- Runs `e2e/verify-demo-login.spec.ts` against production
- Tests live deployment: https://shopmatch-pro.vercel.app
- Validates demo owner login flow
- Ensures critical features are operational after deployment

**Security Scan - Snyk** (all PRs & pushes):
- Scans all npm dependencies for vulnerabilities
- Threshold: Low severity or higher
- Respects `.snyk` policy file for ignored issues
- Advisory only (`continue-on-error: true`)
- Uploads JSON report as artifact
- Requires secret: `SNYK_TOKEN`

### Required GitHub Secrets

To enable all CI features, configure these secrets in your repository settings:

```bash
# For smoke tests
DEMO_OWNER_EMAIL=owner@test.com
DEMO_OWNER_PASSWORD=testtest123

# For Snyk security scanning
SNYK_TOKEN=<your-snyk-api-token>
# Get from: https://app.snyk.io/account
```

**Setup Instructions**:
1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each secret listed above
4. Push to trigger CI workflow

### Deployment (Vercel)

- **Auto-deploy**: Every push to `main` triggers deployment
- **Environment variables**: Set in Vercel dashboard (required before deploy)
- **Build command**: `npm run build` (Turbopack enabled)
- **Output**: Static pages + API routes as serverless functions
- **Headers**: Security headers configured in `vercel.json`

## Environment Variables

### Required Variables

**Firebase Client (Public)**:
```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

**Firebase Admin (Server-only)**:
```bash
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=         # Must include \n characters
```

**Stripe**:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=            # Server-only
STRIPE_WEBHOOK_SECRET=        # Get from `stripe listen`
STRIPE_PRICE_ID_PRO=          # Subscription price ID
```

**Application**:
```bash
NEXT_PUBLIC_APP_URL=          # e.g., http://localhost:3000 or production URL
```

**Validate**: Run `npm run validate-env` to check all required vars are set

## Code Quality Standards

### TypeScript
- **Strict mode enforced**: `"strict": true` in tsconfig.json
- **No `any` types**: Use proper types or `unknown`
- **Explicit return types**: On functions and API routes
- **Zod for runtime validation**: At all type boundaries (API inputs, forms)

### Security
- **Input validation**: All API routes use Zod schemas
- **Authentication**: `verifyAuth()` on all protected endpoints
- **Authorization**: Check custom claims (`role`, `subActive`) in API + rules
- **No secrets in code**: Use environment variables
- **Webhook signature verification**: Required for Stripe webhooks
- **Rate limiting**: in-memory sliding window in `src/lib/api/rate-limit.ts` - CSV export 5/hour, application submit 20/hour. Per-serverless-instance (best-effort); durable store tracked in ADR 0004 follow-ups

### Performance
- **First-load JS budget**: <=300KB (enforced in CI)
- **Code splitting**: Use `next/dynamic` for heavy components
- **Image optimization**: Use `next/image` for all images
- **ISR caching**: `/jobs` page uses 1-hour revalidation

### Accessibility
- **Zero axe violations**: Enforced in CI via Playwright tests
- **ARIA labels**: All interactive elements labeled
- **Semantic HTML**: Use proper tags (`<nav>`, `<main>`, `<article>`)
- **Keyboard navigation**: All features keyboard-accessible

## Common Gotchas

### 1. Custom Claims Not Applied
**Problem**: User authenticated but can't access features
**Solution**: Ensure `/api/users/initialize-claims` is called after signup and `user.getIdToken(true)` refreshes the token

### 2. Webhook Signature Verification Fails
**Problem**: Stripe webhook returns 400 error
**Solution**: Route must use `export const runtime = 'nodejs'` to access raw request body. Update `STRIPE_WEBHOOK_SECRET` from `stripe listen` output.

### 3. Firestore Timestamp Errors
**Problem**: Can't serialize Firestore Timestamp to JSON
**Solution**: Convert to Date or ISO string at API layer:
```typescript
createdAt: doc.data().createdAt?.toDate() || new Date()
```

### 4. Route Handler Not Returning NextResponse
**Problem**: API route returns 500 error
**Solution**: Always return `NextResponse.json()`, not plain objects:
```typescript
// WRONG
return { data: 'value' }

//  Correct
return NextResponse.json({ data: 'value' })
```

### 5. Client Component Using Server-Only APIs
**Problem**: Can't use `cookies()` or `headers()` in client component
**Solution**: Move server logic to API route or server component, fetch from client

### 6. Duplicate Applications Not Prevented
**Problem**: User can apply to same job multiple times
**Solution**: `submitApplication()` in `src/lib/server/applications.ts` runs a Firestore transaction (#190): deterministic `${jobId}_${uid}` document ID makes duplicates a same-document conflict, a legacy jobId/seekerId query catches old auto-ID applications, and the create + applicationCount increment commit atomically. Do not reintroduce non-transactional duplicate checks.

## Important Conventions

### Branch Naming
- Format: `type/ID-slug` (e.g., `feat/SMP-123-stripe-checkout`)
- ID requires uppercase letters + 3 or more digits; slug is lowercase-hyphenated
- Enforced in CI via branch validation job (`feat|fix|perf|sec|docs|test|refactor|ci|build`)

### Commit Messages
- Format: `type(scope): description` (Conventional Commits)
- Examples: `feat(auth): add Google OAuth`, `fix(stripe): handle webhook errors`

### File Naming
- Components: `kebab-case.tsx` (e.g., `job-card.tsx`)
- Types: `PascalCase` (e.g., `JobFormValues`)
- API routes: `route.ts` in feature directory

### Import Aliases
- `@/` → `src/` directory
- Example: `import { useAuth } from '@/lib/contexts/AuthContext'`

## Key Documentation

**Core Documentation**:
- `README.md` - Project overview, quick start, features
- `QUICK_START.md` - Detailed setup instructions
- `CONTRIBUTING.md` - Contribution workflow with AI personas
- `docs/ARCHITECTURE.md` - System diagrams and data flows
- `docs/SECURITY.md` - Security model and threat analysis
- `docs/TESTING.md` - Test pyramid and testing strategy
- `docs/API_REFERENCE.yml` - OpenAPI 3.0 specification

**Operational Guides**:
- `docs/runbooks/STRIPE_WEBHOOK_RUNBOOK.md` - Webhook debugging
- `docs/PRODUCTION_DEPLOYMENT_GUIDE.md` - Deployment checklist
- `docs/MONITORING_CHECKLIST.md` - Daily/weekly checks

**AI-Assisted Development**:
- `.github/copilot-instructions.md` - Code review standards for GitHub Copilot
- `docs/PROMPT_PACK.md` - AI persona prompts (PM, Tech Lead, QA, Security, etc.)
- `docs/PLAYBOOK_SHOPMATCH.md` - Standard operating procedures

## Architecture Decision Records (ADRs)

Located in `docs/adr/`:
- `0001-payments-stripe.md` - Stripe Checkout + Customer Portal, webhook signature verification
- `0002-auth-firestore.md` - Firebase Auth + Firestore
- `0003-hosting-vercel.md` - Vercel hosting
- `0004-server-data-layer.md` - `src/lib/server` data layer: boundaries, error model, follow-ups

## Contact & Support

- **Issues**: GitHub Issues
- **Questions**: See documentation in `docs/`
- **Test Accounts**: owner@test.com / seeker@test.com (password: testtest123)
- **Stripe Test Card**: 4242 4242 4242 4242 (any future date, any CVC)

---

**Last Updated**: 2026-06-10
**Next.js Version**: 15.5.19
**Node.js Version**: 20.x in CI; 18.x minimum
