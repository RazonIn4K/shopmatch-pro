/**
 * CSV Export API Route for Job Applications
 *
 * Endpoint: GET /api/applications/export
 * Authentication: Required (Firebase Auth)
 * Authorization: Job owners only
 * Rate Limit: 5 exports per hour per user
 *
 * Returns CSV file with all applications for jobs owned by the authenticated user.
 *
 * @example
 * ```typescript
 * // Client-side usage:
 * const response = await fetch('/api/applications/export', {
 *   headers: {
 *     'Authorization': `Bearer ${idToken}`
 *   }
 * })
 *
 * const blob = await response.blob()
 * const url = URL.createObjectURL(blob)
 * const a = document.createElement('a')
 * a.href = url
 * a.download = `applications-${Date.now()}.csv`
 * a.click()
 * ```
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { csvExportLimiter } from '@/lib/api/rate-limit'
import { toCSV, commonTransforms } from '@/lib/csv/to-csv'

export const runtime = 'nodejs' // Required for Firebase Admin SDK

interface ApplicationRecord {
  jobId: string
  jobTitle: string
  seekerId: string
  seekerEmail: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
  coverLetter: string
  createdAt: FirebaseFirestore.Timestamp
  updatedAt: FirebaseFirestore.Timestamp
}

/**
 * GET /api/applications/export
 *
 * Export all applications for jobs owned by the authenticated user as CSV
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Verify authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid

    // 2. Verify user role (owner only)
    const userDoc = await adminDb.collection('users').doc(userId).get()
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userData = userDoc.data()
    if (userData?.role !== 'owner') {
      return NextResponse.json(
        { error: 'Only job owners can export applications' },
        { status: 403 }
      )
    }

    // 3. Rate limiting check
    const rateLimitResult = await csvExportLimiter.check(userId)
    if (!rateLimitResult.allowed) {
      const retryAfter = Math.ceil((rateLimitResult.reset - Date.now()) / 1000)

      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `You can export up to 5 times per hour. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
          retryAfter,
          limit: 5,
          remaining: 0,
          reset: rateLimitResult.reset,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimitResult.reset),
          },
        }
      )
    }

    // 4. Fetch all jobs owned by user
    const jobsSnapshot = await adminDb
      .collection('jobs')
      .where('ownerId', '==', userId)
      .get()

    if (jobsSnapshot.empty) {
      return NextResponse.json(
        { error: 'No jobs found', message: 'You have not posted any jobs yet' },
        { status: 404 }
      )
    }

    const jobIds = jobsSnapshot.docs.map((doc) => doc.id)
    const jobTitles = new Map(
      jobsSnapshot.docs.map((doc) => [doc.id, doc.data().title])
    )

    // 5. Fetch all applications for these jobs
    // Note: Firestore 'in' queries support up to 10 items, so batch if needed
    const applicationsBatches: FirebaseFirestore.DocumentData[] = []

    for (let i = 0; i < jobIds.length; i += 10) {
      const batch = jobIds.slice(i, i + 10)
      const applicationsSnapshot = await adminDb
        .collection('applications')
        .where('jobId', 'in', batch)
        .orderBy('createdAt', 'desc')
        .get()

      applicationsBatches.push(...applicationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })))
    }

    if (applicationsBatches.length === 0) {
      return NextResponse.json(
        { error: 'No applications found', message: 'No applications have been submitted to your jobs' },
        { status: 404 }
      )
    }

    // 6. Fetch seeker details (email) for each application
    const seekerIds = [...new Set(applicationsBatches.map((app) => app.seekerId))]
    const seekersMap = new Map<string, { email: string }>()

    for (const seekerId of seekerIds) {
      try {
        const seekerDoc = await adminDb.collection('users').doc(seekerId).get()
        if (seekerDoc.exists) {
          const seekerData = seekerDoc.data()
          seekersMap.set(seekerId, {
            email: seekerData?.email || 'N/A',
          })
        }
      } catch (error) {
        console.error(`Failed to fetch seeker ${seekerId}:`, error)
        seekersMap.set(seekerId, { email: 'N/A' })
      }
    }

    // 7. Map applications to CSV-friendly format
    const csvData = applicationsBatches.map((app) => ({
      jobTitle: jobTitles.get(app.jobId) || 'Unknown Job',
      seekerEmail: seekersMap.get(app.seekerId)?.email || 'N/A',
      status: app.status,
      coverLetter: app.coverLetter || '',
      appliedAt: app.createdAt,
      lastUpdated: app.updatedAt,
    }))

    // 8. Generate CSV
    const csv = toCSV(csvData, {
      columns: {
        jobTitle: 'Job Title',
        seekerEmail: 'Applicant Email',
        status: 'Status',
        coverLetter: 'Cover Letter',
        appliedAt: 'Applied At',
        lastUpdated: 'Last Updated',
      },
      transforms: {
        status: commonTransforms.capitalize,
        appliedAt: commonTransforms.timestamp,
        lastUpdated: commonTransforms.timestamp,
      },
      includeHeaders: true,
      addBOM: true,
    })

    // 9. Return CSV file
    const filename = `applications-export-${new Date().toISOString().split('T')[0]}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'X-RateLimit-Reset': String(rateLimitResult.reset),
      },
    })
  } catch (error) {
    console.error('CSV export error:', error)

    // Don't expose internal errors to client
    if (error instanceof Error && error.message.includes('auth')) {
      return NextResponse.json(
        { error: 'Authentication failed', message: 'Please sign in and try again' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Export failed', message: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}
