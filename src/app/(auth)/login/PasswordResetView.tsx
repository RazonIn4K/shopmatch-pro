/**
 * PasswordResetView Component
 *
 * Presents the password reset UI. The business logic is provided by
 * the usePasswordReset hook, keeping this component purely presentational.
 */

'use client'

import { type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

import type { UsePasswordResetReturn } from './usePasswordReset'

/**
 * Props for PasswordResetView component
 */
export interface PasswordResetViewProps {
  form: UsePasswordResetReturn['form']
  isLoading: boolean
  authError: string | null
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onBack: () => void
}

/**
 * Renders inline authentication alert for errors
 */
function AuthAlert({ message }: { message: string }) {
  return (
    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
      {message}
    </div>
  )
}

/**
 * PasswordResetView Component
 *
 * @param form - React Hook Form instance for reset data
 * @param isLoading - Loading state during reset request
 * @param authError - Error message to display inline
 * @param onSubmit - Submit handler from usePasswordReset hook
 * @param onBack - Handler to return to the login view
 */
export function PasswordResetView({
  form,
  isLoading,
  authError,
  onSubmit,
  onBack,
}: PasswordResetViewProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <h1 className="text-2xl font-bold text-center">Reset Password</h1>
        <CardDescription className="text-center">
          Enter your email address and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
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
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {authError && <AuthAlert message={authError} />}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          onClick={onBack}
          className="w-full"
        >
          Back to Sign In
        </Button>
      </CardFooter>
    </Card>
  )
}
