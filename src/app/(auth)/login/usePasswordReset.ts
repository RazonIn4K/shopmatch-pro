/**
 * usePasswordReset Hook
 *
 * Custom hook that encapsulates password reset business logic including:
 * - Form state management
 * - Email validation
 * - Password reset email sending
 * - Loading states
 * - Error handling
 *
 * This hook separates password reset logic from UI components,
 * making the code more testable and maintainable.
 */

'use client'

import { useState, type FormEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { useAuth } from '@/lib/contexts/AuthContext'
import { resetSchema, type ResetFormData } from './schemas'

/**
 * Password Reset hook return type
 *
 * Provides all state and handlers needed for password reset UI
 */
export interface UsePasswordResetReturn {
  form: ReturnType<typeof useForm<ResetFormData>>
  isLoading: boolean
  authError: string | null
  handlePasswordReset: (e: FormEvent) => Promise<void>
  clearAuthError: () => void
}

/**
 * usePasswordReset Hook
 *
 * Manages password reset flow including form validation and email sending.
 * Handles loading states, success/error notifications, and form reset.
 *
 * @returns Password reset state and handlers
 *
 * @example
 * ```tsx
 * function PasswordResetForm() {
 *   const { form, isLoading, handlePasswordReset, authError } = usePasswordReset()
 *
 *   return (
 *     <form onSubmit={handlePasswordReset}>
 *       <input {...form.register('email')} />
 *       {authError && <p>{authError}</p>}
 *       <button disabled={isLoading}>Send Reset Link</button>
 *     </form>
 *   )
 * }
 * ```
 */
export function usePasswordReset(): UsePasswordResetReturn {
  const { resetPassword, loading: authLoading, error, clearError } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Form handling with React Hook Form and Zod validation
   */
  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  })

  /**
   * Handle password reset request
   *
   * Validates email, sends reset link via Firebase Auth,
   * and shows success/error notifications.
   *
   * @param e - Form submit event
   */
  const handlePasswordReset = async (e: FormEvent): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)

    try {
      clearError()
      const { email } = form.getValues()

      // Call Firebase Auth password reset
      await resetPassword(email)

      // Success - show toast and reset form
      toast.success('Password reset link sent! Check your inbox.')
      form.reset()
    } catch {
      // Error is already set in AuthContext.error
      // Toast shows user-friendly message
      const errorMessage = error || 'Password reset failed. Please try again.'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Clear authentication error
   *
   * Useful when switching back to login form or dismissing errors.
   */
  const clearAuthError = (): void => {
    clearError()
  }

  return {
    form,
    isLoading: isLoading || authLoading,
    authError: error,
    handlePasswordReset,
    clearAuthError,
  }
}
