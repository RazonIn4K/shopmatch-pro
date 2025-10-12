import type { DecodedIdToken } from 'firebase-admin/auth'

import { ApiError } from '@/lib/api/errors'
import { adminAuth } from '@/lib/firebase/admin'

export interface AuthContext {
  uid: string
  token: string
  claims: DecodedIdToken
}

/**
 * Extracts and verifies a Firebase ID token from the Authorization header.
 *
 * @throws ApiError with 401 status when the token is missing or invalid.
 */
export async function verifyAuth(request: Request): Promise<AuthContext> {
  const authHeader = request.headers.get('authorization') ?? request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new ApiError('Missing or invalid Authorization header', 401)
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim()

  try {
    const claims = await adminAuth.verifyIdToken(token, true)
    return {
      uid: claims.uid,
      token,
      claims,
    }
  } catch (error) {
    console.error('Token verification failed', error)
    throw new ApiError('Unauthorized', 401)
  }
}

/**
 * Ensures the authenticated user has an active subscription.
 */
export function assertActiveSubscription(auth: AuthContext) {
  if (!auth.claims.subActive) {
    throw new ApiError('Active subscription required to perform this action', 403)
  }
}

/**
 * Ensures the authenticated user has a specific role.
 */
export function assertRole(auth: AuthContext, role: string) {
  if (auth.claims.role !== role) {
    throw new ApiError('Insufficient permissions for this resource', 403)
  }
}
