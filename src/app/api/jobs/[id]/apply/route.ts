import { NextResponse } from 'next/server'

import { assertRole, verifyAuth } from '@/lib/api/auth'
import { ApiError, handleApiError } from '@/lib/api/errors'
import { submitApplication } from '@/lib/server/applications'
import { applicationSubmissionSchema } from '@/types'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: jobId } = await context.params
    if (!jobId) {
      throw new ApiError('Job ID is required', 400)
    }

    const auth = await verifyAuth(request)
    assertRole(auth, 'seeker')

    let payload: unknown
    try {
      payload = await request.json()
    } catch {
      throw new ApiError('Invalid JSON payload', 400)
    }

    const parsed = applicationSubmissionSchema.safeParse(payload)
    if (!parsed.success) {
      throw new ApiError('Validation failed', 422, parsed.error.format())
    }

    const application = await submitApplication(jobId, auth.uid, parsed.data)

    return NextResponse.json(
      {
        message: 'Application submitted successfully',
        application,
      },
      { status: 201 },
    )
  } catch (error) {
    return handleApiError(error)
  }
}
