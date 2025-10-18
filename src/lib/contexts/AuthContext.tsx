/**
 * Authentication Context for ShopMatch Pro
 *
 * This context provides Firebase Authentication integration throughout the application.
 * It manages user state, authentication methods, and role-based access control.
 *
 * Features:
 * - Email/password authentication
 * - Google OAuth integration
 * - Password reset functionality
 * - Automatic user document creation on signup
 * - Role-based user management (owner/seeker)
 * - Real-time authentication state updates
 *
 * Security Considerations:
 * - Proper error handling for authentication failures
 * - Secure token management through Firebase Auth
 * - Role validation and authorization
 * - Protection against common auth vulnerabilities
 */

'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/client'

/**
 * User role enumeration for type safety
 */
export type UserRole = 'owner' | 'seeker'

/**
 * Extended user interface with application-specific fields
 */
export interface AppUser extends Omit<User, 'displayName' | 'email'> {
  role?: UserRole
  displayName: string | null
  email: string | null
}

/**
 * Authentication context interface
 */
interface AuthContextType {
  /** Current authenticated user or null */
  user: AppUser | null

  /** Loading state during authentication operations */
  loading: boolean

  /** Authentication error messages */
  error: string | null

  /** Sign up with email and password */
  signup: (email: string, password: string, role: UserRole, displayName: string) => Promise<void>

  /** Sign in with email and password */
  signin: (email: string, password: string) => Promise<void>

  /** Sign in with Google OAuth */
  signinWithGoogle: () => Promise<void>

  /** Sign out current user */
  logout: () => Promise<void>

  /** Send password reset email */
  resetPassword: (email: string) => Promise<void>

  /** Update user profile information */
  updateUserProfile: (updates: { displayName?: string }) => Promise<void>

  /** Clear authentication errors */
  clearError: () => void
}

/**
 * Authentication context with default values
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Authentication provider props
 */
interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Creates user document in Firestore on successful signup
 *
 * This function ensures every new user has a corresponding document
 * in the users collection with their role and basic information.
 *
 * @param user - Firebase Auth user object
 * @param role - User role (owner or seeker)
 * @param displayName - User's display name
 */
async function createUserDocument(user: User, role: UserRole, displayName: string) {
  const userDocRef = doc(db, 'users', user.uid)
  const userDocSnap = await getDoc(userDocRef)

  // Only create document if it doesn't exist (prevents overwrites)
  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: role,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      // Initialize subscription status (will be updated by Stripe webhook)
      subActive: false,
    })
  }
}

