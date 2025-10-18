/**
 * Stripe Checkout Session Handler for ShopMatch Pro
 *
 * Creates Stripe Checkout Sessions for subscription purchases.
 * Handles the initial subscription flow and redirects users to Stripe's
 * hosted checkout page for payment processing.
 *
 * CRITICAL REQUIREMENTS:
 * - Must use Node.js runtime (not Edge Runtime)
 * - Must disable caching for dynamic session creation
 * - Must include proper success/cancel redirect URLs
 * - Must pass user ID for webhook processing
 *
 * Security Features:
 * - Server-side session creation only
 * - User authentication verification
 * - Proper error handling without information leakage
 * - Secure redirect URL configuration
 */

// CRITICAL: Use Node.js runtime for Stripe SDK compatibility
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG, SUBSCRIPTION_TIERS } from '@/lib/stripe/config'
import { verifyAuth } from '@/lib/api/auth'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import { getAppBaseUrl } from '@/lib/env'

/**
 * POST handler for creating Stripe Checkout Sessions
 *
 * Creates a subscription-mode checkout session with the Pro tier.
 * Includes user identification for webhook processing and proper
 * success/cancel redirect handling.
 *
 * @param request - Next.js request object
 * @returns NextResponse with checkout session URL or error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication and get user information
    const { uid: userId } = await verifyAuth(request)

    // Get user email for checkout session
    const userRecord = await adminAuth.getUser(userId)
    const userEmail = userRecord.email

    // Check if user already has a Stripe customer ID
    const userDoc = await adminDb.collection('users').doc(userId).get()
    const userData = userDoc.data()
    const existingCustomerId = userData?.stripeCustomerId as string | undefined

    // Get application base URL for redirects
    const baseUrl = getAppBaseUrl()

    // Generate idempotency key to prevent duplicate sessions
    const idempotencyKey = `checkout_${userId}_${Date.now()}`

    // Create Stripe Checkout Session with idempotency and customer reuse
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_CONFIG.PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscribe?canceled=true`,
      client_reference_id: userId, // Pass user ID for webhook processing
      // Reuse existing customer or create new one with email
      ...(existingCustomerId
        ? { customer: existingCustomerId }
        : { customer_email: userEmail || undefined }
      ),
      metadata: {
        userId: userId,
        tier: SUBSCRIPTION_TIERS.PRO.id,
      },
      subscription_data: {
        metadata: {
          userId: userId,
          tier: SUBSCRIPTION_TIERS.PRO.id,
        },
      },
      allow_promotion_codes: true, // Enable promo codes if you have them
      billing_address_collection: 'required', // Collect billing address
    }, {
      idempotencyKey, // Prevent duplicate sessions on retries
    })

    // Return the checkout session URL to redirect the user
    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })

  } catch (error: unknown) {
    console.error('Checkout session creation failed:', error)

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

/**
 * GET handler for checkout endpoint information
 *
 * Provides endpoint information for development and debugging.
 * Not used in production checkout flow.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Stripe checkout endpoint ready',
    note: 'Use POST method to create checkout sessions',
    config: {
      mode: 'subscription',
      tier: SUBSCRIPTION_TIERS.PRO.name,
    },
  })
}
