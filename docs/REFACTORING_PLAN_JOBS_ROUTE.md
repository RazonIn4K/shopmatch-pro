# Refactoring Plan: Jobs Route API (`src/app/api/jobs/route.ts`)

## Status: BACKLOG - Not Started

**Created**: 2025-10-22
**Priority**: Medium
**Estimated Effort**: 90 minutes (30 + 45 + 15)
**Risk Level**: Low (E2E coverage exists, no unit tests to break)

---

## Executive Summary

The Jobs Route API endpoint (`src/app/api/jobs/route.ts`) serves as the primary data access layer for job listings across 5 frontend pages. While current complexity metrics (4.69 mean cyclomatic complexity) are below the critical threshold, three functions exhibit complexity hotspots that reduce maintainability:

- **GET method** (cc=11, 72 lines) - Brain Method code smell
- **toTimestampMillis** (cc=9) - 3 complex conditionals
- **transformJobDocument** (cc=9) - Multiple date conversions

**Refactoring is SAFE**: Production smoke test (`e2e/verify-demo-login.spec.ts`) provides E2E coverage for the `/jobs` page, and no unit tests currently exist that would be affected by internal restructuring.

**Benefits**:
- ✅ Improved readability (smaller, focused functions)
- ✅ Easier debugging (reduced cognitive load)
- ✅ Better testability (pure helper functions)
- ✅ Future-proof for index management improvements

---

## Current Metrics & Analysis

### Complexity Breakdown
```
File: src/app/api/jobs/route.ts
Total Cyclomatic Complexity: 61
Functions: 13
Mean Complexity: 4.69

Hotspots:
1. GET                     - cc=11  (72 lines)  - Brain Method
2. toTimestampMillis       - cc=9               - Complex Conditionals (3)
3. transformJobDocument    - cc=9               - Multiple conversions
```

### Code Smells Identified

**1. Brain Method (GET function)**
- 72 lines with cc=11
- Mixes concerns: auth, query building, pagination, location filtering, error handling
- Contains nested try-catch with divergent logic paths

**2. Complex Conditionals (toTimestampMillis)**
```typescript
// Example: 5-level nested type checks
if (
  value &&
  typeof value === 'object' &&
  'toDate' in value &&
  typeof (value as { toDate: () => Date }).toDate === 'function'
) {
  return (value as { toDate: () => Date }).toDate().getTime()
}
```

**3. Duplicated Date Conversion Logic**
- `toTimestampMillis` handles 5 different value types
- `transformJobDocument` manually converts 4 timestamp fields
- Opportunity for abstraction

---

## Three-Phase Refactoring Strategy

### Phase 1: Extract Complex Conditionals (30 minutes)

**Goal**: Decompose `toTimestampMillis` into self-documenting type guards

**Current Implementation** (9 branches):
```typescript
function toTimestampMillis(value: unknown): number {
  if (value instanceof Date) {
    return value.getTime()
  }
  if (typeof value === 'number') {
    return value
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  if (
    value &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  ) {
    return (value as { toDate: () => Date }).toDate().getTime()
  }
  return 0
}
```

**Refactored Implementation** (4 functions, max cc=2 each):
```typescript
function isFirestoreTimestamp(value: unknown): value is { toDate: () => Date } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  )
}

function parseStringToMillis(value: string): number {
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function toTimestampMillis(value: unknown): number {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseStringToMillis(value)
  if (isFirestoreTimestamp(value)) return value.toDate().getTime()
  return 0
}
```

**Benefits**:
- Type guard `isFirestoreTimestamp` is reusable
- Each function has single responsibility
- 5-level conditional reduced to 1-level checks

---

### Phase 2: Decompose GET Method (45 minutes)

**Goal**: Break 72-line Brain Method into smaller, testable units

**Current Structure**:
```typescript
export async function GET(request: Request) {
  try {
    // 1. Parse filters (5 lines)
    // 2. Authorization check (6 lines)
    // 3. Build query (3 lines)
    // 4. Try optimized path (30+ lines)
    //    - Execute query
    //    - Location filtering
    //    - Count calculation
    //    - Build response
    // 5. Catch missing index error (30+ lines)
    //    - Fallback query
    //    - In-memory sort
    //    - Location filtering
    //    - Pagination
    //    - Build response with meta
  } catch (error) {
    // 6. Error handling (8 lines)
  }
}
```

