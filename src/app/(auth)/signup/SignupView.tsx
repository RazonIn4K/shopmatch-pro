/**
 * SignupView Component
 *
 * Presentational component that renders the signup UI. Business logic lives
 * in the useSignup hook; this component focuses solely on rendering.
 */

'use client'

import { type FormEvent, useState } from 'react'
import Link from 'next/link'

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
    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded">
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
    <Card className="w-full max-w-md border border-slate-200/70 bg-white/95 text-foreground shadow-xl shadow-slate-900/10 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/90 dark:text-slate-50 dark:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.85)]">
      <CardHeader className="space-y-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Join ShopMatch Pro</h1>
        <CardDescription className="text-base text-muted-foreground dark:text-slate-300">
          Create your account to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Google OAuth Button */}
        <Button
          onClick={onGoogleSignup}
          disabled={isLoading}
          variant="outline"
          className="w-full justify-center gap-2 border border-slate-200/70 bg-white text-foreground transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700/80"
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
            <span className="w-full border-t border-slate-200/80 dark:border-slate-700/60" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-muted-foreground dark:bg-slate-900 dark:text-slate-300">
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
                  <FormLabel className="text-sm font-semibold text-foreground">Display Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your full name"
                      className="bg-slate-50/80 text-foreground placeholder:text-slate-500 focus-visible:ring-primary/70 focus-visible:ring-offset-2 dark:bg-slate-800/70 dark:text-slate-50 dark:placeholder:text-slate-400"
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
                  <FormLabel className="text-sm font-semibold text-foreground">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="Enter your email"
                      className="bg-slate-50/80 text-foreground placeholder:text-slate-500 focus-visible:ring-primary/70 focus-visible:ring-offset-2 dark:bg-slate-800/70 dark:text-slate-50 dark:placeholder:text-slate-400"
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
                  <FormLabel className="text-sm font-semibold text-foreground">I am a:</FormLabel>
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
                          "justify-start border border-slate-200/80 bg-white/90 text-foreground shadow-sm transition-transform hover:translate-y-[-1px] hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700/80",
                          selectedRole === 'owner' &&
                            "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 focus-visible:ring-blue-400 dark:border-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400"
                        )}
                      >
                        🏢 Employer
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
                          "justify-start border border-slate-200/80 bg-white/90 text-foreground shadow-sm transition-transform hover:translate-y-[-1px] hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-slate-700/80",
                          selectedRole === 'seeker' &&
                            "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 focus-visible:ring-blue-400 dark:border-blue-400 dark:bg-blue-500 dark:hover:bg-blue-400"
                        )}
                      >
                        🔍 Job Seeker
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
                  <FormLabel className="text-sm font-semibold text-foreground">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Create a password"
                      className="bg-slate-50/80 text-foreground placeholder:text-slate-500 focus-visible:ring-primary/70 focus-visible:ring-offset-2 dark:bg-slate-800/70 dark:text-slate-50 dark:placeholder:text-slate-400"
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
                  <FormLabel className="text-sm font-semibold text-foreground">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Confirm your password"
                      className="bg-slate-50/80 text-foreground placeholder:text-slate-500 focus-visible:ring-primary/70 focus-visible:ring-offset-2 dark:bg-slate-800/70 dark:text-slate-50 dark:placeholder:text-slate-400"
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
              className="w-full bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-500 focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3 text-center">
        <div className="text-sm text-muted-foreground dark:text-slate-300">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300">
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
