import { FieldValue } from 'firebase-admin/firestore'
import { NextResponse } from 'next/server'

import { assertRole, verifyAuth } from '@/lib/api/auth'
import { ApiError, handleApiError } from '@/lib/api/errors'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { applicationSubmissionSchema } from '@/types'
import type { Application } from '@/types'

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

    // Get seeker details
    const userRecord = await adminAuth.getUser(auth.uid)

    const jobRef = adminDb.collection('jobs').doc(jobId)
    // Deterministic ID makes a duplicate application a same-document conflict
    const appRef = adminDb.collection('applications').doc(`${jobId}_${auth.uid}`)
    const now = new Date()

    // Create application and increment the counter atomically
    await adminDb.runTransaction(async (transaction) => {
      // Firestore transactions require all reads before any writes
      const jobDoc = await transaction.get(jobRef)

      if (!jobDoc.exists) {
        throw new ApiError('Job not found', 404)
      }

      const job = jobDoc.data()!
      if (job.status !== 'published') {
        throw new ApiError('This job is not accepting applications', 400)
      }

      // Check if user has already applied
      const existingAppDoc = await transaction.get(appRef)
      if (existingAppDoc.exists) {
        throw new ApiError('You have already applied to this job', 400)
      }

      // Legacy applications have auto-generated IDs, so the deterministic-ID
      // check above cannot detect them — query by jobId/seekerId as well
      const existingApplications = await transaction.get(
        adminDb
          .collection('applications')
          .where('jobId', '==', jobId)
          .where('seekerId', '==', auth.uid)
          .limit(1),
      )

      if (!existingApplications.empty) {
        throw new ApiError('You have already applied to this job', 400)
      }

      const applicationData = {
        jobId,
        seekerId: auth.uid,
        ownerId: job.ownerId,
        coverLetter: parsed.data.coverLetter || null,
        phone: parsed.data.phone || null,
        jobTitle: job.title,
        company: job.company,
        seekerName: userRecord.displayName || 'Anonymous',
        seekerEmail: userRecord.email || '',
        status: 'pending' as const,
        createdAt: now,
        updatedAt: now,
      }

      transaction.create(appRef, applicationData)
      transaction.update(jobRef, {
        applicationCount: FieldValue.increment(1),
      })
    })

    // Retrieve the created application
    const appDoc = await appRef.get()
    const application: Application = {
      id: appDoc.id,
      ...appDoc.data(),
      createdAt: appDoc.data()?.createdAt?.toDate?.() ?? appDoc.data()?.createdAt,
      updatedAt: appDoc.data()?.updatedAt?.toDate?.() ?? appDoc.data()?.updatedAt,
      reviewedAt: appDoc.data()?.reviewedAt?.toDate?.() ?? appDoc.data()?.reviewedAt,
    } as Application

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