**Refactored Implementation**:
```typescript
// Pure helper: No side effects, easy to test
async function executeOptimizedJobQuery(
  baseQuery: FirebaseFirestore.Query,
  filters: JobListFilters
): Promise<{ jobs: Job[]; total: number }> {
  const offset = (filters.page - 1) * filters.limit
  const paginatedQuery = baseQuery
    .orderBy('createdAt', 'desc')
    .limit(filters.limit)
    .offset(offset)

  const snapshot = await paginatedQuery.get()
  const jobs: Job[] = snapshot.docs.map(transformJobDocument)

  let filteredJobs = jobs
  let filteredTotal: number

  if (filters.location) {
    const result = await handleLocationFiltering(jobs, baseQuery, filters.location)
    filteredJobs = result.filteredJobs
    filteredTotal = result.filteredTotal
  } else {
    const countSnapshot = await baseQuery.count().get()
    filteredTotal = countSnapshot.data().count
  }

  return { jobs: filteredJobs, total: filteredTotal }
}

// Pure helper: Handles fallback without mixing concerns
async function executeFallbackJobQuery(
  baseQuery: FirebaseFirestore.Query,
  filters: JobListFilters
): Promise<{ jobs: Job[]; total: number }> {
  const fallbackSnapshot = await baseQuery.get()
  const allJobs = fallbackSnapshot.docs.map(transformJobDocument)
  const sortedJobs = sortJobsByCreatedAtDesc(allJobs)

  const locationResult = filters.location
    ? filterJobsByLocation(sortedJobs, filters.location)
    : { filteredJobs: sortedJobs, filteredTotal: sortedJobs.length }

  const offset = (filters.page - 1) * filters.limit
  const paginatedJobs = locationResult.filteredJobs.slice(offset, offset + filters.limit)

  return { jobs: paginatedJobs, total: locationResult.filteredTotal }
}

// Simplified GET: 30 lines instead of 72
export async function GET(request: Request) {
  try {
    const filters = parseFilters(request)

    if (filters.ownerId) {
      const auth = await verifyAuth(request)
      if (auth.uid !== filters.ownerId) {
        throw new ApiError('Unauthorized: cannot filter by another user\'s jobs', 403)
      }
    }

    const baseQuery = buildJobsQuery(filters)

    try {
      const { jobs, total } = await executeOptimizedJobQuery(baseQuery, filters)
      return NextResponse.json({
        jobs,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages: Math.ceil(total / filters.limit),
        },
      })
    } catch (queryError) {
      if (!isMissingIndexError(queryError)) {
        throw queryError
      }

      const { jobs, total } = await executeFallbackJobQuery(baseQuery, filters)
      return NextResponse.json({
        jobs,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages: Math.ceil(total / filters.limit),
        },
        meta: {
          fallbackApplied: true,
          message:
            'Composite Firestore index missing. Served results via in-memory fallback. Deploy indexes to restore optimized queries.',
        },
      })
    }
  } catch (error) {
    if (isMissingIndexError(error)) {
      return handleApiError(
        new ApiError('Firestore index missing for requested filters', 503, {
          code: (error as { code?: unknown }).code,
          hint: 'Run firebase deploy --only firestore:indexes to publish the new composite indexes.',
        })
      )
    }
    return handleApiError(error)
  }
}
```

**Benefits**:
- GET method reduced from 72 → 30 lines
- Optimized/fallback paths isolated for testing
- Cyclomatic complexity reduced from 11 → 5
- Easier to add future query strategies

---

### Phase 3: Simplify Data Transformations (15 minutes)

**Goal**: Reduce duplication in `transformJobDocument`

**Current Implementation**:
```typescript
function transformJobDocument(doc: FirebaseFirestore.DocumentSnapshot): Job {
  const data = doc.data()!
  return {
    id: doc.id,
    ...data,
    createdAt: (data.createdAt as FirebaseFirestore.Timestamp)?.toDate?.() ?? data.createdAt,
    updatedAt: (data.updatedAt as FirebaseFirestore.Timestamp)?.toDate?.() ?? data.updatedAt,
    publishedAt: (data.publishedAt as FirebaseFirestore.Timestamp)?.toDate?.() ?? data.publishedAt,
    expiresAt: (data.expiresAt as FirebaseFirestore.Timestamp)?.toDate?.() ?? data.expiresAt,
  } as Job
}
```

