import { NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/api/auth'
import { ApiError, handleApiError } from '@/lib/api/errors'
import { adminDb } from '@/lib/firebase/admin'
import { applicationStatuses } from '@/types'
import type { Application } from '@/types'

type ApplicationListFilters = {
  jobId?: string
  seekerId?: string
  ownerId?: string
  status?: (typeof applicationStatuses)[number]
  page: number
  limit: number
}

function parseFilters(request: Request, userId: string): ApplicationListFilters {
  const url = new URL(request.url)
  const params = url.searchParams

  const filters: ApplicationListFilters = {
    jobId: params.get('jobId') ?? undefined,
    seekerId: params.get('seekerId') ?? undefined,
    ownerId: params.get('ownerId') ?? undefined,
    status: (params.get('status') as ApplicationListFilters['status']) ?? undefined,
    page: Math.max(1, Number(params.get('page') ?? 1)),
    limit: Math.min(100, Math.max(1, Number(params.get('limit') ?? 20))),
  }

  if (filters.seekerId && filters.seekerId !== userId) {
    throw new ApiError('Cannot query applications for other seekers', 403)
  }

  if (filters.ownerId && filters.ownerId !== userId) {
    throw new ApiError('Cannot query applications for other owners', 403)
  }

  if (!filters.seekerId && !filters.ownerId) {
    // Default to seeker perspective; client can override by providing ownerId explicitly.
    filters.seekerId = userId
  }

  return filters
}

export async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request)
    const filters = parseFilters(request, auth.uid)

    const applicationsRef = adminDb.collection('applications')
    let query: FirebaseFirestore.Query = applicationsRef

    // Apply filters
    if (filters.jobId) {
      query = query.where('jobId', '==', filters.jobId)
    }
    if (filters.seekerId) {
      query = query.where('seekerId', '==', filters.seekerId)
    }
    if (filters.ownerId) {
      query = query.where('ownerId', '==', filters.ownerId)
    }
    if (filters.status) {
      query = query.where('status', '==', filters.status)
    }

    // Order by creation date (descending)
    query = query.orderBy('createdAt', 'desc')

    // Pagination
    const offset = (filters.page - 1) * filters.limit
    query = query.limit(filters.limit).offset(offset)

    const snapshot = await query.get()

    // Get total count for pagination
    let countQuery: FirebaseFirestore.Query = applicationsRef
    if (filters.jobId) countQuery = countQuery.where('jobId', '==', filters.jobId)
    if (filters.seekerId) countQuery = countQuery.where('seekerId', '==', filters.seekerId)
    if (filters.ownerId) countQuery = countQuery.where('ownerId', '==', filters.ownerId)
    if (filters.status) countQuery = countQuery.where('status', '==', filters.status)

    const countSnapshot = await countQuery.count().get()
    const total = countSnapshot.data().count

    const applications: Application[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() ?? doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() ?? doc.data().updatedAt,
      reviewedAt: doc.data().reviewedAt?.toDate?.() ?? doc.data().reviewedAt,
    })) as Application[]

    return NextResponse.json({
      applications,
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