/**
 * Authentication Provider Component
 *
 * Wraps the application to provide authentication context and manages
 * the global authentication state using Firebase Auth.
 *
 * Key Features:
 * - Real-time authentication state synchronization
 * - Automatic error state management
 * - Loading state handling during auth operations
 * - User document management in Firestore
 *
 * @param children - Child components that need authentication context
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Clear authentication errors
   */
  const clearError = () => setError(null)

  /**
   * Sign up new user with email and password
   *
   * Creates Firebase Auth user and corresponding Firestore document
   * with selected role and user information.
   *
   * @param email - User's email address
   * @param password - User's password (min 6 characters)
   * @param role - User role (owner for job posters, seeker for job applicants)
   * @param displayName - User's display name
   */
  const signup = async (email: string, password: string, role: UserRole, displayName: string) => {
    try {
      setLoading(true)
      setError(null)

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Update user profile with display name
      await updateProfile(userCredential.user, { displayName })

      // Create user document in Firestore
      await createUserDocument(userCredential.user, role, displayName)

      // Initialize custom claims on the server
      const token = await userCredential.user.getIdToken()
      await fetch('/api/users/initialize-claims', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: role,
        }),
      })

      // CRITICAL: Force token refresh to apply custom claims immediately
      // Without this, role-gated UI won't work until Firebase refreshes the token
      await userCredential.user.getIdToken(true)

    } catch (error: unknown) {
      console.error('Signup error:', error)
      setError(getAuthErrorMessage(error instanceof Error && 'code' in error ? (error as { code: string }).code : ''))
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sign in existing user with email and password
   *
   * @param email - User's email address
   * @param password - User's password
   */
  const signin = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      await signInWithEmailAndPassword(auth, email, password)

    } catch (error: unknown) {
      console.error('Signin error:', error)
      setError(getAuthErrorMessage(error instanceof Error && 'code' in error ? (error as { code: string }).code : ''))
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sign in with Google OAuth
   *
   * Uses Google popup authentication flow.
   * Creates user document if first-time Google sign-in.
   */
  const signinWithGoogle = async () => {
    try {
      setLoading(true)
      setError(null)

      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Create user document if this is a new user
      if (user.displayName && user.email) {
        await createUserDocument(user, 'seeker', user.displayName) // Default to seeker for Google auth

        // Initialize custom claims on the server
        const token = await user.getIdToken()
        await fetch('/api/users/initialize-claims', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            role: 'seeker',
          }),
        })

        // CRITICAL: Force token refresh to apply custom claims immediately
        // Without this, role-gated UI won't work until Firebase refreshes the token
        await user.getIdToken(true)
      }

    } catch (error: unknown) {
      console.error('Google signin error:', error)
      setError(getAuthErrorMessage(error instanceof Error && 'code' in error ? (error as { code: string }).code : ''))
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sign out current user
   */
  const logout = async () => {
    try {
      setLoading(true)
      setError(null)

      await signOut(auth)

    } catch (error: unknown) {
      console.error('Logout error:', error)
      setError(getAuthErrorMessage(error instanceof Error && 'code' in error ? (error as { code: string }).code : ''))
      throw error
    } finally {
      setLoading(false)
    }
  }

  /**
   * Send password reset email
   *
   * @param email - Email address to send reset link to
   */
  const resetPassword = async (email: string) => {
    try {
      setError(null)

      await sendPasswordResetEmail(auth, email)

    } catch (error: unknown) {
      console.error('Password reset error:', error)
      setError(getAuthErrorMessage(error instanceof Error && 'code' in error ? (error as { code: string }).code : ''))
      throw error
    }
  }

  /**
   * Update user profile information
   *
   * @param updates - Object containing profile updates
   */
  const updateUserProfile = async (updates: { displayName?: string }) => {
    try {
      setError(null)

      const currentUser = auth.currentUser
      if (!currentUser) throw new Error('No authenticated user')

      await updateProfile(currentUser, updates)

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null)

    } catch (error: unknown) {
      console.error('Profile update error:', error)
      setError(getAuthErrorMessage(error instanceof Error && 'code' in error ? (error as { code: string }).code : ''))
      throw error
    }
  }

  /**
   * Listen for authentication state changes
   *
   * This effect runs once on component mount and subscribes to Firebase Auth
   * state changes. It automatically updates the user state when users sign in/out.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Fetch additional user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid)
          const userDocSnap = await getDoc(userDocRef)

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data()
            // Preserve Firebase User prototype (maintains methods like getIdToken)
            // while merging with Firestore data
            const appUser = Object.assign(
              Object.create(Object.getPrototypeOf(firebaseUser)),
              firebaseUser
            ) as AppUser
            // Add Firestore properties
            Object.assign(appUser, {
              role: userData.role,
              displayName: userData.displayName || firebaseUser.displayName,
              email: userData.email || firebaseUser.email,
            })
            setUser(appUser)
          } else {
            // Fallback to Firebase Auth data if no Firestore document
            setUser(firebaseUser as AppUser)
          }
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        setError('Failed to load user data')
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    error,
    signup,
    signin,
    signinWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to access authentication context
 *
 * Must be used within an AuthProvider component.
 * Provides easy access to authentication state and methods throughout the app.
 *
 * @returns Authentication context with user state and auth methods
 * @throws Error if used outside AuthProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { user, signin, logout, loading } = useAuth()
 *
 *   if (loading) return <div>Loading...</div>
 *   if (!user) return <LoginForm />
 *
 *   return <div>Welcome, {user.displayName}!</div>
 * }
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

/**
 * Convert Firebase Auth error codes to user-friendly messages
 *
 * Provides localized error messages for common authentication errors
 * to improve user experience and debugging.
 *
 * @param errorCode - Firebase Auth error code
 * @returns User-friendly error message
 */
function getAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists'
    case 'auth/invalid-email':
      return 'Please enter a valid email address'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters'
    case 'auth/user-not-found':
      return 'No account found with this email'
    case 'auth/wrong-password':
      return 'Incorrect password'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection'
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled'
    default:
      return 'An error occurred. Please try again'
  }
}