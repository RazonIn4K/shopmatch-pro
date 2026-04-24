/**
 * Firebase Client Configuration for ShopMatch Pro
 *
 * This file configures Firebase client-side services including Authentication and Firestore.
 * It follows Firebase best practices for initialization and prevents multiple initializations.
 *
 * Key Features:
 * - Singleton pattern prevents duplicate Firebase app initialization
 * - Environment-based configuration for security
 * - Exports auth and db services for use throughout the application
 * - Compatible with Next.js SSR and client-side rendering
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

/**
 * Firebase configuration object populated from environment variables
 *
 * Security Rationale:
 * - Uses NEXT_PUBLIC_ prefix for client-safe variables only
 * - Never exposes sensitive server-side keys to the client bundle
 * - Required for Firebase services to function in browser environment
 */
function getFirebaseConfig() {
  const config = {
    // API key for Firebase services (safe for client-side)
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,

    // Authentication domain (safe for client-side)
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,

    // Project identifier (safe for client-side)
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,

    // Cloud Storage bucket (safe for client-side)
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,

    // Cloud Messaging sender ID (safe for client-side)
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,

    // Firebase App ID (safe for client-side)
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([name]) => name)

  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase client environment variables: ${missing.join(', ')}. ` +
      'Set NEXT_PUBLIC_FIREBASE_* values before using Firebase client services.'
    )
  }

  return config as {
    apiKey: string
    authDomain: string
    projectId: string
    storageBucket: string
    messagingSenderId: string
    appId: string
  }
}

/**
 * Initializes Firebase application with singleton pattern
 *
 * Design Rationale:
 * - getApps() checks for existing Firebase app instances
 * - Prevents duplicate initialization which can cause errors
 * - Essential for Next.js applications with hot reloading
 * - Ensures consistent app instance across the application lifecycle
 *
 * @returns Firebase app instance (new or existing)
 */
let app: FirebaseApp | null = null

export function getFirebaseClientApp(): FirebaseApp {
  if (app) return app

  app = getApps().length === 0 ? initializeApp(getFirebaseConfig()) : getApps()[0]!
  return app
}

/**
 * Firebase Authentication service instance
 *
 * Used for:
 * - User sign up and sign in
 * - OAuth provider integration (Google, etc.)
 * - Password reset functionality
 * - JWT token management
 * - Custom claims verification
 *
 * @example
 * ```tsx
 * import { auth } from '@/lib/firebase/client'
 *
 * const user = auth.currentUser
 * await signInWithEmailAndPassword(auth, email, password)
 * ```
 */
export function getFirebaseAuth() {
  return getAuth(getFirebaseClientApp())
}

export const auth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(_target, prop, receiver) {
    const firebaseAuth = getFirebaseAuth()
    const value = Reflect.get(firebaseAuth, prop, receiver)
    return typeof value === 'function' ? value.bind(firebaseAuth) : value
  },
})

/**
 * Cloud Firestore database service instance
 *
 * Used for:
 * - Real-time data synchronization
 * - User document storage
 * - Job listings management
 * - Application tracking
 * - Subscription status storage
 *
 * @example
 * ```tsx
 * import { db } from '@/lib/firebase/client'
 *
 * const jobsRef = collection(db, 'jobs')
 * const querySnapshot = await getDocs(jobsRef)
 * ```
 */
export function getFirebaseDb() {
  return getFirestore(getFirebaseClientApp())
}

export const db = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(_target, prop, receiver) {
    const firestore = getFirebaseDb()
    const value = Reflect.get(firestore, prop, receiver)
    return typeof value === 'function' ? value.bind(firestore) : value
  },
})

/**
 * Default Firebase app export for advanced use cases
 *
 * Useful for:
 * - Firebase Analytics initialization
 * - Performance monitoring setup
 * - Custom Firebase service initialization
 * - Testing and mocking scenarios
 */
const firebaseApp = new Proxy({} as FirebaseApp, {
  get(_target, prop, receiver) {
    const clientApp = getFirebaseClientApp()
    const value = Reflect.get(clientApp, prop, receiver)
    return typeof value === 'function' ? value.bind(clientApp) : value
  },
})

export default firebaseApp
