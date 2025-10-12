import { NextResponse } from 'next/server'

import { assertRole, verifyAuth } from '@/lib/api/auth'
import { ApiError, handleApiError } from '@/lib/api/errors'
import { adminDb } from '@/lib/firebase/admin'
import { applicationStatusUpdateSchema } from '@/types'
import type { Application } from '@/types'

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

    // Fetch application
    const appRef = adminDb.collection('applications').doc(id)
    const doc = await appRef.get()

    if (!doc.exists) {
      throw new ApiError('Application not found', 404)
    }

    const appData = doc.data()!

    // Ensure requester is either the seeker or the owner
    if (appData.seekerId !== auth.uid && appData.ownerId !== auth.uid) {
      throw new ApiError('You do not have permission to view this application', 403)
    }

    const application: Application = {
      id: doc.id,
      ...appData,
      createdAt: appData.createdAt?.toDate?.() ?? appData.createdAt,
      updatedAt: appData.updatedAt?.toDate?.() ?? appData.updatedAt,
      reviewedAt: appData.reviewedAt?.toDate?.() ?? appData.reviewedAt,
    } as Application

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

    // Fetch application and verify ownership
    const appRef = adminDb.collection('applications').doc(id)
    const doc = await appRef.get()

    if (!doc.exists) {
      throw new ApiError('Application not found', 404)
    }

    const appData = doc.data()!

    // Verify the authenticated owner manages the linked job
    if (appData.ownerId !== auth.uid) {
      throw new ApiError('You do not have permission to update this application', 403)
    }

    const now = new Date()
    const updates: Partial<Application> = {
      status: parsed.data.status,
      notes: parsed.data.notes,
      updatedAt: now,
    }

    // Set reviewedAt if status is being changed from pending and reviewedAt is not set
    if (appData.status === 'pending' && parsed.data.status !== 'pending' && !appData.reviewedAt) {
      updates.reviewedAt = now
    }

    await appRef.update(updates)

    // Retrieve updated document
    const updatedDoc = await appRef.get()
    const application: Application = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data()?.createdAt?.toDate?.() ?? updatedDoc.data()?.createdAt,
      updatedAt: updatedDoc.data()?.updatedAt?.toDate?.() ?? updatedDoc.data()?.updatedAt,
      reviewedAt: updatedDoc.data()?.reviewedAt?.toDate?.() ?? updatedDoc.data()?.reviewedAt,
    } as Application

    return NextResponse.json({
      message: 'Application updated successfully',
      application,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