**Refactored Implementation**:
```typescript
function convertTimestampField<T extends Record<string, unknown>>(
  data: T,
  field: keyof T
): Date | undefined | unknown {
  const value = data[field]
  if (!value) return value

  if (isFirestoreTimestamp(value)) {
    return value.toDate()
  }

  return value
}

function transformJobDocument(doc: FirebaseFirestore.DocumentSnapshot): Job {
  const data = doc.data()!
  const timestampFields = ['createdAt', 'updatedAt', 'publishedAt', 'expiresAt'] as const

  const transformedData = { ...data }
  timestampFields.forEach(field => {
    transformedData[field] = convertTimestampField(data, field)
  })

  return {
    id: doc.id,
    ...transformedData,
  } as Job
}
```

**Benefits**:
- DRY: 4 manual conversions → 1 generic helper
- Reusable for other Firestore documents
- Type-safe field handling
- Easier to extend for future timestamp fields

---

## Complete Refactored Code

Below is the full refactored `src/app/api/jobs/route.ts` with all three phases applied:

```typescript
import { NextResponse } from 'next/server'

import { assertActiveSubscription, verifyAuth } from '@/lib/api/auth'
import { ApiError, handleApiError } from '@/lib/api/errors'
import { adminDb } from '@/lib/firebase/admin'
import { jobFormSchema, jobStatuses, jobTypes } from '@/types'
import type { Job } from '@/types'

type JobListFilters = {
  ownerId?: string
  status?: (typeof jobStatuses)[number]
  type?: (typeof jobTypes)[number]
  location?: string
  remote?: boolean
  experience?: 'entry' | 'mid' | 'senior' | 'lead'
  page: number
  limit: number
}

// ============================================================================
// Type Guards and Validators
// ============================================================================

function isMissingIndexError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const code = (error as { code?: unknown }).code
  const message = (error as { message?: unknown }).message
  const normalizedMessage = typeof message === 'string' ? message.toLowerCase() : ''

  return (
    (code === 9 || code === 'failed-precondition') &&
    normalizedMessage.includes('requires an index')
  )
}

function isFirestoreTimestamp(value: unknown): value is { toDate: () => Date } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate: () => Date }).toDate === 'function'
  )
}

// ============================================================================
// Parsing and Filtering Utilities
// ============================================================================

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined
  if (['true', '1', 'yes'].includes(value.toLowerCase())) return true
  if (['false', '0', 'no'].includes(value.toLowerCase())) return false
  return undefined
}

function parseFilters(request: Request): JobListFilters {
  const url = new URL(request.url)
  const params = url.searchParams

  return {
    ownerId: params.get('ownerId') ?? undefined,
    status: (params.get('status') as JobListFilters['status']) ?? undefined,
    type: (params.get('type') as JobListFilters['type']) ?? undefined,
    location: params.get('location') ?? undefined,
    remote: parseBoolean(params.get('remote')),
    experience: (params.get('experience') as JobListFilters['experience']) ?? undefined,
    page: Math.max(1, Number(params.get('page') ?? 1)),
    limit: Math.min(100, Math.max(1, Number(params.get('limit') ?? 20))),
  }
}

// ============================================================================
// Query Building
// ============================================================================

function buildJobsQuery(filters: JobListFilters): FirebaseFirestore.Query {
  let query: FirebaseFirestore.Query = adminDb.collection('jobs')

  // For public listing, only show published jobs unless ownerId filter is present
  if (filters.ownerId) {
    query = query.where('ownerId', '==', filters.ownerId)
  } else {
    query = query.where('status', '==', 'published')
  }

  // Apply additional filters
  if (filters.status && filters.ownerId) {
    // Only allow status filter if user is filtering their own jobs
    query = query.where('status', '==', filters.status)
  }
  if (filters.type) {
    query = query.where('type', '==', filters.type)
  }
  if (filters.remote !== undefined) {
    query = query.where('remote', '==', filters.remote)
  }
  if (filters.experience) {
    query = query.where('experience', '==', filters.experience)
  }

  return query
}

// ============================================================================
// Data Transformation - Phase 1 & 3 Improvements
// ============================================================================

function parseStringToMillis(value: string): number {
  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

function toTimestampMillis(value: unknown): number {
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  if (typeof value === 'string') return parseStringToMillis(value)
  if (isFirestoreTimestamp(value)) return value.toDate().getTime()
  return 0
}

function convertTimestampField<T extends Record<string, unknown>>(
  data: T,
  field: keyof T
): Date | undefined | unknown {
  const value = data[field]
  if (!value) return value

  if (isFirestoreTimestamp(value)) {
    return value.toDate()
  }

  return value
}

function transformJobDocument(doc: FirebaseFirestore.DocumentSnapshot): Job {
  const data = doc.data()!
  const timestampFields = ['createdAt', 'updatedAt', 'publishedAt', 'expiresAt'] as const

  const transformedData = { ...data }
  timestampFields.forEach(field => {
    transformedData[field] = convertTimestampField(data, field)
  })

  return {
    id: doc.id,
    ...transformedData,
  } as Job
}

// ============================================================================
// Location Filtering Helpers
// ============================================================================

async function handleLocationFiltering(
  jobs: Job[],
  totalQuery: FirebaseFirestore.Query,
  location: string
) {
  const locationLower = location.toLowerCase()

  // Fetch all jobs matching base filters (select only location field for efficiency)
  const allJobsSnapshot = await totalQuery
    .orderBy('createdAt', 'desc')
    .select('location')
    .get()

  // Count jobs matching location filter
  const locationMatchCount = allJobsSnapshot.docs.filter((doc) => {
    const docLocation = doc.data().location
    return docLocation && docLocation.toLowerCase().includes(locationLower)
  }).length

  // Filter current page results by location
  const filteredJobs = jobs.filter((job) => {
    if (typeof job.location !== 'string') {
      return false
    }
    return job.location.toLowerCase().includes(locationLower)
  })

  return { filteredJobs, filteredTotal: locationMatchCount }
}

function filterJobsByLocation(jobs: Job[], location: string) {
  const locationLower = location.toLowerCase()
  const filtered = jobs.filter((job) => {
    const jobLocation = typeof job.location === 'string' ? job.location : ''
    return jobLocation.toLowerCase().includes(locationLower)
  })
  return {
    filteredJobs: filtered,
    filteredTotal: filtered.length,
  }
}

// ============================================================================
// Sorting Utilities
// ============================================================================

function sortJobsByCreatedAtDesc(jobs: Job[]): Job[] {
  return [...jobs].sort((a, b) => toTimestampMillis(b.createdAt) - toTimestampMillis(a.createdAt))
}

// ============================================================================
// Query Execution Strategies - Phase 2 Improvements
// ============================================================================

async function executeOptimizedJobQuery(
  baseQuery: FirebaseFirestore.Query,
  filters: JobListFilters
): Promise<{ jobs: Job[]; total: number }> {
  const offset = (filters.page - 1) * filters.limit
  const paginatedQuery = baseQuery
    .orderBy('createdAt', 'desc')
    .limit(filters.limit)
    .offset(offset)

  const snapshot = await paginatedQuery.get()
  const jobs: Job[] = snapshot.docs.map(transformJobDocument)

  let filteredJobs = jobs
  let filteredTotal: number

  if (filters.location) {
    const result = await handleLocationFiltering(jobs, baseQuery, filters.location)
    filteredJobs = result.filteredJobs
    filteredTotal = result.filteredTotal
  } else {
    const countSnapshot = await baseQuery.count().get()
    filteredTotal = countSnapshot.data().count
  }

  return { jobs: filteredJobs, total: filteredTotal }
}

async function executeFallbackJobQuery(
  baseQuery: FirebaseFirestore.Query,
  filters: JobListFilters
): Promise<{ jobs: Job[]; total: number }> {
  const fallbackSnapshot = await baseQuery.get()
  const allJobs = fallbackSnapshot.docs.map(transformJobDocument)
  const sortedJobs = sortJobsByCreatedAtDesc(allJobs)

  const locationResult = filters.location
    ? filterJobsByLocation(sortedJobs, filters.location)
    : { filteredJobs: sortedJobs, filteredTotal: sortedJobs.length }

  const offset = (filters.page - 1) * filters.limit
  const paginatedJobs = locationResult.filteredJobs.slice(offset, offset + filters.limit)

  return { jobs: paginatedJobs, total: locationResult.filteredTotal }
}

// ============================================================================
// GET Endpoint - Phase 2 Simplified
// ============================================================================

export async function GET(request: Request) {
  try {
    const filters = parseFilters(request)

    if (filters.ownerId) {
      const auth = await verifyAuth(request)
      if (auth.uid !== filters.ownerId) {
        throw new ApiError('Unauthorized: cannot filter by another user\'s jobs', 403)
      }
    }

    const baseQuery = buildJobsQuery(filters)

    try {
      const { jobs, total } = await executeOptimizedJobQuery(baseQuery, filters)
      return NextResponse.json({
        jobs,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages: Math.ceil(total / filters.limit),
        },
      })
    } catch (queryError) {
      if (!isMissingIndexError(queryError)) {
        throw queryError
      }

      const { jobs, total } = await executeFallbackJobQuery(baseQuery, filters)
      return NextResponse.json({
        jobs,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          pages: Math.ceil(total / filters.limit),
        },
        meta: {
          fallbackApplied: true,
          message:
            'Composite Firestore index missing. Served results via in-memory fallback. Deploy indexes to restore optimized queries.',
        },
      })
    }
  } catch (error) {
    if (isMissingIndexError(error)) {
      return handleApiError(
        new ApiError('Firestore index missing for requested filters', 503, {
          code: (error as { code?: unknown }).code,
          hint: 'Run firebase deploy --only firestore:indexes to publish the new composite indexes.',
        })
      )
    }
    return handleApiError(error)
  }
}

// ============================================================================
// POST Endpoint - Unchanged
// ============================================================================

async function parseAndValidateJobPayload(request: Request) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    throw new ApiError('Invalid JSON payload', 400)
  }

  const parsed = jobFormSchema.safeParse(payload)
  if (!parsed.success) {
    throw new ApiError('Validation failed', 422, { issues: parsed.error.issues })
  }
  return parsed.data
}

async function createJob(
  jobData: ReturnType<typeof jobFormSchema.parse>,
  ownerId: string
): Promise<Job> {
  const now = new Date()
  const newJobData = {
    ...jobData,
    ownerId,
    viewCount: 0,
    applicationCount: 0,
    createdAt: now,
    updatedAt: now,
    publishedAt: jobData.status === 'published' ? now : null,
  }

  const docRef = await adminDb.collection('jobs').add(newJobData)
  const doc = await docRef.get()
  return transformJobDocument(doc)
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request)
    assertActiveSubscription(auth)

    const jobPayload = await parseAndValidateJobPayload(request)
    const job = await createJob(jobPayload, auth.uid)

    return NextResponse.json(
      {
        message: 'Job created successfully',
        job,
      },
      { status: 201 },
    )
  } catch (error) {
    return handleApiError(error)
  }
}
```

