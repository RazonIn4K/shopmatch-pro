import { NextResponse } from 'next/server'

import { assertActiveSubscription, verifyAuth } from '@/lib/api/auth'
import { ApiError, handleApiError } from '@/lib/api/errors'
import { deleteJob, getJob, updateJob } from '@/lib/server/jobs'
import { jobFormSchema } from '@/types'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function assertJobId(id: string | undefined) {
  if (!id) {
    throw new ApiError('Job ID is required', 400)
  }
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    assertJobId(id)

    const authorization = request.headers.get('authorization') ?? request.headers.get('Authorization')
    let authUid: string | null = null

    if (authorization?.startsWith('Bearer ')) {
      try {
        const auth = await verifyAuth(request)
        authUid = auth.uid
      } catch {
        // Ignore auth failures for public access
      }
    }

    const job = await getJob(id, authUid)

    return NextResponse.json({ job })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    assertJobId(id)

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

    const job = await updateJob(id, auth.uid, parsed.data)

    return NextResponse.json({
      message: 'Job updated successfully',
      job,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    assertJobId(id)

    const auth = await verifyAuth(request)
    assertActiveSubscription(auth)

    await deleteJob(id, auth.uid)

    return NextResponse.json({
      message: 'Job deleted successfully',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
