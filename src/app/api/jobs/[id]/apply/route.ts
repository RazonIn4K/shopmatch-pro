import { NextResponse } from 'next/server'

import { assertRole, verifyAuth } from '@/lib/api/auth'
import { ApiError, handleApiError } from '@/lib/api/errors'
import { applicationSubmitLimiter } from '@/lib/api/rate-limit'
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

    // Rate limit submissions per seeker (best-effort, in-memory per instance)
    const rateLimitResult = await applicationSubmitLimiter.check(auth.uid)
    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `You can submit up to 20 applications per hour. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
          retryAfter,
          limit: 20,
          remaining: 0,
          reset: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.reset),
          },
        }
      )
    }

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
