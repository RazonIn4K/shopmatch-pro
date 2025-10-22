/**
 * useSignup Hook
 *
 * Custom React hook that encapsulates all signup business logic including
 * email/password registration, Google OAuth, form management, and error handling.
 *
 * Separates business logic from UI rendering for better testability and maintainability.
 */

import { type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import { useAuth } from '@/lib/contexts/AuthContext'
import { signupSchema, type SignupFormData } from './schemas'

/**
 * useSignup Hook Return Type
 *
 * Provides everything needed for the signup UI:
 * - Form instance (React Hook Form)
 * - Loading states
 * - Error states
 * - Submit handlers for email/password and Google OAuth
 */
export interface UseSignupReturn {
  form: ReturnType<typeof useForm<SignupFormData>>
  isLoading: boolean
  authError: string | null
  handleEmailSignup: (event: FormEvent<HTMLFormElement>) => Promise<void>
  handleGoogleSignup: () => Promise<void>
}

/**
 * Main Signup Hook
 *
 * Manages signup flow with Firebase Auth integration:
 * 1. Form validation via Zod schema
 * 2. Account creation with role assignment
 * 3. User document initialization
 * 4. Success/error handling with toast notifications
 * 5. Post-signup navigation to dashboard
 */
export function useSignup(): UseSignupReturn {
  const router = useRouter()
  const { signup, signinWithGoogle, loading, error, clearError } = useAuth()

  /**
   * Form instance with Zod validation
   */
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      role: 'seeker',
    },
  })

  /**
   * Handle email/password signup
   *
   * Creates new user account with Firebase Auth and sets up user document
   * with selected role. On success, shows welcome message and redirects.
   *
   * @param event - Form submission event
   */
  const handleEmailSignup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const isValid = await form.trigger()
    if (!isValid) return

    const data = form.getValues()

    try {
      clearError()
      await signup(data.email, data.password, data.role, data.displayName)

      toast.success(
        `Welcome to ShopMatch Pro! Your account has been created as ${
          data.role === 'owner' ? 'an employer' : 'a job seeker'
        }.`
      )
      router.push('/dashboard')
    } catch (error) {
      // Error is handled by AuthContext and displayed via error state
      console.error('Signup failed:', error)
    }
  }

  /**
   * Handle Google OAuth signup
   *
   * Initiates Google popup authentication flow.
   * Defaults to 'seeker' role for Google auth users.
   */
  const handleGoogleSignup = async () => {
    try {
      clearError()
      await signinWithGoogle()

      toast.success('Welcome to ShopMatch Pro! Your account has been created.')
      router.push('/dashboard')
    } catch (error) {
      // Error is handled by AuthContext and displayed via error state
      console.error('Google signup failed:', error)
    }
  }

  return {
    form,
    isLoading: loading,
    authError: error,
    handleEmailSignup,
    handleGoogleSignup,
  }
}
