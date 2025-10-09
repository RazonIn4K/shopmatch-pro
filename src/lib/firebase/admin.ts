/**
 * Firebase Admin SDK Configuration for ShopMatch Pro
 *
 * This file configures Firebase Admin SDK services for server-side operations.
 * It handles sensitive operations that require elevated privileges and cannot
 * be performed from client-side code for security reasons.
 *
 * Security Note:
 * - This file is server-side only (API routes, middleware)
 * - Never import in client-side components or pages
 * - Handles sensitive operations like custom claims management
 * - Requires proper environment variable configuration
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

/**
 * Firebase Admin SDK configuration with service account credentials
 *
 * Security Rationale:
 * - Uses server-side environment variables only (no NEXT_PUBLIC_ prefix)
 * - Service account provides elevated privileges for admin operations
 * - Private key is properly formatted for Node.js environment
 * - Enables server-side authentication and Firestore operations
 *
 * @see https://firebase.google.com/docs/admin/setup#initialize-sdk
 */
const app = getApps().length === 0 ? initializeApp({
  /**
   * Service account credential configuration
   *
   * Required for:
   * - Custom claims management (role, subActive)
   * - Server-side user creation and management
   * - Firestore operations with elevated privileges
   * - Webhook verification and processing
   */
  credential: cert({
    // Project identifier for the Firebase project
    projectId: process.env.FIREBASE_PROJECT_ID,

    // Service account email address
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,

    /**
     * Service account private key with proper formatting
     *
     * Important:
     * - Environment variable contains escaped newlines (\n)
     * - Must be converted back to actual newlines for Node.js
     * - Never log or expose this key in any form
     * - Used for signing JWT tokens and API authentication
     */
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),

  // Optional: Uncomment if you need a specific database URL
  // databaseURL: process.env.FIREBASE_DATABASE_URL,
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