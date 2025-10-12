/**
 * Signup Page for ShopMatch Pro
 *
 * Provides user registration interface with role selection between job owners
 * (employers) and job seekers. Includes comprehensive form validation and
 * seamless integration with Firebase Authentication.
 *
 * Features:
 * - Email/password registration with validation
 * - Role selection (Owner for job posters, Seeker for applicants)
 * - Google OAuth integration as alternative
 * - Form validation with Zod schema
 * - Real-time error handling and user feedback
 * - Responsive design with shadcn/ui components
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useAuth, UserRole } from '@/lib/contexts/AuthContext'

/**
 * Signup form validation schema
 *
 * Comprehensive validation for:
 * - Email format and uniqueness
 * - Password strength requirements
 * - Display name requirements
 * - Role selection validation
 */
const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters'),
  role: z.enum(['owner', 'seeker'], {
    message: 'Please select a role',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

/**
 * Signup Page Component
 *
 * Main registration interface that handles new user account creation.
 * Integrates with Firebase Auth and creates corresponding user documents.
 */
export default function SignupPage() {
  const router = useRouter()
  const { signup, signinWithGoogle, loading, error, clearError } = useAuth()
  const [selectedRole, setSelectedRole] = useState<UserRole>('seeker')

  /**
   * Form handling with React Hook Form and Zod validation
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
   * Handle email/password registration
   *
   * Creates new user account with Firebase Auth and sets up user document
   * with selected role. On success, shows welcome message and redirects.
   */
  const handleSignup = async (data: SignupFormData) => {
    try {
      clearError()
      await signup(data.email, data.password, data.role, data.displayName)

      toast.success(`Welcome to ShopMatch Pro! Your account has been created as ${data.role === 'owner' ? 'an employer' : 'a job seeker'}.`)
      router.push('/dashboard')
    } catch (error) {
      // Error is handled by AuthContext and displayed via error state
      console.error('Signup failed:', error)
    }
  }

  /**
   * Handle Google OAuth registration
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

  /**
   * Main signup form interface
   */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Join ShopMatch Pro</CardTitle>
          <CardDescription className="text-center">
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google OAuth Button */}
          <Button
            onClick={handleGoogleSignup}
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
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Signup Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
              {/* Display Name Field */}
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your full name"
                        disabled={loading}
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

              {/* Role Selection */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>I am a:</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={selectedRole === 'owner' ? 'default' : 'outline'}
                          onClick={() => {
                            setSelectedRole('owner')
                            field.onChange('owner')
                          }}
                          disabled={loading}
                          className="justify-start"
                        >
                          🏢 Employer
                        </Button>
                        <Button
                          type="button"
                          variant={selectedRole === 'seeker' ? 'default' : 'outline'}
                          onClick={() => {
                            setSelectedRole('seeker')
                            field.onChange('seeker')
                          }}
                          disabled={loading}
                          className="justify-start"
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Create a password"
                        disabled={loading}
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
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Confirm your password"
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
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}