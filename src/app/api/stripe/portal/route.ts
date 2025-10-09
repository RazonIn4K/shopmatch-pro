/**
 * Stripe Customer Portal Handler for ShopMatch Pro
 *
 * Creates Stripe Customer Portal sessions for subscription management.
 * Allows users to update payment methods, view billing history, and
 * manage their subscriptions through Stripe's hosted portal.
 *
 * CRITICAL REQUIREMENTS:
 * - Must use Node.js runtime (not Edge Runtime)
 * - Must disable caching for dynamic session creation
 * - Requires authenticated user with existing Stripe customer
 * - Must handle missing customer scenarios gracefully
 *
 * Security Features:
 * - Server-side session creation only
 * - User authentication verification via Firebase token
 * - Secure redirect URL configuration
 * - Proper error handling without information leakage
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

/**
 * POST handler for creating Stripe Customer Portal Sessions
 *
 * Creates a customer portal session for authenticated users to manage
 * their subscriptions, payment methods, and billing information.
 *
 * @param request - Next.js request object
 * @returns NextResponse with portal session URL or error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get authorization token from request headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify the token and get user information
    const decodedToken = await adminAuth.verifyIdToken(token)
    const userId = decodedToken.uid

    // Get user document to retrieve Stripe customer ID
    const userDoc = await adminDb.collection('users').doc(userId).get()

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userData = userDoc.data()
    const stripeCustomerId = userData?.stripeCustomerId

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: 'No active subscription found. Please subscribe first.' },
        { status: 400 }
      )
    }

    // Get application base URL for redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Stripe Customer Portal Session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${baseUrl}/dashboard`, // Return to dashboard after portal actions
    })

    // Return the portal session URL to redirect the user
    return NextResponse.json({
      url: session.url,
    })

  } catch (error: any) {
    console.error('Customer portal session creation failed:', error)

    return NextResponse.json(
      { error: 'Failed to create customer portal session' },
      { status: 500 }
    )
  }
}

/**
 * GET handler for portal endpoint information
 *
 * Provides endpoint information for development and debugging.
 * Not used in production portal flow.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Stripe customer portal endpoint ready',
    note: 'Use POST method to create portal sessions',
    requirements: [
      'User must be authenticated',
      'User must have active Stripe customer ID',
      'Valid return URL configuration required',
    ],
  })
}