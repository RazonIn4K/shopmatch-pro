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

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/contexts/AuthContext'
import { SUBSCRIPTION_TIERS } from '@/lib/stripe/config'

/**
 * Decorative check icon used in the feature list. Marked as aria-hidden to
 * prevent duplicate announcements for screen-reader users.
 */
const CheckIcon = () => (
  <svg
    className="w-5 h-5 text-green-500 mr-3"
    fill="currentColor"
    viewBox="0 0 20 20"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
)

/**
 * Subscription Page Component (Inner)
 *
 * Main interface for subscription management and checkout flow.
 * Handles authentication, checkout initiation, and success/cancel states.
 */
function SubscribePageContent() {
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

      // Validate URL is from Stripe before redirecting (security: prevent open redirect)
      if (!url || typeof url !== 'string') {
        throw new Error('Invalid checkout URL received')
      }

      // Parse URL to validate hostname (defense-in-depth)
      const checkoutUrl = new URL(url)

      // Whitelist: Only allow exact Stripe checkout domain
      // Stripe Checkout Sessions always use checkout.stripe.com
      const allowedHosts = ['checkout.stripe.com']
      if (!allowedHosts.includes(checkoutUrl.hostname)) {
        throw new Error(`Invalid checkout URL domain: ${checkoutUrl.hostname}`)
      }

      // Ensure HTTPS protocol
      if (checkoutUrl.protocol !== 'https:') {
        throw new Error('Checkout URL must use HTTPS')
      }

      // Redirect to Stripe Checkout
      window.location.href = url

    } catch (error: unknown) {
      console.error('Subscription error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to start subscription process')
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
   * Note: We intentionally allow authenticated users to access this page
   * so they can subscribe after signing up. Users with active subscriptions
   * can still access the customer portal through their dashboard.
   */

  /**
   * Main subscription interface
   */
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Get started with ShopMatch Pro and unlock powerful job posting features
          </p>
          {user && (
            <p className="mt-2 text-sm text-muted-foreground">
              Signed in as {user.email}
            </p>
          )}
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
                  <CheckIcon />
                  <span>Unlimited job postings</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon />
                  <span>Application management dashboard</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon />
                  <span>Advanced filtering and search</span>
                </div>
                <div className="flex items-center">
                  <CheckIcon />
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
        {!user && (
          <div className="text-center mt-12">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Already have an account?
            </p>
            <Button variant="outline" onClick={() => router.push('/login')}>
              Sign In
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}

/**
 * Subscription Page Component (Wrapper)
 *
 * Wraps SubscribePageContent in Suspense boundary for useSearchParams()
 */
export default function SubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SubscribePageContent />
    </Suspense>
  )
}
