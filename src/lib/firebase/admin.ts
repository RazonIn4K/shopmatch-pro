/**
 * Firebase Admin SDK Configuration for ShopMatch Pro
 *
 * This file configures Firebase Admin SDK services for server-side operations.
 * Uses service account credentials for maximum compatibility and ease of use.
 *
 * Security Approach:
 * - Uses service account credentials via environment variables
 * - Works in any environment without Google account login
 * - Simple and reliable authentication for development
 * - Secure credential management through environment variables
 *
 * Setup:
 * 1. Go to Firebase Console → Project Settings → Service Accounts
 * 2. Generate new private key for "firebase-adminsdk"
 * 3. Add credentials to .env.local (see .env.local.template)
 * 4. Run app - service account will be used automatically
 */

import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

/**
 * Validate Firebase Admin environment variables
 *
 * Ensures all required Firebase Admin configuration is present.
 * Provides clear error messages for missing configuration.
 */
function validateFirebaseAdminConfig(params: { hasServiceAccount: boolean; allowFallback: boolean }): void {
  const missing: string[] = []

  if (!process.env.FIREBASE_PROJECT_ID) {
    missing.push('FIREBASE_PROJECT_ID')
  }

  if (params.hasServiceAccount) {
    if (!process.env.FIREBASE_CLIENT_EMAIL) {
      missing.push('FIREBASE_CLIENT_EMAIL')
    }
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      missing.push('FIREBASE_PRIVATE_KEY')
    }
  } else if (!params.allowFallback) {
    missing.push('FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY')
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase Admin environment variables: ${missing.join(', ')}.\n` +
      'Please check your .env.local file and ensure all Firebase Admin credentials are set.\n' +
      'Run "npm run validate-env" for detailed validation.\n' +
      'See CLAUDE.md for Firebase Admin setup instructions.'
    )
  }
}

const isServerEnvironment = typeof window === 'undefined'
const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY ?? ''
const hasServiceAccount =
  Boolean(rawPrivateKey) &&
  rawPrivateKey.includes('BEGIN PRIVATE KEY') &&
  rawPrivateKey.includes('END PRIVATE KEY') &&
  Boolean(process.env.FIREBASE_CLIENT_EMAIL)

const allowFallback =
  process.env.CI === 'true' ||
  process.env.NODE_ENV === 'test' ||
  process.env.ALLOW_FIREBASE_ADMIN_FALLBACK === 'true' ||
  rawPrivateKey.startsWith('ci-mock')

// Validate configuration on module import (server-side only)
if (isServerEnvironment) {
  validateFirebaseAdminConfig({ hasServiceAccount, allowFallback })

  if (!hasServiceAccount && allowFallback) {
    // eslint-disable-next-line no-console
    console.warn(
      '[firebase-admin] Running without service account credentials. Admin features are disabled. ' +
      'Set FIREBASE_PRIVATE_KEY (with BEGIN/END PRIVATE KEY) to enable full functionality.'
    )
  }
}

const configuredProjectId = process.env.FIREBASE_PROJECT_ID ?? 'demo-shopmatch-pro'

const app: App = getApps().length === 0
  ? initializeApp(
      hasServiceAccount
        ? {
            credential: cert({
              projectId: configuredProjectId,
              clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
              // Handle both escaped newlines (\n as string) and actual newlines
              privateKey: rawPrivateKey.replace(/\\n/g, '\n'),
            }),
            projectId: configuredProjectId,
          }
        : {
            projectId: configuredProjectId,
          },
    )
  : getApps()[0]!

/**
 * Firebase Admin Authentication service instance
 *
 * Server-side authentication operations including:
 * - Custom claims management (role, subActive)
 * - User creation and management
 * - Token verification and refresh
 * - Session management
 * - Integration with Stripe webhook events
 *
 * Used in:
 * - API route handlers (Stripe webhooks, user management)
 * - Server-side middleware
 * - Authentication flows requiring elevated privileges
 *
 * @example
 * ```typescript
 * // In API route handler
 * import { adminAuth } from '@/lib/firebase/admin'
 *
 * // Set custom claims after successful Stripe subscription
 * await adminAuth.setCustomUserClaims(userId, {
 *   role: 'owner',
 *   subActive: true
 * })
 * ```
 *
 * @see https://firebase.google.com/docs/auth/admin/custom-claims
 */
export const adminAuth = getAuth(app)

/**
 * Firebase Admin Firestore service instance
 *
 * Server-side database operations with elevated privileges:
 * - Bulk operations and administrative tasks
 * - Data migrations and cleanup operations
 * - Server-side data processing and synchronization
 * - Administrative queries and reporting
 *
 * Used in:
 * - Stripe webhook handlers for subscription sync
 * - Administrative API endpoints
 * - Data processing and cleanup tasks
 * - Server-side data aggregation
 *
 * @example
 * ```typescript
 * // In API route handler
 * import { adminDb } from '@/lib/firebase/admin'
 *
 * // Server-side Firestore operation
 * const usersRef = adminDb.collection('users')
 * const snapshot = await usersRef.get()
 * ```
 *
 * @see https://firebase.google.com/docs/firestore/admin/manage-data
 */
export const adminDb = getFirestore(app)

export const isFirebaseAdminFallbackMode = !hasServiceAccount

/**
 * Default Firebase Admin app export for advanced configurations
 *
 * Useful for:
 * - Firebase Extensions management
 * - Custom Firebase service initialization
 * - Administrative tooling and scripts
 * - Advanced security rules testing
 * - Integration with other Firebase services
 */
export default app
