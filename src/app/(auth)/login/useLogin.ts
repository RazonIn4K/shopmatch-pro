/**
 * useLogin Hook
 *
 * Custom hook that encapsulates login business logic including:
 * - Email/password authentication
 * - Google OAuth authentication
 * - Form state management
 * - Loading states
 * - Error handling
 *
 * This hook separates authentication logic from UI components,
 * making the code more testable and maintainable.
 */

'use client'

import { useState, type FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useAuth } from '@/lib/contexts/AuthContext'
import { loginSchema, type LoginFormData } from './schemas'

/**
 * Login hook return type
 *
 * Provides all state and handlers needed for login UI components
 */
export interface UseLoginReturn {
  form: ReturnType<typeof useForm<LoginFormData>>
  isLoading: boolean
  authError: string | null
  handleEmailLogin: (e: FormEvent) => Promise<void>
  handleGoogleLogin: () => Promise<void>
}

/**
 * useLogin Hook
 *
 * Manages authentication flows for email/password and Google OAuth.
 * Handles form validation, loading states, and navigation on success.
 *
 * @returns Login state and handlers
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { form, isLoading, authError, handleEmailLogin } = useLogin()
 *
 *   return (
 *     <form onSubmit={handleEmailLogin}>
 *       <input {...form.register('email')} />
 *       <input {...form.register('password')} />
 *       {authError && <p>{authError}</p>}
 *       <button disabled={isLoading}>Sign In</button>
 *     </form>
 *   )
 * }
 * ```
 */
export function useLogin(): UseLoginReturn {
  const router = useRouter()
  const { signin, signinWithGoogle, loading: authLoading, error, clearError } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Form handling with React Hook Form and Zod validation
   */
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  /**
   * Handle email/password login
   *
   * Validates form data, calls AuthContext signin, and handles navigation.
   * Shows toast notifications for success/failure.
   *
   * @param e - Form submit event
   */
  const handleEmailLogin = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)

    try {
      clearError()
      const { email, password } = form.getValues()

      // Call Firebase Auth signin
      await signin(email, password)

      // Success - show toast and navigate
      toast.success('Signed in successfully!')
      router.push('/dashboard')
    } catch {
      // Error is already set in AuthContext.error
      // Toast shows user-friendly message
      const errorMessage = error || 'Login failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle Google OAuth login
   *
   * Initiates Google popup authentication flow.
   * Shows toast notifications and navigates on success.
   */
  const handleGoogleLogin = async (): Promise<void> => {
    setIsLoading(true)

    try {
      clearError()

      // Call Firebase Auth Google signin
      await signinWithGoogle()

      // Success - show toast and navigate
      toast.success('Signed in successfully!')
      router.push('/dashboard')
    } catch {
      // Error is already set in AuthContext.error
      const errorMessage = error || 'Google login failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    form,
    isLoading: isLoading || authLoading,
    authError: error,
    handleEmailLogin,
    handleGoogleLogin,
  }
}
