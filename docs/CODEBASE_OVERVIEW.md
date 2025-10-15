# ShopMatch Pro - Comprehensive Codebase Overview

**Version**: 0.1.0 | **Status**: Foundation Complete (30% MVP) | **Last Updated**: 2025-10-15

---

## Table of Contents

1. [Executive Summary](#1-executive-summary--project-overview)
2. [Architecture & Design Patterns](#2-architecture--design-patterns)
3. [Technology Stack Analysis](#3-complete-technology-stack-analysis)
4. [Directory Structure](#4-directory-structure--file-organization)
5. [Authentication System](#5-authentication-system-deep-dive)
6. [Subscription & Payment Integration](#6-subscription--payment-integration)
7. [Job Management System](#7-job-management-system)
8. [Application Workflow System](#8-application-workflow-system)
9. [Data Models & Type Definitions](#9-data-models--type-definitions)
10. [API Routes Documentation](#10-api-routes-documentation)
11. [UI Components Catalog](#11-ui-components-catalog)
12. [Data Flow Diagrams](#12-data-flow-diagrams)
13. [Security Architecture](#13-security-architecture)
14. [Configuration & Environment](#14-configuration--environment)
15. [Development Workflow](#15-development-workflow)
16. [Known Issues & Current State](#16-known-issues--current-state)
17. [Code Quality & Best Practices](#17-code-quality--best-practices)
18. [Future Improvements](#18-future-improvements--recommendations)

---

## 1. Executive Summary & Project Overview

### Project Purpose

ShopMatch Pro is a modern, subscription-based job board platform built with Next.js 15, Firebase, and Stripe. The platform connects job seekers with employment opportunities through a two-sided marketplace model:

- **Job Seekers (Free)**: Browse jobs, apply to positions, track application status
- **Employers (Subscription)**: Post unlimited jobs, manage applications, access analytics

### Current Status

**Foundation Complete**: The authentication, subscription infrastructure, and core architecture are production-ready. The job board features (job posting, applications, dashboards) are architecturally planned but not yet implemented.

**Implementation Progress**:
- ✅ **Authentication System** (100% complete)
- ✅ **Subscription Infrastructure** (100% complete) 
- ✅ **Development Tooling** (100% complete)
- ❌ **Job Management** (0% complete)
- ❌ **Application System** (0% complete)
- ❌ **Dashboard Views** (0% complete)

### Key Features & Capabilities

**Implemented Features**:
- Email/password and Google OAuth authentication
- Role-based user management (owner/seeker)
- Stripe subscription integration with webhook synchronization
- Custom claims for access control
- Production-ready Next.js 15 setup with Turbopack
- Comprehensive type safety with TypeScript strict mode
- Tailwind CSS v4 with shadcn/ui components

**Planned Features** (Architecture ready):
- Job posting CRUD operations
- Job application workflow
- Role-based dashboards
- Search and filtering capabilities

### Technology Decisions & Rationale

**Next.js 15 + App Router**: Latest framework with Server Components for optimal performance and SEO
**Firebase**: Comprehensive authentication and real-time database solution
**Stripe**: Industry-standard payment processing with robust webhook system
**TypeScript**: Type safety and enhanced developer experience
**Tailwind CSS v4**: Utility-first styling with excellent performance
**Zod**: Runtime type validation for form handling and API requests

---

## 2. Architecture & Design Patterns

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │    │  External APIs  │
│                 │    │                 │    │                 │
│ React 19 +      │────│ Next.js 15     │────│ Firebase Auth   │
│ Auth Context    │    │ API Routes     │    │ Cloud Firestore │
│ Stripe Elements │    │ Admin SDK      │    │ Stripe API      │
│ Form Validation │    │ Webhook Handler │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Dual-Context Firebase Pattern

**Client Context** (`firebase/client.ts`):
- User authentication flows
- Real-time UI updates
- Form submissions
- Client-side security rules enforcement

**Admin Context** (`firebase/admin.ts`):
- Server-side operations with elevated privileges
- Custom claims management
- Stripe webhook processing
- Administrative tasks

### Subscription-Based Access Control Flow

```
User Signup → Role Assignment → Optional Subscription → Custom Claims → Feature Access
     │              │                    │                   │              │
   Auth Context → Firestore Doc → Stripe Checkout → Webhook → UI Protection
```

### Role-Based Routing Architecture

**Protected Routes Pattern**:
- `/dashboard/*` - Requires authentication
- `/jobs/new` - Requires owner role + active subscription
- `/jobs/[id]/edit` - Requires ownership verification
- Public routes accessible to all

**Access Control Layers**:
1. **Client-side**: AuthContext for UI protection
2. **API Layer**: Token verification + custom claims
3. **Database**: Firestore security rules
4. **Server**: Firebase Admin SDK validation

---

## 3. Complete Technology Stack Analysis

### Framework & Runtime

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Next.js | 15.5.5 | React framework with App Router |
| **Runtime** | React | 19.2.0 | UI library with Server Components |
| **Language** | TypeScript | 5.x | Type safety and developer experience |
| **Bundler** | Turbopack | Built-in | Fast development and production builds |
| **Package Manager** | npm | Default | Dependency management |

### Authentication & Database

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Auth** | Firebase Auth | 12.4.0 | User authentication and management |
| **Database** | Cloud Firestore | 12.4.0 | Real-time NoSQL database |
| **Admin SDK** | Firebase Admin | 13.5.0 | Server-side operations |

### Payment Processing

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Payments** | Stripe | 19.1.0 | Subscription and payment processing |
| **Client** | @stripe/stripe-js | 8.0.0 | Client-side Stripe integration |

### UI & Styling

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **CSS Framework** | Tailwind CSS | v4.0 | Utility-first styling |
| **UI Library** | Radix UI | Latest | Accessible component primitives |
| **Components** | shadcn/ui | Latest | Pre-built component system |
| **Icons** | Lucide React | 0.545.0 | Icon library |
| **Fonts** | Inter (Google) | Latest | Typography |

### Form Handling & Validation

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Forms** | React Hook Form | 7.65.0 | Performant form library |
| **Validation** | Zod | 4.1.12 | Schema validation |
| **Resolver** | @hookform/resolvers | 5.2.2 | Zod integration for RHF |

### Development Tools

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Linting** | ESLint | 9.x | Code quality and consistency |
| **Config** | eslint-config-next | 15.5.5 | Next.js ESLint configuration |
| **PostCSS** | @tailwindcss/postcss | 4.x | CSS processing |

### Dependencies Analysis

**Core Dependencies (14 packages)**:
- Framework: next, react, react-dom
- Firebase: firebase, firebase-admin  
- Stripe: stripe, @stripe/stripe-js
- UI: @radix-ui packages, lucide-react
- Forms: react-hook-form, @hookform/resolvers, zod
- Utilities: clsx, tailwind-merge, class-variance-authority

**Development Dependencies (7 packages)**:
- TypeScript and type definitions
- ESLint configuration
- Tailwind CSS build tools

**Bundle Size**: 245 kB shared chunks (optimized)
**Build Time**: ~3 seconds with Turbopack

---

## 4. Directory Structure & File Organization

### Root Level Organization

```
shopmatch-pro/
├── src/                    # Application source code
├── public/                 # Static assets
├── scripts/               # Utility scripts
├── node_modules/          # Dependencies
├── .env.local            # Environment variables (local)
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
├── next.config.ts        # Next.js configuration
├── components.json       # shadcn/ui configuration
├── firestore.rules      # Firestore security rules
└── [documentation files] # Various .md files
```

### Source Code Structure (`/src`)

```
src/
├── app/                   # Next.js App Router
│   ├── (auth)/           # Auth page group
│   │   ├── login/        # Login page
│   │   └── signup/       # Signup page with role selection
│   ├── api/              # API routes
│   │   ├── applications/ # Application endpoints
│   │   ├── health/       # Health check endpoint
│   │   ├── jobs/         # Job CRUD endpoints
│   │   ├── stripe/       # Stripe integration endpoints
│   │   └── users/        # User management endpoints
│   ├── dashboard/        # Protected dashboard routes
│   │   ├── owner/        # Owner-specific dashboard
│   │   └── seeker/       # Seeker-specific dashboard
│   ├── jobs/             # Job-related pages
│   │   ├── [id]/         # Dynamic job routes
│   │   └── new/          # Job creation page
│   ├── subscribe/        # Subscription page
│   ├── layout.tsx        # Root layout with providers
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── ui/              # shadcn/ui base components
│   ├── job-card.tsx     # Job display component
│   ├── job-form.tsx     # Job creation/edit form
│   └── application-*.tsx # Application components
├── lib/                 # Shared utilities and configurations
│   ├── api/            # API utilities
│   ├── contexts/       # React contexts
│   ├── firebase/       # Firebase configurations
│   ├── stripe/         # Stripe configuration
│   └── utils.ts        # General utilities
└── types/              # TypeScript type definitions
    ├── job.ts          # Job-related types and schemas
    ├── application.ts  # Application types
    └── index.ts        # Type exports
```

### File Naming Conventions

**Pages**: `page.tsx` (App Router convention)
**Layouts**: `layout.tsx` (App Router convention)
**Components**: kebab-case (e.g., `job-card.tsx`)
**API Routes**: `route.ts` (App Router convention)
**Types**: Descriptive names (e.g., `job.ts`, `application.ts`)
**Utilities**: Functionality-based (e.g., `auth.ts`, `config.ts`)

### Key Directory Purposes

**`/app/api/`**: Server-side API endpoints with route handlers
**`/components/ui/`**: Reusable shadcn/ui base components
**`/lib/contexts/`**: React Context providers for global state
**`/lib/firebase/`**: Firebase client and admin configurations
**`/scripts/`**: Development and deployment utility scripts

---

## 5. Authentication System Deep Dive

### AuthContext Implementation (`/src/lib/contexts/AuthContext.tsx`)

**Core Features**:
- Real-time authentication state management
- Email/password and Google OAuth support
- Automatic user document creation in Firestore
- Role-based access control (owner/seeker)
- Custom claims integration
- Comprehensive error handling

**Key Methods**:

```typescript
interface AuthContextType {
  user: AppUser | null              // Current authenticated user
  loading: boolean                  // Loading state
  error: string | null             // Authentication errors
  signup: (email, password, role, displayName) => Promise<void>
  signin: (email, password) => Promise<void>
  signinWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email) => Promise<void>
  updateUserProfile: (updates) => Promise<void>
  clearError: () => void
}
```

### Firebase Client/Admin SDK Usage

**Client SDK** (`/src/lib/firebase/client.ts`):
- User authentication flows
- Real-time Firestore subscriptions
- Client-side security rule enforcement
- Form submissions and UI updates

**Admin SDK** (`/src/lib/firebase/admin.ts`):
- Server-side operations with elevated privileges
- Custom claims management for subscription access
- Stripe webhook processing
- Administrative database operations

### User Document Creation Flow

```typescript
// Automatic user document creation on signup
async function createUserDocument(user: User, role: UserRole, displayName: string) {
  const userDocRef = doc(db, 'users', user.uid)
  await setDoc(userDocRef, {
    uid: user.uid,
    email: user.email,
    displayName: displayName,
    role: role,                    // 'owner' or 'seeker'
    createdAt: serverTimestamp(),
    subActive: false,              // Updated by Stripe webhook
  })
}
```

### OAuth Integration

**Google OAuth Setup**:
- Uses Firebase Auth Google provider
- Popup-based authentication flow
- Automatic user document creation
- Defaults to 'seeker' role for Google signups
- Custom claims initialization via API call

### Custom Claims for Access Control

**Server-side Custom Claims Management**:
```typescript
// Set custom claims after Stripe subscription
await adminAuth.setCustomUserClaims(userId, {
  role: 'owner',
  subActive: true,              // Subscription status
  stripeCustomerId: customerId,
  subscriptionId: subscriptionId,
  updatedAt: new Date().toISOString(),
})
```

**Client-side Access Pattern**:
```typescript
// Check subscription status in components
const { user } = useAuth()
const hasSubscription = user?.getIdTokenResult()
  .then(result => result.claims.subActive === true)
```

---

## 6. Subscription & Payment Integration

### Stripe Checkout Implementation

**Checkout Session Creation** (`/src/app/api/stripe/checkout/route.ts`):
```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  line_items: [{
    price: STRIPE_CONFIG.PRICE_ID_PRO,
    quantity: 1,
  }],
  success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/subscribe`,
  client_reference_id: user.uid,    // Links checkout to user
  customer_email: user.email,
})
```

### Webhook-Based Subscription Synchronization

**Webhook Handler** (`/src/app/api/stripe/webhook/route.ts`):

**Supported Events**:
- `checkout.session.completed` - Links customer ID to user
- `customer.subscription.created` - Activates subscription
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Cancels subscription

**Security Features**:
- Raw body signature verification
- Stripe webhook signature validation
- Firebase custom claims synchronization
- Firestore document updates

**Event Processing Flow**:
```typescript
// Webhook processes subscription events
Stripe Event → Signature Verification → Find User → Update Claims → Update Firestore
```

### Custom Claims Synchronization

**Subscription Activation**:
```typescript
// Update Firebase custom claims
await adminAuth.setCustomUserClaims(userId, {
  ...existingClaims,
  subActive: true,
  stripeCustomerId: customerId,
  subscriptionId: subscription.id,
})

// Update Firestore document
await userDoc.ref.update({
  subActive: true,
  stripeCustomerId: customerId,
  subscriptionStatus: 'active',
})
```

### Customer Portal Integration

**Portal Access** (`/src/app/api/stripe/portal/route.ts`):
- Authenticated users can manage subscriptions
- Direct integration with Stripe customer portal
- Automatic return URL configuration

### Stripe Configuration (`/src/lib/stripe/config.ts`)

**Environment-based Configuration**:
```typescript
export const STRIPE_CONFIG = {
  SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO!,
}
```

---

## 7. Job Management System

### Current Implementation Status

**Status**: Architecture defined, implementation pending
**Data Models**: Complete with Zod validation
**API Endpoints**: Planned (not implemented)
**Security Rules**: Defined in firestore.rules

### Job Data Model (`/src/types/job.ts`)

```typescript
export const jobSchema = z.object({
  id: z.string().optional(),                    // Firestore doc.id
  ownerId: z.string().min(1),                   // Job poster's user ID
  title: z.string().trim().min(5).max(100),
  company: z.string().trim().min(2).max(100),
  description: z.string().trim().min(50).max(5000),
  type: z.enum(['full-time', 'part-time', 'contract', 'freelance']),
  location: z.string().trim().min(2).max(120),
  remote: z.boolean().default(false),
  salary: jobCompensationSchema.optional(),      // Min/max with currency
  requirements: z.array(z.string()).max(25).optional(),
  skills: z.array(z.string()).max(30).optional(),
  experience: z.enum(['entry', 'mid', 'senior', 'lead']).optional(),
  status: z.enum(['draft', 'published', 'closed']).default('draft'),
  viewCount: z.number().int().nonnegative().default(0),
  applicationCount: z.number().int().nonnegative().default(0),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  publishedAt: z.date().optional(),
  expiresAt: z.date().optional(),
})
```

### Planned API Endpoints

**Job CRUD Operations**:
- `POST /api/jobs` - Create new job (subscription required)
- `GET /api/jobs` - List all published jobs (public)
- `GET /api/jobs/[id]` - Get job details
- `PUT /api/jobs/[id]` - Update job (owner only)
- `DELETE /api/jobs/[id]` - Delete job (owner only)

### Authorization and Subscription Checks

**Firestore Security Rules**:
```javascript
// Only subscription holders can create jobs
allow create: if isAuthenticated() &&
                 hasActiveSubscription() &&
                 request.resource.data.ownerId == request.auth.uid;

// Anyone can read published jobs
allow read: if resource.data.status == 'published' ||
               isOwner(resource.data.ownerId);
```

### Job Filtering and Pagination

**Planned Query Capabilities**:
- Filter by job type (full-time, part-time, contract, freelance)
- Filter by location and remote work options
- Filter by experience level
- Salary range filtering
- Full-text search (future: Algolia integration)
- Pagination with cursor-based navigation

---

## 8. Application Workflow System

### Application Data Model (`/src/types/application.ts`)

```typescript
export const applicationSchema = z.object({
  id: z.string().optional(),
  jobId: z.string().min(1),                     // Reference to job
  seekerId: z.string().min(1),                  // Applicant's user ID
  ownerId: z.string().min(1),                   // Job owner's user ID (denormalized)
  status: z.enum(['pending', 'reviewed', 'accepted', 'rejected']),
  coverLetter: z.string().trim().min(10).max(2000).optional(),
  resumeUrl: z.string().url().optional(),       // Cloud Storage URL
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
})
```

### Application Submission Process

**Planned Flow**:
1. Seeker views job details
2. Clicks "Apply" button (authentication required)
3. Fills application form with cover letter
4. Optionally uploads resume to Firebase Storage
5. Application submitted via `POST /api/jobs/[id]/apply`
6. Owner receives notification (future feature)

### Status Tracking and Updates

**Application Lifecycle**:
- `pending` - Initial submission state
- `reviewed` - Owner has viewed application
- `accepted` - Offer extended
- `rejected` - Application declined

**Status Update Authority**:
- **Job Owners**: Can update any application status for their jobs
- **Job Seekers**: Can withdraw applications (delete operation)
- **System**: Automatically sets to 'pending' on creation

### Owner/Seeker Perspectives

**Owner Dashboard View**:
- All applications for posted jobs
- Application count per job
- Quick status update actions
- Applicant contact information

**Seeker Dashboard View**:
- All submitted applications
- Application status tracking
- Job details for applied positions
- Withdrawal capability

---

## 9. Data Models & Type Definitions

### Complete Type System (`/src/types/`)

**User-Related Types**:
```typescript
// From AuthContext
export type UserRole = 'owner' | 'seeker'

export interface AppUser extends Omit<User, 'displayName' | 'email'> {
  role?: UserRole
  displayName: string | null
  email: string | null
}
```

**Job-Related Types** (`/src/types/job.ts`):
```typescript
export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance'
export type JobStatus = 'draft' | 'published' | 'closed'
export type CompensationPeriod = 'hourly' | 'monthly' | 'yearly'

export interface JobCompensation {
  min?: number
  max?: number
  currency: string        // ISO 3-letter code
  period: CompensationPeriod
}

export type Job = z.infer<typeof jobSchema>
export type JobFormValues = z.infer<typeof jobFormSchema>
```

**Application-Related Types** (`/src/types/application.ts`):
```typescript
export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected'

export type Application = z.infer<typeof applicationSchema>
export type ApplicationFormValues = z.infer<typeof applicationFormSchema>
```

### Zod Schemas for Validation

**Runtime Validation Benefits**:
- Type safety at runtime
- Form validation with error messages
- API request/response validation
- Database document validation

**Example Validation Usage**:
```typescript
// In API route handlers
const validatedData = jobSchema.parse(requestBody)

// In React Hook Form
const form = useForm<JobFormValues>({
  resolver: zodResolver(jobFormSchema),
  defaultValues: defaultJobFormValues,
})
```

### Firestore Document Structures

**Users Collection** (`/users/{userId}`):
```typescript
{
  uid: string
  email: string
  displayName: string
  role: 'owner' | 'seeker'
  subActive: boolean                    // Subscription status
  stripeCustomerId?: string             // Linked after checkout
  subscriptionId?: string               // Active subscription ID
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

**Jobs Collection** (`/jobs/{jobId}`):
```typescript
{
  ownerId: string                       // User ID of job poster
  title: string
  company: string
  description: string
  type: JobType
  location: string
  remote: boolean
  salary?: JobCompensation
  requirements?: string[]
  skills?: string[]
  experience?: 'entry' | 'mid' | 'senior' | 'lead'
  status: JobStatus
  viewCount: number
  applicationCount: number
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt?: Timestamp
  expiresAt?: Timestamp
}
```

**Applications Collection** (`/applications/{applicationId}`):
```typescript
{
  jobId: string                         // Reference to job document
  seekerId: string                      // Applicant user ID
  ownerId: string                       // Job owner user ID (denormalized)
  status: ApplicationStatus
  coverLetter?: string
  resumeUrl?: string                    // Firebase Storage URL
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

---

## 10. API Routes Documentation

### Current API Endpoints (11 total)

**Health & Monitoring**:
- `GET /api/health` - Service health check with Firebase and Stripe connectivity

**User Management**:
- `POST /api/users/initialize-claims` - Initialize custom claims after signup

**Stripe Integration**:
- `POST /api/stripe/checkout` - Create subscription checkout session
- `POST /api/stripe/webhook` - Process Stripe webhook events
- `POST /api/stripe/portal` - Create customer portal session

**Job Management** (Planned):
- `GET /api/jobs` - List published jobs (public)
- `POST /api/jobs` - Create job (subscription required)
- `GET /api/jobs/[id]` - Get job details
- `PUT /api/jobs/[id]` - Update job (owner only)
- `DELETE /api/jobs/[id]` - Delete job (owner only)

**Application Management** (Planned):
- `POST /api/jobs/[id]/apply` - Submit application
- `GET /api/applications` - List applications (role-based)
- `GET /api/applications/[id]` - Get application details
- `PUT /api/applications/[id]` - Update application status (owner only)

### Authentication Patterns

**Request Authentication**:
```typescript
// Extract and verify Firebase ID token
const token = request.headers.get('authorization')?.replace('Bearer ', '')
const decodedToken = await adminAuth.verifyIdToken(token)
const userId = decodedToken.uid
```

**Role-Based Authorization**:
```typescript
// Check user role from custom claims
const hasRole = (role: string) => decodedToken.role === role
const hasSubscription = () => decodedToken.subActive === true
```

### Error Handling Approach

**Standardized Error Responses**:
```typescript
// Authentication errors
return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// Validation errors
return NextResponse.json({ error: 'Invalid request data', details: errors }, { status: 400 })

// Not found errors
return NextResponse.json({ error: 'Resource not found' }, { status: 404 })

// Server errors
return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
```

**Request Validation Pattern**:
```typescript
// Validate request body with Zod
try {
  const validatedData = jobSchema.parse(await request.json())
} catch (error) {
  return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 })
}
```

---

## 11. UI Components Catalog

### Page Components

**Authentication Pages**:
- `/app/(auth)/login/page.tsx` - Login form with email/password and Google OAuth
- `/app/(auth)/signup/page.tsx` - Signup form with role selection

**Dashboard Pages**:
- `/app/dashboard/page.tsx` - Unified dashboard with role-based routing
- `/app/dashboard/owner/page.tsx` - Owner-specific dashboard (job management)
- `/app/dashboard/seeker/page.tsx` - Seeker-specific dashboard (applications)

**Job-Related Pages**:
- `/app/jobs/page.tsx` - Public job listing page
- `/app/jobs/[id]/page.tsx` - Job detail view
- `/app/jobs/new/page.tsx` - Job creation form (owner + subscription)
- `/app/jobs/[id]/edit/page.tsx` - Job editing form (owner only)

**Subscription Page**:
- `/app/subscribe/page.tsx` - Subscription landing page with Stripe checkout

### Reusable UI Components

**Job-Related Components**:
```typescript
// Job display card for listings
<JobCard 
  job={job} 
  showActions={isOwner}
  onEdit={() => router.push(`/jobs/${job.id}/edit`)}
  onDelete={handleDelete}
/>

// Comprehensive job form for create/edit
<JobForm 
  initialValues={job}
  mode="create" | "edit"
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

**Application Components**:
```typescript
// Application card for dashboards
<ApplicationCard 
  application={application}
  viewMode="owner" | "seeker"
  onStatusUpdate={handleStatusUpdate}
/>

// Application detail modal
<ApplicationDetailDialog 
  application={application}
  open={isOpen}
  onClose={() => setOpen(false)}
  onStatusChange={handleStatusChange}
/>
```

### shadcn/ui Components Used

**Form Components**:
- `Button` - Primary and secondary action buttons
- `Input` - Text input fields with validation
- `Textarea` - Multi-line text areas
- `Label` - Accessible form labels
- `Form` - Form wrapper with React Hook Form integration

**Layout Components**:
- `Card` - Content containers with consistent styling
- `Dialog` - Modal dialogs for detailed views
- `Badge` - Status indicators and tags

**Notification Components**:
- `Sonner` - Toast notifications via Toaster component

### Component Organization Patterns

**File Structure**:
```
components/
├── ui/                    # shadcn/ui base components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   └── dialog.tsx
├── job-card.tsx          # Job-specific display component
├── job-form.tsx          # Job creation/editing form
├── application-card.tsx   # Application display component
└── application-detail-dialog.tsx  # Application detail modal
```

**Naming Conventions**:
- Base UI components: lowercase (button.tsx)
- Feature components: kebab-case (job-card.tsx)
- Compound components: descriptive names (application-detail-dialog.tsx)

---

## 12. Data Flow Diagrams

### User Signup → Subscription → Job Posting Flow

```
1. User Signup
   ├─ Email/Password or Google OAuth
   ├─ Role Selection (Owner/Seeker)
   ├─ Firebase Auth User Creation
   ├─ Firestore User Document Creation
   └─ Custom Claims Initialization

2. Subscription Flow (Owner Only)
   ├─ Navigate to /subscribe
   ├─ Click "Subscribe Now"
   ├─ Stripe Checkout Session Creation
   ├─ Payment Processing
   ├─ Webhook Event (checkout.session.completed)
   ├─ Firebase Custom Claims Update (subActive: true)
   └─ Firestore Document Update

3. Job Posting Access
   ├─ Protected Route Verification
   ├─ Subscription Status Check (custom claims)
   ├─ Job Form Access Granted
   ├─ Job Creation API Call
   └─ Job Published to Database
```

### Application Submission → Review → Status Update Flow

```
1. Application Submission
   ├─ Seeker Browse Jobs (/jobs)
   ├─ View Job Details (/jobs/[id])
   ├─ Click "Apply" Button
   ├─ Authentication Check
   ├─ Application Form Submission
   ├─ API Call (POST /api/jobs/[id]/apply)
   └─ Application Stored in Firestore

2. Owner Review Process
   ├─ Owner Dashboard Access
   ├─ View Applications List
   ├─ Open Application Details
   ├─ Review Cover Letter/Resume
   ├─ Status Update Decision
   └─ API Call (PUT /api/applications/[id])

3. Status Notification
   ├─ Firestore Document Update
   ├─ Real-time UI Update
   ├─ Seeker Dashboard Reflection
   └─ Optional Email Notification (future)
```

### Webhook → Custom Claims → Access Control Flow

```
1. Stripe Webhook Processing
   ├─ Webhook Event Received
   ├─ Signature Verification
   ├─ Event Type Identification
   ├─ Customer ID Resolution
   └─ User Document Lookup

2. Firebase Synchronization
   ├─ Custom Claims Update (adminAuth)
   ├─ Firestore Document Update
   ├─ Subscription Status Sync
   └─ Access Permission Granted

3. Client-Side Access Control
   ├─ Token Refresh (automatic)
   ├─ Custom Claims Validation
   ├─ UI Feature Enabling
   └─ Protected Route Access
```

---

## 13. Security Architecture

### Firestore Security Rules (`firestore.rules`)

**User Document Protection**:
```javascript
match /users/{userId} {
  allow read: if isAuthenticated();           // Any auth user can read users
  allow write: if isOwner(userId);            // Users can only edit own profile
}
```

**Job Access Control**:
```javascript
match /jobs/{jobId} {
  // Public read for published jobs, owner read for any status
  allow read: if resource.data.status == 'published' || 
                 isOwner(resource.data.ownerId);
  
  // Create requires subscription + ownership
  allow create: if isAuthenticated() && 
                   hasActiveSubscription() && 
                   request.resource.data.ownerId == request.auth.uid;
  
  // Update/delete requires ownership
  allow update, delete: if isOwner(resource.data.ownerId);
}
```

**Application Security**:
```javascript
match /applications/{applicationId} {
  // Seekers see own applications, owners see applications to their jobs
  allow read: if isOwner(resource.data.seekerId) || 
                 isOwner(resource.data.ownerId);
  
  // Only seekers can create applications
  allow create: if isAuthenticated() && 
                   request.resource.data.seekerId == request.auth.uid && 
                   getUserRole() == 'seeker';
  
  // Only job owners can update application status
  allow update: if isOwner(resource.data.ownerId);
  
  // Only seekers can delete their applications
  allow delete: if isOwner(resource.data.seekerId);
}
```

### API Route Protection Patterns

**Authentication Middleware Pattern**:
```typescript
// Verify Firebase ID token
const authHeader = request.headers.get('authorization')
if (!authHeader?.startsWith('Bearer ')) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

const token = authHeader.replace('Bearer ', '')
const decodedToken = await adminAuth.verifyIdToken(token)
```

**Role-Based Authorization**:
```typescript
// Check custom claims for role
if (decodedToken.role !== 'owner') {
  return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
}

// Check subscription status
if (!decodedToken.subActive) {
  return NextResponse.json({ error: 'Subscription required' }, { status: 402 })
}
```

### Stripe Webhook Signature Verification

**Raw Body Signature Validation**:
```typescript
// CRITICAL: Must use raw body for signature verification
const body = await request.text()
const signature = headers().get('stripe-signature')

let event
try {
  event = stripe.webhooks.constructEvent(
    body,
    signature,
    STRIPE_CONFIG.WEBHOOK_SECRET
  )
} catch (error) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
}
```

### Input Validation with Zod

**Request Body Validation**:
```typescript
// Validate all API inputs with Zod schemas
try {
  const validatedData = jobSchema.parse(await request.json())
} catch (error) {
  return NextResponse.json({ 
    error: 'Validation failed', 
    details: error.errors 
  }, { status: 400 })
}
```

**Form Validation**:
```typescript
// Client-side validation with React Hook Form + Zod
const form = useForm<JobFormValues>({
  resolver: zodResolver(jobFormSchema),
  mode: 'onBlur',
})
```

### Security Recommendations

**Current Security Features**:
- ✅ Firebase security rules for database access
- ✅ Role-based access control with custom claims
- ✅ Stripe webhook signature verification
- ✅ Server-side token verification
- ✅ Input validation with Zod schemas
- ✅ TypeScript strict mode for type safety

**Additional Security Measures Needed**:
- [ ] Rate limiting for API endpoints
- [ ] CSRF protection for state-changing operations
- [ ] Content Security Policy (CSP) headers
- [ ] Email verification for new accounts
- [ ] Firebase App Check for client verification
- [ ] Error monitoring and alerting
- [ ] Security headers (HSTS, X-Frame-Options, etc.)

---

## 14. Configuration & Environment

### Required Environment Variables

**Firebase Configuration**:
```bash
# Firebase Client SDK (public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcd1234

# Firebase Admin SDK (private)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Stripe Configuration**:
```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_...                    # Server-side operations
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...   # Client-side Stripe Elements

# Stripe Webhook & Products
STRIPE_WEBHOOK_SECRET=whsec_...                  # Webhook signature verification
STRIPE_PRICE_ID_PRO=price_...                    # Subscription price ID
```

**Application Configuration**:
```bash
# Application URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000        # Base URL for redirects
```

### Firebase Configuration Setup

**Client SDK** (`/src/lib/firebase/client.ts`):
```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}
```

**Admin SDK** (`/src/lib/firebase/admin.ts`):
```typescript
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  }),
})
```

### Stripe Configuration (`/src/lib/stripe/config.ts`)

```typescript
export const STRIPE_CONFIG = {
  SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  PRICE_ID_PRO: process.env.STRIPE_PRICE_ID_PRO!,
}
```

### Environment Validation Script

**Automated Validation** (`/scripts/validate-env.js`):
- Checks all required environment variables
- Validates Firebase configuration format
- Tests Stripe API key format
- Provides helpful error messages for missing values

**Usage**:
```bash
npm run validate-env
```

---

## 15. Development Workflow

### Available npm Scripts

```bash
# Development
npm run dev                    # Start development server with Turbopack
npm run build                  # Build for production
npm start                     # Start production server

# Code Quality
npm run lint                   # Run ESLint checks

# Utilities
npm run validate-env          # Validate environment variables
npm run create-user           # Create test users in Firebase
```

### Utility Scripts (`/scripts/`)

**Environment Validation** (`validate-env.js`):
- Comprehensive environment variable checking
- Firebase connection testing
- Stripe configuration validation
- Clear error reporting

**User Creation** (`create-user.js`):
- Create test users for development
- Automatically assign roles
- Set up test subscriptions
- Useful for end-to-end testing

**Firebase Testing** (`test-firebase-admin.cjs`):
- Test Firebase Admin SDK connectivity
- Validate service account credentials
- Test custom claims functionality

**End-to-End Verification** (`verify-end-to-end.js`):
- Complete system health check
- Test authentication flow
- Verify subscription integration
- Test API endpoint functionality

### Development Environment Setup

**Prerequisites**:
- Node.js 18+
- npm (included with Node.js)
- Firebase project with Authentication and Firestore
- Stripe account with test mode enabled

**Quick Setup Process**:
1. Clone repository and install dependencies
2. Copy `.env.local.template` to `.env.local`
3. Configure Firebase credentials
4. Configure Stripe credentials
5. Run `npm run validate-env` to verify setup
6. Start development server with `npm run dev`

### Testing Approaches

**Manual Testing Workflow**:
1. Authentication flows (signup, login, Google OAuth)
2. Subscription integration (checkout, webhooks)
3. Role-based access control
4. API endpoint functionality
5. UI component behavior

**Automated Testing** (Future):
- Jest for unit tests
- Playwright for end-to-end tests
- Firebase emulator for integration tests
- Stripe CLI for webhook testing

---

## 16. Known Issues & Current State

### Implementation Status Summary

**Complete Features** (Production-ready):
- ✅ Authentication system with Firebase Auth
- ✅ Role-based user management (owner/seeker)
- ✅ Stripe subscription integration
- ✅ Webhook processing and custom claims
- ✅ Development tooling and build system
- ✅ Type system and validation schemas

**Missing Core Features** (Architecture ready):
- ❌ Job posting CRUD operations
- ❌ Job application workflow
- ❌ Dashboard implementations
- ❌ Search and filtering capabilities

### Non-Critical Known Issues

**1. Subscribe Page Client-Side Error**:
```
Error: Neither apiKey nor config.authenticator provided
```
- **Cause**: Missing `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Impact**: Subscribe page UI won't render properly
- **Status**: Expected - requires Stripe publishable key configuration
- **Workaround**: Server-side Stripe integration works correctly

**2. Google OAuth Configuration**:
- **Issue**: Google sign-in requires Firebase Console configuration
- **Impact**: Google authentication button will fail
- **Workaround**: Email/password authentication works perfectly
- **Status**: Configuration step, not a bug

**3. Email Verification Disabled**:
- **Issue**: Users not required to verify email addresses
- **Impact**: Potential for invalid email signups
- **Status**: Optional feature for MVP
- **Future**: Add email verification requirement

### Current Limitations

**Job Board Functionality**:
- No job posting interface
- No job browsing capability
- No application submission workflow
- No dashboard views

**Search and Discovery**:
- No search functionality
- No filtering capabilities
- No job categorization
- No recommendation system

**Administrative Features**:
- No user management interface
- No analytics dashboard
- No content moderation tools
- No reporting capabilities

### Deployment Readiness

**Production-Ready Components**:
- Authentication infrastructure
- Subscription processing
- Database security rules
- API authentication patterns
- Build and deployment configuration

**Pre-Launch Requirements**:
- Implement core job board features
- Complete end-to-end testing
- Configure production environment variables
- Set up production Stripe webhooks
- Deploy Firestore security rules

---

## 17. Code Quality & Best Practices

### TypeScript Configuration

**Strict Mode Enabled** (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**Benefits Realized**:
- Complete type safety throughout codebase
- Compile-time error detection
- Enhanced IDE support and autocomplete
- Reduced runtime errors
- Better code documentation through types

### Error Handling Patterns

**Consistent Error Response Format**:
```typescript
// API routes error handling
try {
  // Operation logic
} catch (error) {
  console.error('Operation failed:', error)
  return NextResponse.json(
    { error: 'User-friendly message', details: error.message },
    { status: appropriate_status_code }
  )
}
```

**Client-Side Error Handling**:
```typescript
// React component error boundaries
const { error, clearError } = useAuth()

// Display user-friendly error messages
if (error) {
  return <ErrorMessage message={error} onClose={clearError} />
}
```

### Code Organization Principles

**Separation of Concerns**:
- **Data Layer**: Firestore operations isolated in API routes
- **Business Logic**: Zod schemas for validation and type safety
- **UI Layer**: React components focused on presentation
- **Configuration**: Environment-based configuration management

**Single Responsibility**:
- Each component has one clear purpose
- API routes handle single operations
- Utility functions are focused and reusable
- Type definitions are comprehensive and specific

**DRY (Don't Repeat Yourself)**:
- Shared UI components through shadcn/ui
- Reusable validation schemas
- Common authentication patterns
- Centralized configuration management

### Testing Philosophy

**Current Approach**:
- Manual testing for critical user flows
- Environment validation scripts
- Health check endpoints for monitoring
- Type safety as compile-time testing

**Future Testing Strategy**:
- Unit tests for utility functions
- Integration tests for API endpoints
- End-to-end tests for user workflows
- Visual regression testing for UI components

### Documentation Standards

**Comprehensive Code Documentation**:
- JSDoc comments for complex functions
- Type annotations for all interfaces
- Clear naming conventions
- Inline comments for business logic

**Architecture Documentation**:
- This comprehensive codebase overview
- API documentation with examples
- Security architecture explanations
- Development workflow documentation

---

## 18. Future Improvements & Recommendations

### Performance Optimization Opportunities

**Next.js Optimizations**:
- Implement Server Components for static job listings
- Add ISR (Incremental Static Regeneration) for job pages
- Optimize image loading with Next.js Image component
- Implement code splitting for dashboard routes

**Database Optimizations**:
- Add Firestore composite indexes for complex queries
- Implement caching strategy for frequently accessed data
- Optimize security rules for performance
- Consider read replicas for high-traffic queries

**Frontend Performance**:
- Implement virtual scrolling for large job lists
- Add progressive loading for job images
- Optimize bundle size with dynamic imports
- Implement service worker for offline functionality

### Security Enhancements

**Authentication Improvements**:
- Add email verification requirement
- Implement session timeout management
- Add device management and logout from all devices
- Implement suspicious activity detection

**API Security**:
- Add rate limiting with Redis or memory cache
- Implement CSRF protection for state-changing operations
- Add API key management for external integrations
- Implement request/response logging for audit trails

**Infrastructure Security**:
- Add Content Security Policy (CSP) headers
- Implement Firebase App Check for client verification
- Add security headers (HSTS, X-Frame-Options)
- Implement automated security scanning

### Feature Additions

**Core Job Board Features** (Priority: High):
1. **Job Management System**: Complete CRUD operations for job postings
2. **Application Workflow**: Full application submission and review process
3. **Dashboard Views**: Role-based dashboards with analytics
4. **Search & Filtering**: Advanced job discovery capabilities

**Enhanced User Experience** (Priority: Medium):
- Job saved/bookmarking functionality
- Email notifications for application status changes
- Real-time chat between employers and candidates
- Job recommendation engine based on user behavior
- Advanced search with location-based filtering

**Administrative Features** (Priority: Low):
- Admin dashboard for platform management
- User analytics and reporting
- Content moderation tools
- Bulk operations for job management
- Integration with external job boards

### Technical Debt Management

**Code Refactoring Opportunities**:
- Extract common API patterns into middleware
- Create reusable hooks for data fetching
- Implement consistent loading and error states
- Standardize form handling patterns

**Architecture Improvements**:
- Consider implementing server-side state management (React Query)
- Add proper error boundaries for component error handling
- Implement proper logging and monitoring
- Add comprehensive test coverage

### Scalability Considerations

**Database Scaling**:
- Implement database sharding strategy for large datasets
- Add read replicas for geographic distribution
- Consider migrating to Firestore multi-region setup
- Implement data archiving for old job postings

**Application Scaling**:
- Implement proper CDN for static assets
- Add horizontal scaling with load balancers
- Consider microservices architecture for large features
- Implement proper caching strategies

**Monitoring and Observability**:
- Add application performance monitoring (APM)
- Implement error tracking with Sentry
- Add business metrics tracking
- Set up alerting for critical system failures

### Integration Opportunities

**Third-Party Services**:
- Integrate with LinkedIn for professional profiles
- Add Indeed/Glassdoor job import capabilities
- Implement Slack/Teams notifications
- Add calendar integration for interview scheduling

**API Extensions**:
- Create public API for job board integration
- Add webhook system for external integrations
- Implement OAuth for third-party applications
- Add bulk import/export capabilities

### Business Intelligence

**Analytics Implementation**:
- User behavior tracking and analysis
- Job posting performance metrics
- Application conversion funnel analysis
- Revenue and subscription analytics

**Reporting Features**:
- Employer analytics dashboard
- Platform usage statistics
- Financial reporting and forecasting
- User engagement metrics

---

## Conclusion

ShopMatch Pro represents a solid foundation for a modern job board platform. The authentication and subscription infrastructure is production-ready, providing a secure and scalable base for building the core job board features.

**Key Strengths**:
- Modern technology stack with Next.js 15 and React 19
- Comprehensive type safety with TypeScript strict mode
- Secure authentication and subscription management
- Well-designed database schema and security rules
- Excellent developer experience with fast builds and hot reload

**Next Steps for Completion**:
1. Implement job management CRUD operations
2. Build application submission and review workflow
3. Create role-based dashboard interfaces
4. Add search and filtering capabilities
5. Complete end-to-end testing and deployment

The architecture is designed to handle enterprise-scale requirements while maintaining developer productivity and code quality. All major technical decisions are documented and justified, making it easy for new developers to understand and contribute to the codebase.

**Estimated Time to MVP Completion**: 4-6 weeks for a single developer
**Recommended Team Size**: 2-3 developers for faster completion
**Production Readiness**: Infrastructure ready, core features pending implementation

---

*This document serves as the single source of truth for ShopMatch Pro's architecture, implementation details, and future roadmap. It should be updated as the project evolves and new features are implemented.*
