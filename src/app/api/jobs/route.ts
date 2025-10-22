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

function transformJobDocument(doc: FirebaseFirestore.DocumentSnapshot): Job {
  const data = doc.data()!
  // Convert Firestore Timestamps to ISO strings for JSON
  return {
    id: doc.id,
    ...data,
    createdAt: (data.createdAt as FirebaseFirestore.Timestamp)?.toDate?.() ?? data.createdAt,
    updatedAt: (data.updatedAt as FirebaseFirestore.Timestamp)?.toDate?.() ?? data.updatedAt,
    publishedAt: (data.publishedAt as FirebaseFirestore.Timestamp)?.toDate?.() ?? data.publishedAt,
    expiresAt: (data.expiresAt as FirebaseFirestore.Timestamp)?.toDate?.() ?? data.expiresAt,
  } as Job
}

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

function sortJobsByCreatedAtDesc(jobs: Job[]): Job[] {
  return [...jobs].sort((a, b) => toTimestampMillis(b.createdAt) - toTimestampMillis(a.createdAt))
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
    const offset = (filters.page - 1) * filters.limit
    const paginatedQuery = baseQuery.orderBy('createdAt', 'desc').limit(filters.limit).offset(offset)

    try {
      const snapshot = await paginatedQuery.get()
      const jobs: Job[] = snapshot.docs.map(transformJobDocument)

      // Handle location filter and count
      let filteredJobs = jobs
      let filteredTotal: number

      if (filters.location) {
        const result = await handleLocationFiltering(jobs, baseQuery, filters.location)
        filteredJobs = result.filteredJobs
        filteredTotal = result.filteredTotal
      } else {
        // No location filter - use standard count query
        const countSnapshot = await baseQuery.count().get()
        filteredTotal = countSnapshot.data().count
      }

      return NextResponse.json({
        jobs: filteredJobs,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: filteredTotal,
          pages: Math.ceil(filteredTotal / filters.limit),
        },
      })
    } catch (queryError) {
      if (!isMissingIndexError(queryError)) {
        throw queryError
      }

      // Fallback logic when composite indexes are missing in production.
      const fallbackSnapshot = await baseQuery.get()
      const allJobs = fallbackSnapshot.docs.map(transformJobDocument)
      const sortedJobs = sortJobsByCreatedAtDesc(allJobs)
      const locationResult = filters.location
        ? filterJobsByLocation(sortedJobs, filters.location)
        : { filteredJobs: sortedJobs, filteredTotal: sortedJobs.length }

      const paginatedJobs = locationResult.filteredJobs.slice(offset, offset + filters.limit)

      return NextResponse.json({
        jobs: paginatedJobs,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: locationResult.filteredTotal,
          pages: Math.ceil(locationResult.filteredTotal / filters.limit),
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