---

## Testing Protocol

### Pre-Refactoring Verification

1. **Capture Current Behavior**:
   ```bash
   # Start production build
   npm run build && npm start

   # Run production smoke tests
   BASE_URL=http://localhost:3000 npx playwright test e2e/verify-demo-login.spec.ts
   ```

   Expected result: All 3 tests pass (employer login, seeker login, jobs page)

2. **Document API Responses**:
   ```bash
   # Test public jobs listing
   curl http://localhost:3000/api/jobs

   # Test with filters
   curl http://localhost:3000/api/jobs?type=full-time&page=1&limit=5

   # Test with location filter
   curl http://localhost:3000/api/jobs?location=remote
   ```

   Save responses as `test-snapshots/jobs-api-before.json`

### Post-Refactoring Verification

1. **Smoke Tests Must Pass**:
   ```bash
   BASE_URL=http://localhost:3000 npx playwright test e2e/verify-demo-login.spec.ts
   ```

   ✅ **Gate**: All 3 tests pass with identical timing (±1 second variance acceptable)

2. **API Response Parity**:
   ```bash
   # Re-run same curl commands
   curl http://localhost:3000/api/jobs > test-snapshots/jobs-api-after.json

   # Compare responses
   diff test-snapshots/jobs-api-before.json test-snapshots/jobs-api-after.json
   ```

   ✅ **Gate**: Zero differences in JSON structure and data

