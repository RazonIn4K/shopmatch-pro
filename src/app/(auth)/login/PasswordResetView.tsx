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
    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
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
    <Card className="w-full max-w-md border border-[#d9ded4] bg-white text-[#171a16] shadow-xl shadow-[#111812]/10">
      <CardHeader className="space-y-2 text-center">
        <p className="text-sm font-bold uppercase text-[#0f766e]">Account access</p>
        <h1 className="text-3xl font-black tracking-tight text-[#171a16]">Reset password</h1>
        <CardDescription className="text-base text-[#5d6659]">
          Enter your email address and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#171a16]">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      className="border-[#cbd5c6] bg-[#fafaf8] text-[#171a16] placeholder:text-[#6f786b] focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {authError && <AuthAlert message={authError} />}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0f766e] text-white shadow-lg shadow-[#0f766e]/20 transition-colors hover:bg-[#115e59] focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
            >
              {isLoading ? 'Sending...' : 'Send Reset Email'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          onClick={onBack}
          className="w-full border-[#cbd5c6] bg-white text-[#171a16] transition-colors hover:border-[#0f766e] hover:bg-[#f7faf6] focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
        >
          Back to Sign In
        </Button>
      </CardFooter>
    </Card>
  )
}
