/**
 * Login Page for ShopMatch Pro
 *
 * Provides user authentication interface with support for email/password
 * and Google OAuth sign-in methods. Includes error handling, loading states,
 * and seamless user experience.
 *
 * Features:
 * - Email/password authentication
 * - Google OAuth integration
 * - Password reset functionality
 * - Form validation with Zod schema
 * - Responsive design with shadcn/ui components
 * - Error state management and user feedback
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuth } from '@/lib/contexts/AuthContext'

/**
 * Login form validation schema
 *
 * Ensures email format is valid and password is provided.
 * Used with React Hook Form for client-side validation.
 */
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

/**
 * Login Page Component
 *
 * Main authentication interface that handles user sign-in flows.
 * Integrates with Firebase Auth through the AuthContext.
 */
export default function LoginPage() {
  const router = useRouter()
  const { signin, signinWithGoogle, resetPassword, loading, error, clearError } = useAuth()
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')

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
   * Handle email/password sign-in
   *
   * Attempts to authenticate user with provided credentials.
   * On success, redirects to dashboard. On error, displays user-friendly message.
   */
  const handleSignin = async (data: LoginFormData) => {
    try {
      clearError()
      await signin(data.email, data.password)

      toast.success('Welcome back!')
      router.push('/dashboard')
    } catch (error) {
      // Error is handled by AuthContext and displayed via error state
      console.error('Login failed:', error)
    }
  }

  /**
   * Handle Google OAuth sign-in
   *
   * Initiates Google popup authentication flow.
   * On success, redirects to dashboard with welcome message.
   */
  const handleGoogleSignin = async () => {
    try {
      clearError()
      await signinWithGoogle()

      toast.success('Welcome!')
      router.push('/dashboard')
    } catch (error) {
      // Error is handled by AuthContext and displayed via error state
      console.error('Google signin failed:', error)
    }
  }

  /**
   * Handle password reset request
   *
   * Sends password reset email to provided email address.
   * Shows success message and switches back to login form.
   */
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast.error('Please enter your email address')
      return
    }

    try {
      clearError()
      await resetPassword(resetEmail)

      toast.success('Password reset email sent! Check your inbox.')
      setIsResettingPassword(false)
      setResetEmail('')
    } catch (error) {
      // Error is handled by AuthContext and displayed via error state
      console.error('Password reset failed:', error)
    }
  }

  /**
   * Show password reset form instead of login form
   */
  if (isResettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <h1 className="text-2xl font-bold text-center">Reset Password</h1>
            <CardDescription className="text-center">
              Enter your email address and we&apos;ll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email</Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full"
              />
            </div>
            {error && (
              <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              onClick={handlePasswordReset}
              disabled={loading || !resetEmail}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send Reset Email'}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsResettingPassword(false)
                setResetEmail('')
                clearError()
              }}
              className="w-full"
            >
              Back to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  /**
   * Main login form interface
   */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <h1 className="text-2xl font-bold text-center">Welcome to ShopMatch Pro</h1>
          <CardDescription className="text-center">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google OAuth Button */}
          <Button
            onClick={handleGoogleSignin}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* Login Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignin)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your password"
                        disabled={loading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                  {error}
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            variant="link"
            onClick={() => setIsResettingPassword(true)}
            className="text-sm text-muted-foreground"
          >
            Forgot your password?
          </Button>
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}