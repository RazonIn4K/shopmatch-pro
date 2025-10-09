/**
 * Subscription Page for ShopMatch Pro
 *
 * Provides subscription management interface for users to purchase
 * ShopMatch Pro access. Integrates with Stripe Checkout for payment
 * processing and includes proper authentication checks.
 *
 * Features:
 * - Subscription plan display with pricing
 * - Stripe Checkout integration
 * - Authentication requirement checking
 * - Success/cancel state handling
 * - Responsive design with shadcn/ui components
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/contexts/AuthContext'
import { SUBSCRIPTION_TIERS } from '@/lib/stripe/config'

/**
 * Subscription Page Component
 *
 * Main interface for subscription management and checkout flow.
 * Handles authentication, checkout initiation, and success/cancel states.
 */
export default function SubscribePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)

  /**
   * Handle successful subscription checkout
   *
   * Shows success message and redirects to dashboard.
   * Triggered when user returns from successful Stripe checkout.
   */
  useEffect(() => {
    const success = searchParams.get('success')
    const canceled = searchParams.get('canceled')

    if (success === 'true') {
      toast.success('🎉 Welcome to ShopMatch Pro! Your subscription is now active.')
      router.replace('/dashboard')
    } else if (canceled === 'true') {
      toast.error('Subscription cancelled. You can try again anytime.')
    }
  }, [searchParams, router])

  /**
   * Handle subscription checkout
   *
   * Creates Stripe Checkout session and redirects user to payment flow.
   * Requires user authentication and handles loading states.
   */
  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please sign in to subscribe')
      router.push('/login')
      return
    }

    try {
      setLoading(true)

      // Get Firebase auth token for API authentication
      const token = await user.getIdToken()

      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()

      // Redirect to Stripe Checkout
      window.location.href = url

    } catch (error: any) {
      console.error('Subscription error:', error)
      toast.error(error.message || 'Failed to start subscription process')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Show loading state while checking authentication
   */
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  /**
   * Redirect authenticated users to dashboard
   * (they should manage subscription through customer portal)
   */
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Already Signed In</CardTitle>
            <CardDescription>
              You're already signed in. Visit your dashboard to manage your subscription.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  /**
   * Main subscription interface for non-authenticated users
   */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get started with ShopMatch Pro and unlock powerful job posting features
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Pro Plan Card */}
          <Card className="relative">
            <CardHeader className="text-center pb-8">
              <div className="flex justify-center mb-4">
                <Badge variant="secondary" className="text-sm">
                  Most Popular
                </Badge>
              </div>
              <CardTitle className="text-2xl">{SUBSCRIPTION_TIERS.PRO.name}</CardTitle>
              <CardDescription className="text-base">
                {SUBSCRIPTION_TIERS.PRO.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center space-y-6">
              {/* Features List */}
              <div className="space-y-3 text-left">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Unlimited job postings</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Application management dashboard</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Advanced filtering and search</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Priority support</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-8">
              <Button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full text-lg py-6"
                size="lg"
              >
                {loading ? 'Starting subscription...' : 'Subscribe Now'}
              </Button>
            </CardFooter>
          </Card>

          {/* Free Plan Card (Coming Soon) */}
          <Card className="opacity-75">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-muted-foreground">Free</CardTitle>
              <CardDescription className="text-base">
                Browse available jobs (Coming Soon)
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center space-y-6">
              <div className="space-y-3 text-left text-muted-foreground">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-muted-foreground mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Browse job listings</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-muted-foreground mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Apply to jobs</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="w-5 h-5 mr-3"></span>
                  <span>Post jobs (Pro feature)</span>
                </div>
                <div className="flex items-center text-muted-foreground">
                  <span className="w-5 h-5 mr-3"></span>
                  <span>Manage applications (Pro feature)</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-8">
              <Button disabled className="w-full text-lg py-6" size="lg">
                Coming Soon
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Already have an account?
          </p>
          <Button variant="outline" onClick={() => router.push('/login')}>
            Sign In
          </Button>
        </div>
      </div>
    </div>
  )
}