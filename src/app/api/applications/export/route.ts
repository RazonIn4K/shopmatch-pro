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
import { adminAuth } from '@/lib/firebase/admin'
import { csvExportLimiter } from '@/lib/api/rate-limit'
import { toCSV, commonTransforms } from '@/lib/csv/to-csv'
import { getOwnerApplicationsExportData } from '@/lib/server/applications'
import { getUserRecordSummary } from '@/lib/server/users'

export const runtime = 'nodejs' // Required for Firebase Admin SDK

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
    // checkRevoked=true aligns this route with verifyAuth: revoked or
    // disabled accounts are rejected instead of passing signature checks
    const decodedToken = await adminAuth.verifyIdToken(token, true)
    const userId = decodedToken.uid

    // 2. Verify user role (owner only)
    const user = await getUserRecordSummary(userId)
    if (!user.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.role !== 'owner') {
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

    // 4. Fetch applications, job titles, and seeker emails via the data layer
    const exportData = await getOwnerApplicationsExportData(userId)

    if (exportData.kind === 'no-jobs') {
      return NextResponse.json(
        { error: 'No jobs found', message: 'You have not posted any jobs yet' },
        { status: 404 }
      )
    }

    if (exportData.kind === 'no-applications') {
      return NextResponse.json(
        { error: 'No applications found', message: 'No applications have been submitted to your jobs' },
        { status: 404 }
      )
    }

    // 5. Map applications to CSV-friendly format
    const csvData = exportData.applications.map((app) => ({
      jobTitle: exportData.jobTitles.get(app.jobId) || 'Unknown Job',
      seekerEmail: exportData.seekers.get(app.seekerId)?.email || 'N/A',
      status: app.status,
      coverLetter: app.coverLetter || '',
      appliedAt: app.createdAt,
      lastUpdated: app.updatedAt,
    }))

    // 6. Generate CSV
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

    // 7. Return CSV file
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

    // Don't expose internal errors to client. Firebase auth failures carry
    // an `auth/...` code (e.g. auth/id-token-revoked) whose message does not
    // always contain "auth", so check both.
    const errorCode = (error as { code?: unknown }).code
    const isAuthError =
      (error instanceof Error && error.message.includes('auth')) ||
      (typeof errorCode === 'string' && errorCode.startsWith('auth/'))

    if (isAuthError) {
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
