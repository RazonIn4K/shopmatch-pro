import { NextResponse } from 'next/server'

import { assertActiveSubscription, assertRole, verifyAuth } from '@/lib/api/auth'
import { ApiError, handleApiError } from '@/lib/api/errors'
import { isMissingIndexError } from '@/lib/server/firestore'
import { createJob, listJobs, type JobListFilters } from '@/lib/server/jobs'
import { jobFormSchema } from '@/types'

function parseBoolean(value: string | null): boolean | undefined {
  if (value === null) return undefined
  if (['true', '1', 'yes'].includes(value.toLowerCase())) return true
  if (['false', '0', 'no'].includes(value.toLowerCase())) return false
  return undefined
}

function parsePositiveInteger(value: string | null, fallback: number): number {
  const parsed = Number(value ?? fallback)
  return Number.isFinite(parsed) ? Math.floor(parsed) : fallback
}

function parseFilters(request: Request): JobListFilters {
  const url = new URL(request.url)
  const params = url.searchParams
  const page = parsePositiveInteger(params.get('page'), 1)
  const limit = parsePositiveInteger(params.get('limit'), 20)

  return {
    ownerId: params.get('ownerId') ?? undefined,
    status: (params.get('status') as JobListFilters['status']) ?? undefined,
    type: (params.get('type') as JobListFilters['type']) ?? undefined,
    location: params.get('location') ?? undefined,
    remote: parseBoolean(params.get('remote')),
    experience: (params.get('experience') as JobListFilters['experience']) ?? undefined,
    page: Math.max(1, page),
    limit: Math.min(100, Math.max(1, limit)),
  }
}

export async function GET(request: Request) {
  try {
    const filters = parseFilters(request)

    if (filters.ownerId) {
      const auth = await verifyAuth(request)
      if (auth.uid !== filters.ownerId) {
        throw new ApiError('Unauthorized: cannot filter by another user\'s jobs', 403)
      }
      // Ensure user has active subscription to access owner-specific data
      assertActiveSubscription(auth)
    }

    try {
      const { jobs, total } = await listJobs(filters)

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

      // Fail-fast approach: Return explicit error when indexes are missing
      // This prevents DoS attacks via unbounded memory consumption
      return handleApiError(
        new ApiError(
          'Composite Firestore index missing. Deploy indexes to restore functionality.',
          503,
          {
            code: 'MISSING_INDEX',
            hint: 'Run: firebase deploy --only firestore:indexes',
            docs: 'https://firebase.google.com/docs/firestore/query-data/indexing',
          }
        )
      )
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

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request)
    // Only owners may post jobs. The data layer uses the Admin SDK (bypassing
    // firestore.rules), so this role gate must be enforced here too.
    assertRole(auth, 'owner')
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