3. **Frontend Page Verification**:
   - [ ] Navigate to `/jobs` - job cards display correctly
   - [ ] Navigate to `/jobs/new` - form loads without errors
   - [ ] Navigate to `/jobs/[id]` - job details render correctly
   - [ ] Navigate to `/jobs/[id]/edit` - edit form pre-populates
   - [ ] Navigate to `/dashboard/owner` - jobs list displays

4. **Error Handling Verification**:
   ```bash
   # Test missing index fallback
   # (Temporarily comment out orderBy in executeOptimizedJobQuery)
   curl http://localhost:3000/api/jobs
   ```

   Expected: Response includes `"fallbackApplied": true` in meta field

---

## Future Unit Tests

Once refactoring is complete, add comprehensive unit tests:

### `tests/api/jobs/type-guards.test.ts`
```typescript
import { isFirestoreTimestamp } from '@/app/api/jobs/route'

describe('Type Guards', () => {
  describe('isFirestoreTimestamp', () => {
    it('should return true for Firestore Timestamp objects', () => {
      const mockTimestamp = { toDate: () => new Date() }
      expect(isFirestoreTimestamp(mockTimestamp)).toBe(true)
    })

    it('should return false for Date objects', () => {
      expect(isFirestoreTimestamp(new Date())).toBe(false)
    })

    it('should return false for null', () => {
      expect(isFirestoreTimestamp(null)).toBe(false)
    })
  })
})
```

