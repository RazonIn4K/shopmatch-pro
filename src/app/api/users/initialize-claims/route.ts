/**
 * User Claims Initialization API
 *
 * Sets initial custom claims for newly created users.
 * This is required because custom claims can only be set server-side
 * via the Firebase Admin SDK.
 *
 * Custom claims are used for:
 * - Role-based access control (owner/seeker)
 * - Subscription status tracking (subActive)
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/api/auth'
import { ApiError, handleApiError } from '@/lib/api/errors'
import { adminAuth } from '@/lib/firebase/admin'

export const runtime = 'nodejs' // Required for Firebase Admin SDK

/**
 * POST handler to initialize custom claims for a new user
 *
 * SECURITY: Requires authentication and only allows users to set claims for themselves.
 * This prevents role escalation attacks where attackers could assign themselves admin roles.
 *
 * @param request - Contains role in the request body, userId is derived from auth token
 * @returns Success response or error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Require authentication - user can only set claims for themselves
    const auth = await verifyAuth(request)
    
    const body = await request.json()
    const { role } = body

    if (!role) {
      throw new ApiError('Missing role', 400)
    }

    if (role !== 'owner' && role !== 'seeker') {
      throw new ApiError('Invalid role. Must be owner or seeker', 400)
    }

    // Check if user already has custom claims (prevent overwriting)
    const userRecord = await adminAuth.getUser(auth.uid)
    if (userRecord.customClaims && Object.keys(userRecord.customClaims).length > 0) {
      throw new ApiError('User already has custom claims', 400)
    }

    // Set initial custom claims for the authenticated user only
    await adminAuth.setCustomUserClaims(auth.uid, {
      role: role,
      subActive: false, // Users start without active subscription
      updatedAt: new Date().toISOString(),
    })

    console.log(`✅ Initialized custom claims for user ${auth.uid} with role ${role}`)

    return NextResponse.json({
      success: true,
      message: 'Custom claims initialized successfully',
    })

  } catch (error: unknown) {
    return handleApiError(error)
  }
}
