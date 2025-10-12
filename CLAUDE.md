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
| Job posting CRUD              | ⏳ Planned        | Refer to MVP plan — requires jobs collection + owner UI        |
| Job discovery/listings        | ⏳ Planned        | Needs public jobs pages, filters, and detail views             |
| Applications workflow         | ⏳ Planned        | Requires applications collection, seeker flows, owner review   |
| Dashboards                    | ⏳ Planned        | Owner/seeker dashboards, stats, real-time listeners            |

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

### ⏳ Missing Features (Core Job Board Functionality)

**Job Management** (not implemented):
- Job posting creation, editing, deletion (CRUD)
- Job listing browsing and search
- Job detail view pages
- Job status management (draft, published, closed)

**Application System** (not implemented):
- Job application submission
- Application tracking for seekers
- Application management for job owners
- Application status workflow

**Dashboard** (not implemented):
- Owner dashboard (posted jobs, applications received)
- Seeker dashboard (saved jobs, application history)
- Analytics and metrics

**Additional Features** (not implemented):
- Job search and filtering
- Saved jobs functionality
- Email notifications
- File upload for resumes/attachments

### Current State Assessment

The application has a **solid foundation** with production-ready authentication and subscription infrastructure. However, it lacks the core job board features required for an MVP demonstration. Estimated completion: **3-4 weeks** for full job board functionality.

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