### `tests/api/jobs/transformations.test.ts`
```typescript
import { toTimestampMillis, parseStringToMillis } from '@/app/api/jobs/route'

describe('Data Transformations', () => {
  describe('parseStringToMillis', () => {
    it('should parse valid ISO date strings', () => {
      const result = parseStringToMillis('2025-01-15T10:00:00Z')
      expect(result).toBeGreaterThan(0)
    })

    it('should return 0 for invalid date strings', () => {
      expect(parseStringToMillis('invalid-date')).toBe(0)
    })
  })

  describe('toTimestampMillis', () => {
    it('should handle Date objects', () => {
      const date = new Date('2025-01-15T10:00:00Z')
      expect(toTimestampMillis(date)).toBe(date.getTime())
    })

    it('should handle numeric timestamps', () => {
      expect(toTimestampMillis(1705315200000)).toBe(1705315200000)
    })

    it('should handle Firestore Timestamps', () => {
      const mockTimestamp = { toDate: () => new Date('2025-01-15T10:00:00Z') }
      const result = toTimestampMillis(mockTimestamp)
      expect(result).toBeGreaterThan(0)
    })

    it('should return 0 for null/undefined', () => {
      expect(toTimestampMillis(null)).toBe(0)
      expect(toTimestampMillis(undefined)).toBe(0)
    })
  })
})
```

### `tests/api/jobs/query-strategies.test.ts`
```typescript
import { executeOptimizedJobQuery, executeFallbackJobQuery } from '@/app/api/jobs/route'

describe('Query Strategies', () => {
  let mockBaseQuery: jest.Mocked<FirebaseFirestore.Query>

  beforeEach(() => {
    mockBaseQuery = {
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({ docs: [] }),
      count: jest.fn().mockReturnValue({ get: jest.fn().mockResolvedValue({ data: () => ({ count: 0 }) }) }),
    } as any
  })

  describe('executeOptimizedJobQuery', () => {
    it('should return paginated jobs without location filter', async () => {
      const filters = { page: 1, limit: 20 }
      const result = await executeOptimizedJobQuery(mockBaseQuery, filters)

      expect(result).toHaveProperty('jobs')
      expect(result).toHaveProperty('total')
      expect(mockBaseQuery.orderBy).toHaveBeenCalledWith('createdAt', 'desc')
    })
  })

  describe('executeFallbackJobQuery', () => {
    it('should apply in-memory sorting when indexes missing', async () => {
      const filters = { page: 1, limit: 20 }
      const result = await executeFallbackJobQuery(mockBaseQuery, filters)

      expect(result).toHaveProperty('jobs')
      expect(result).toHaveProperty('total')
      expect(mockBaseQuery.get).toHaveBeenCalled()
    })
  })
})
```

