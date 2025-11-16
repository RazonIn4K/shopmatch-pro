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

    const baseQuery = buildJobsQuery(filters)
    const offset = (filters.page - 1) * filters.limit
    const paginatedQuery = baseQuery.orderBy('createdAt', 'desc').limit(filters.limit).offset(offset)

    try {
      const snapshot = await paginatedQuery.get()
      let jobs: Job[] = snapshot.docs.map(transformJobDocument)

      if (jobs.length === 0 && process.env.NODE_ENV === 'development') {
        console.log('🔧 Development fallback: returning mock published jobs for smoke test')

        jobs = [
          {
            id: 'demo-job-1',
            title: 'Senior React Developer',
            company: 'TechCorp Solutions',
            type: 'full-time',
            location: 'San Francisco, CA',
            remote: true,
            salary: { currency: 'USD', period: 'yearly', min: 120000, max: 180000 },
            experience: 'senior',
            description: 'Join our team building cutting-edge web applications with React, TypeScript, and Node.js.',
            requirements: ['5+ years of React experience', 'Strong TypeScript skills', 'Experience with Node.js'],
            status: 'published',
            ownerId: 'demo-owner',
            viewCount: 45,
            applicationCount: 8,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'demo-job-2',
            title: 'Full Stack Engineer',
            company: 'StartupXYZ',
            type: 'full-time',
            location: 'Remote',
            remote: true,
            salary: { currency: 'USD', period: 'yearly', min: 90000, max: 140000 },
            experience: 'mid',
            description: 'Fast-growing startup seeking a versatile full stack engineer to help build our SaaS platform.',
            requirements: ['3+ years full stack development', 'React and Node.js', 'PostgreSQL or similar'],
            status: 'published',
            ownerId: 'demo-owner',
            viewCount: 67,
            applicationCount: 12,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'demo-job-3',
            title: 'Frontend Developer',
            company: 'Design Studio Pro',
            type: 'contract',
            location: 'New York, NY',
            remote: false,
            salary: { currency: 'USD', period: 'hourly', min: 80, max: 120 },
            experience: 'mid',
            description: 'Creative agency looking for a talented frontend developer to join us for a 6-month contract.',
            requirements: ['Strong HTML/CSS/JavaScript', 'React or Vue.js', 'Eye for design'],
            status: 'published',
            ownerId: 'demo-owner',
            viewCount: 34,
            applicationCount: 5,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            publishedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ] as Job[]
      }

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
          total: filteredJobs.length > 0 ? filteredTotal : jobs.length,
          pages: Math.ceil((filteredJobs.length > 0 ? filteredTotal : jobs.length) / filters.limit),
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
