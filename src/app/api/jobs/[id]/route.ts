import { NextResponse } from 'next/server'

import { assertActiveSubscription, verifyAuth } from '@/lib/api/auth'
import { ApiError, handleApiError } from '@/lib/api/errors'
import { adminDb } from '@/lib/firebase/admin'
import { jobFormSchema } from '@/types'
import type { Job } from '@/types'

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

    // Fetch job from Firestore
    const jobRef = adminDb.collection('jobs').doc(id)
    const doc = await jobRef.get()

    if (!doc.exists) {
      throw new ApiError('Job not found', 404)
    }

    const jobData = doc.data()!
    console.log(`[Job GET] Viewing job jobId=${id}, status=${jobData.status}, authUid=${authUid ?? 'anonymous'}`)

    // Enforce draft visibility: only owner can view draft jobs
    if (jobData.status === 'draft' && jobData.ownerId !== authUid) {
      throw new ApiError('Job not found', 404)
    }

    // Increment view count for published jobs
    if (jobData.status === 'published') {
      await jobRef.update({
        viewCount: (jobData.viewCount ?? 0) + 1,
      })
    }

    const job: Job = {
      id: doc.id,
      ...jobData,
      createdAt: jobData.createdAt?.toDate?.() ?? jobData.createdAt,
      updatedAt: jobData.updatedAt?.toDate?.() ?? jobData.updatedAt,
      publishedAt: jobData.publishedAt?.toDate?.() ?? jobData.publishedAt,
      expiresAt: jobData.expiresAt?.toDate?.() ?? jobData.expiresAt,
    } as Job

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

    // Verify job exists and user is owner
    const jobRef = adminDb.collection('jobs').doc(id)
    const doc = await jobRef.get()

    if (!doc.exists) {
      throw new ApiError('Job not found', 404)
    }

    const existingJob = doc.data()!
    if (existingJob.ownerId !== auth.uid) {
      throw new ApiError('You do not have permission to update this job', 403)
    }

    const now = new Date()
    const wasPublished = existingJob.status === 'published'
    const isNowPublished = parsed.data.status === 'published'

    console.log(`[Job PUT] Updating job jobId=${id}, ownerId=${auth.uid}, statusTransition=${existingJob.status}->${parsed.data.status}`)

    const updates = {
      ...parsed.data,
      updatedAt: now,
      // Set publishedAt only if transitioning from draft to published
      ...((!wasPublished && isNowPublished) && { publishedAt: now }),
    }

    await jobRef.update(updates)

    // Retrieve updated document
    const updatedDoc = await jobRef.get()
    const job: Job = {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data()?.createdAt?.toDate?.() ?? updatedDoc.data()?.createdAt,
      updatedAt: updatedDoc.data()?.updatedAt?.toDate?.() ?? updatedDoc.data()?.updatedAt,
      publishedAt: updatedDoc.data()?.publishedAt?.toDate?.() ?? updatedDoc.data()?.publishedAt,
      expiresAt: updatedDoc.data()?.expiresAt?.toDate?.() ?? updatedDoc.data()?.expiresAt,
    } as Job

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

    // Verify job exists and user is owner
    const jobRef = adminDb.collection('jobs').doc(id)
    const doc = await jobRef.get()

    if (!doc.exists) {
      throw new ApiError('Job not found', 404)
    }

    const job = doc.data()!
    if (job.ownerId !== auth.uid) {
      throw new ApiError('You do not have permission to delete this job', 403)
    }

    console.log(`[Job DELETE] Deleting job jobId=${id}, ownerId=${auth.uid}, applicationCount=${job.applicationCount ?? 0}`)

    // Delete the job document
    await jobRef.delete()

    // Optional: Delete associated applications (consider this for production)
    // const applicationsRef = adminDb.collection('applications')
    // const applicationsSnapshot = await applicationsRef.where('jobId', '==', id).get()
    // const batch = adminDb.batch()
    // applicationsSnapshot.docs.forEach(doc => batch.delete(doc.ref))
    // await batch.commit()

    return NextResponse.json({
      message: 'Job deleted successfully',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