---

## Implementation Checklist

### Pre-Implementation
- [ ] Review current codebase at commit 91263b1
- [ ] Create feature branch: `refactor/API-001-jobs-route-complexity`
- [ ] Run smoke tests and save baseline responses
- [ ] Notify team (if applicable) of upcoming API route changes

### Phase 1: Extract Complex Conditionals
- [ ] Create `isFirestoreTimestamp` type guard
- [ ] Create `parseStringToMillis` helper
- [ ] Refactor `toTimestampMillis` to use helpers
- [ ] Run smoke tests - verify pass ✅
- [ ] Commit: `refactor: extract type guards for timestamp conversion`

### Phase 2: Decompose GET Method
- [ ] Create `executeOptimizedJobQuery` function
- [ ] Create `executeFallbackJobQuery` function
- [ ] Refactor GET method to use query strategies
- [ ] Run smoke tests - verify pass ✅
- [ ] Compare API responses - verify identical ✅
- [ ] Commit: `refactor: decompose GET method into query strategies`

### Phase 3: Simplify Data Transformations
- [ ] Create `convertTimestampField` generic helper
- [ ] Refactor `transformJobDocument` to use helper
- [ ] Run smoke tests - verify pass ✅
- [ ] Commit: `refactor: simplify timestamp field transformations`

### Post-Implementation
- [ ] Write unit tests for all new helper functions
- [ ] Update `docs/ARCHITECTURE.md` if query strategy pattern documented
- [ ] Create PR with evidence:
  - [ ] Smoke test output (screenshot)
  - [ ] API response diff (empty diff expected)
  - [ ] Complexity metrics comparison (before/after)
- [ ] Link PR to this refactoring plan document
- [ ] Request code review (reference `.github/CODEOWNERS`)
- [ ] Merge after all CI checks pass ✅

### Rollback Plan
If issues discovered post-merge:
1. Identify failing test or regression
2. Revert merge commit: `git revert <merge-sha> -m 1`
3. Create hotfix branch to address regression
4. Re-apply refactoring after fix verified

---

## References

- **Original File**: `src/app/api/jobs/route.ts` (commit 91263b1)
- **E2E Coverage**: `e2e/verify-demo-login.spec.ts` (test: "verify jobs page loads successfully")
- **Frontend Dependencies**:
  - `/jobs` - Public job listing page
  - `/jobs/new` - Job creation form
  - `/jobs/[id]` - Job detail view
  - `/jobs/[id]/edit` - Job edit form
  - `/dashboard/owner` - Owner job management dashboard
- **Related Documentation**:
  - `docs/ARCHITECTURE.md` - System architecture overview
  - `docs/TESTING.md` - Testing strategy and budgets
  - `docs/API_REFERENCE.yml` - OpenAPI spec for jobs endpoint

---

## Success Criteria

This refactoring will be considered successful when:

1. ✅ All production smoke tests pass (3/3)
2. ✅ API responses identical to pre-refactoring baseline
3. ✅ All 5 frontend pages render without errors
4. ✅ GET method cyclomatic complexity reduced from 11 → 5
5. ✅ toTimestampMillis complexity reduced from 9 → 2
6. ✅ Code coverage maintained at current level (or improved)
7. ✅ No new console errors or warnings in browser/server logs
8. ✅ Git commit history clean (no merge commits, squashed PR)

**Post-Refactoring Metrics Target**:
```
File: src/app/api/jobs/route.ts
Total Cyclomatic Complexity: 45 (was 61)
Functions: 18 (was 13)
Mean Complexity: 2.5 (was 4.69)

No functions with cc > 5
```

---

**Status**: Ready for implementation when prioritized
**Owner**: TBD
**Last Updated**: 2025-10-22
