import { NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/api/auth'
import { ApiError, handleApiError } from '@/lib/api/errors'
import { listApplications, type ApplicationListFilters } from '@/lib/server/applications'

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

    const { applications, total } = await listApplications(filters)

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
