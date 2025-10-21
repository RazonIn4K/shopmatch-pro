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
 *
 * Architecture:
 * - Uses custom hooks (useLogin, usePasswordReset) for business logic
 * - Separates concerns: UI components vs authentication logic
 * - Testable and maintainable code structure
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { useLogin } from './useLogin'
import { usePasswordReset } from './usePasswordReset'

/**
 * Login Page Component
 *
 * Main authentication interface that handles user sign-in flows.
 * Switches between login form and password reset form based on user action.
 */
export default function LoginPage() {
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  // Custom hooks manage authentication logic
  const loginHook = useLogin()
  const resetHook = usePasswordReset()

  /**
   * Password Reset Form
   *
   * Displayed when user clicks "Forgot password?"
   * Allows user to request password reset email.
   */
  if (isResettingPassword) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <h1 className="text-2xl font-bold text-center">Reset Password</h1>
            <CardDescription className="text-center">
              Enter your email address and we&apos;ll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Form {...resetHook.form}>
              <form onSubmit={resetHook.handlePasswordReset} className="space-y-4">
                <FormField
                  control={resetHook.form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Enter your email"
                          disabled={resetHook.isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {resetHook.authError && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                    {resetHook.authError}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={resetHook.isLoading}
                  className="w-full"
                >
                  {resetHook.isLoading ? 'Sending...' : 'Send Reset Email'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsResettingPassword(false)
                resetHook.clearAuthError()
              }}
              className="w-full"
            >
              Back to Sign In
            </Button>
          </CardFooter>
        </Card>
      </main>
    )
  }

  /**
   * Main Login Form
   *
   * Default view with email/password login and Google OAuth option.
   */
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
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
            onClick={loginHook.handleGoogleLogin}
            disabled={loginHook.isLoading}
            variant="outline"
            className="w-full"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <title>Google logo</title>
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

          {/* Email/Password Login Form */}
          <Form {...loginHook.form}>
            <form onSubmit={loginHook.handleEmailLogin} className="space-y-4">
              <FormField
                control={loginHook.form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email"
                        disabled={loginHook.isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginHook.form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your password"
                        disabled={loginHook.isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {loginHook.authError && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                  {loginHook.authError}
                </div>
              )}

              <Button type="submit" disabled={loginHook.isLoading} className="w-full">
                {loginHook.isLoading ? 'Signing in...' : 'Sign In'}
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
    </main>
  )
}
