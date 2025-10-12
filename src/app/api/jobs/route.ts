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

export async function GET(request: Request) {
  try {
    const filters = parseFilters(request)
    const jobsRef = adminDb.collection('jobs')

    // Build query with filters
    let query: FirebaseFirestore.Query = jobsRef

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
    // Note: location filter requires client-side filtering or full-text search for MVP

    // Order by creation date (descending)
    query = query.orderBy('createdAt', 'desc')

    // Pagination
    const offset = (filters.page - 1) * filters.limit
    query = query.limit(filters.limit).offset(offset)

    const snapshot = await query.get()

    // Get total count for pagination (expensive, consider caching)
    let totalQuery: FirebaseFirestore.Query = jobsRef
    if (filters.ownerId) {
      totalQuery = totalQuery.where('ownerId', '==', filters.ownerId)
    } else {
      totalQuery = totalQuery.where('status', '==', 'published')
    }
    const countSnapshot = await totalQuery.count().get()
    const total = countSnapshot.data().count

    const jobs: Job[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamps to ISO strings for JSON
      createdAt: doc.data().createdAt?.toDate?.() ?? doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() ?? doc.data().updatedAt,
      publishedAt: doc.data().publishedAt?.toDate?.() ?? doc.data().publishedAt,
      expiresAt: doc.data().expiresAt?.toDate?.() ?? doc.data().expiresAt,
    })) as Job[]

    // Client-side location filter if needed
    let filteredJobs = jobs
    if (filters.location) {
      const locationLower = filters.location.toLowerCase()
      filteredJobs = jobs.filter((job) =>
        job.location.toLowerCase().includes(locationLower)
      )
    }

    return NextResponse.json({
      jobs: filteredJobs,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAuth(request)
    assertActiveSubscription(auth)

    let payload: unknown
    try {
      payload = await request.json()
    } catch {
      throw new ApiError('Invalid JSON payload', 400)
    }

    const parsed = jobFormSchema.safeParse(payload)
    if (!parsed.success) {
      throw new ApiError('Validation failed', 422, parsed.error.format())
    }

    const now = new Date()
    const jobData = {
      ...parsed.data,
      ownerId: auth.uid,
      viewCount: 0,
      applicationCount: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: parsed.data.status === 'published' ? now : null,
    }

    // Create job document in Firestore
    const jobsRef = adminDb.collection('jobs')
    const docRef = await jobsRef.add(jobData)

    // Retrieve the created document
    const doc = await docRef.get()
    const job: Job = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate?.() ?? doc.data()?.createdAt,
      updatedAt: doc.data()?.updatedAt?.toDate?.() ?? doc.data()?.updatedAt,
      publishedAt: doc.data()?.publishedAt?.toDate?.() ?? doc.data()?.publishedAt,
    } as Job

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
