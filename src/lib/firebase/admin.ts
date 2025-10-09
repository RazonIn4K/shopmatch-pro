/**
 * Firebase Admin SDK Configuration for ShopMatch Pro
 *
 * This file configures Firebase Admin SDK services for server-side operations.
 * Uses Application Default Credentials (ADC) for local development with gcloud CLI.
 *
 * Security Approach:
 * - Uses gcloud Application Default Credentials for local development
 * - No service account keys to manage or secure
 * - Leverages developer's Google account permissions
 * - Secure and simple credential management
 *
 * Local Development Setup:
 * 1. Install gcloud CLI: brew install google-cloud-sdk
 * 2. Authenticate: gcloud auth application-default login --project=shopmatch-pro
 * 3. Run app - ADC will be used automatically
 *
 * Production Deployment:
 * - Use service account attachment (Cloud Run, etc.)
 * - No code changes needed for different environments
 */

import { initializeApp, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

/**
 * Firebase Admin SDK configuration using Application Default Credentials
 *
 * This approach uses the Google Cloud CLI's application default credentials,
 * which are automatically available after running:
 * `gcloud auth application-default login --project=shopmatch-pro`
 *
 * Benefits:
 * - No service account keys to manage
 * - Uses developer's own Google account permissions
 * - Credentials stored securely by gcloud CLI
 * - Automatic credential refresh
 * - Works seamlessly with Firebase Admin SDK
 */
const app = getApps().length === 0 ? initializeApp({
  // Project ID only - ADC handles authentication automatically
  projectId: process.env.FIREBASE_PROJECT_ID || 'shopmatch-pro',

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