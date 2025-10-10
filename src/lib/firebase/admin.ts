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

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

/**
 * Firebase Admin SDK configuration using service account credentials
 *
 * This approach uses service account credentials from environment variables,
 * making it work in any environment without requiring Google account login.
 *
 * Benefits:
 * - No Google account login required for development
 * - Works in any deployment environment
 * - Simple and reliable credential management
 * - No dependency on gcloud CLI or user authentication
 * - Perfect for development and testing workflows
 */
const app = getApps().length === 0 ? initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
  projectId: process.env.FIREBASE_PROJECT_ID,
}) : getApps()[0]

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