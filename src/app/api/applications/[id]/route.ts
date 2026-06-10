import { NextResponse } from 'next/server'

import { assertRole, verifyAuth } from '@/lib/api/auth'
import { ApiError, handleApiError } from '@/lib/api/errors'
import {
  getApplicationForParticipant,
  updateApplicationStatus,
} from '@/lib/server/applications'
import { applicationStatusUpdateSchema } from '@/types'

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

function assertApplicationId(id: string | undefined) {
  if (!id) {
    throw new ApiError('Application ID is required', 400)
  }
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    assertApplicationId(id)

    const auth = await verifyAuth(request)

    const application = await getApplicationForParticipant(id, auth.uid)

    return NextResponse.json({ application })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params
    assertApplicationId(id)

    const auth = await verifyAuth(request)
    assertRole(auth, 'owner')

    let payload: unknown
    try {
      payload = await request.json()
    } catch {
      throw new ApiError('Invalid JSON payload', 400)
    }

    const parsed = applicationStatusUpdateSchema.safeParse(payload)
    if (!parsed.success) {
      throw new ApiError('Validation failed', 422, parsed.error.format())
    }

    const application = await updateApplicationStatus(id, auth.uid, parsed.data)

    return NextResponse.json({
      message: 'Application updated successfully',
      application,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
