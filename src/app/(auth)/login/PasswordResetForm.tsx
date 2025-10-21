/**
 * Password Reset Form Component
 *
 * Extracted from LoginPage to reduce complexity and improve maintainability.
 * Handles password reset email submission with validation and error states.
 */

'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import { usePasswordReset } from './usePasswordReset'

interface PasswordResetFormProps {
  onBackToLogin: () => void
}

/**
 * Password Reset Form
 *
 * Allows users to request a password reset email.
 * Includes validation, loading states, and error handling.
 */
export function PasswordResetForm({ onBackToLogin }: PasswordResetFormProps) {
  const resetHook = usePasswordReset()

  const handleBackToLogin = () => {
    resetHook.clearAuthError()
    onBackToLogin()
  }

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
            onClick={handleBackToLogin}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </CardFooter>
      </Card>
    </main>
  )
}
