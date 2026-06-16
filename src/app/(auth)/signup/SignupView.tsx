/**
 * SignupView Component
 *
 * Presentational component that renders the signup UI. Business logic lives
 * in the useSignup hook; this component focuses solely on rendering.
 */

'use client'

import { type FormEvent, useState } from 'react'
import Link from 'next/link'
import { Building2, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { UserRole } from '@/lib/contexts/AuthContext'
import { cn } from '@/lib/utils'

import type { UseSignupReturn } from './useSignup'

/**
 * Props for SignupView component
 */
export interface SignupViewProps {
  form: UseSignupReturn['form']
  isLoading: boolean
  authError: string | null
  onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
  onGoogleSignup: () => Promise<void>
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
 * SignupView Component
 *
 * @param form - React Hook Form instance for signup data
 * @param isLoading - Loading state from authentication flow
 * @param authError - Error message to display inline
 * @param onSubmit - Submit handler from useSignup hook
 * @param onGoogleSignup - Google OAuth handler
 */
export function SignupView({
  form,
  isLoading,
  authError,
  onSubmit,
  onGoogleSignup,
}: SignupViewProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('seeker')

  return (
    <Card className="w-full max-w-md border border-[#d9ded4] bg-white text-[#171a16] shadow-xl shadow-[#111812]/10">
      <CardHeader className="space-y-2 text-center">
        <p className="text-sm font-bold uppercase text-[#0f766e]">ShopMatch Pro</p>
        <h1 className="text-3xl font-black tracking-tight text-[#171a16]">Create your demo account</h1>
        <CardDescription className="text-base text-[#5d6659]">
          Create your account to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Google OAuth Button */}
        <Button
          onClick={onGoogleSignup}
          disabled={isLoading}
          variant="outline"
          className="w-full justify-center gap-2 border border-[#cbd5c6] bg-white text-[#171a16] transition-colors hover:border-[#0f766e] hover:bg-[#f7faf6] focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
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
            <span className="w-full border-t border-[#d9ded4]" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="rounded-md bg-white px-3 py-1 text-xs font-bold text-[#5d6659]">
              Or continue with email
            </span>
          </div>
        </div>

        {/* Signup Form */}
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Display Name Field */}
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#171a16]">Display Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your full name"
                      className="border-[#cbd5c6] bg-[#fafaf8] text-[#171a16] placeholder:text-[#6f786b] focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
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

            {/* Role Selection */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#171a16]">I am a:</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedRole('owner')
                          field.onChange('owner')
                        }}
                        disabled={isLoading}
                        className={cn(
                          "justify-start border border-[#cbd5c6] bg-white text-[#171a16] shadow-sm transition-transform hover:translate-y-[-1px] hover:border-[#0f766e] hover:bg-[#f7faf6] focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2",
                          selectedRole === 'owner' &&
                            "border-[#0f766e] bg-[#0f766e] text-white shadow-lg shadow-[#0f766e]/20 hover:bg-[#115e59]"
                        )}
                      >
                        <Building2 className="h-4 w-4" aria-hidden="true" />
                        Employer
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setSelectedRole('seeker')
                          field.onChange('seeker')
                        }}
                        disabled={isLoading}
                        className={cn(
                          "justify-start border border-[#cbd5c6] bg-white text-[#171a16] shadow-sm transition-transform hover:translate-y-[-1px] hover:border-[#0f766e] hover:bg-[#f7faf6] focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2",
                          selectedRole === 'seeker' &&
                            "border-[#0f766e] bg-[#0f766e] text-white shadow-lg shadow-[#0f766e]/20 hover:bg-[#115e59]"
                        )}
                      >
                        <Search className="h-4 w-4" aria-hidden="true" />
                        Job Seeker
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#171a16]">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Create a password"
                      className="border-[#cbd5c6] bg-[#fafaf8] text-[#171a16] placeholder:text-[#6f786b] focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-[#171a16]">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Confirm your password"
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
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 text-center">
        <div className="text-sm text-[#5d6659]">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#0f766e] hover:underline">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
