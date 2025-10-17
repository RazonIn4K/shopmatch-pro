/**
 * Stripe Webhook Handler for ShopMatch Pro
 *
 * This endpoint handles Stripe webhook events for subscription management.
 * It processes subscription lifecycle events and updates Firebase custom claims
 * to control access to job posting features.
 *
 * CRITICAL SECURITY REQUIREMENTS:
 * - Must use Node.js runtime (not Edge Runtime)
 * - Must handle raw request body for signature verification
 * - Must verify webhook signatures before processing events
 * - Must use proper error handling to prevent information leakage
 *
 * Supported Events:
 * - customer.subscription.created: New subscription activated
 * - customer.subscription.updated: Subscription status changes
 * - customer.subscription.deleted: Subscription cancelled
 * - checkout.session.completed: Successful checkout completion
 *
 * Local Development Setup:
 * 1. Install Stripe CLI: npm install -g stripe
 * 2. Login to Stripe: stripe login
 * 3. Forward webhooks: stripe listen --forward-to http://localhost:3000/api/stripe/webhook
 * 4. Use ngrok for production webhook URL: ngrok http 3000
 */

import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_CONFIG } from '@/lib/stripe/config'
import { adminAuth, adminDb } from '@/lib/firebase/admin'

/**
 * Force Node.js runtime for raw body access and Stripe SDK compatibility
 * CRITICAL: Edge Runtime does not support raw request body needed for webhook signature verification
 */
export const runtime = 'nodejs'

/**
 * Disable caching to ensure every webhook event is processed fresh
 */
export const dynamic = 'force-dynamic'

/**
 * Webhook event type definitions for type safety
 */
type StripeWebhookEvent =
  | 'customer.subscription.created'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'checkout.session.completed'

/**
 * Subscription statuses that grant feature access
 *
 * Policy: Both 'active' and 'trialing' subscriptions are treated as active
 * for feature gate purposes. This ensures users have immediate access during
 * trial periods and don't experience feature flickering.
 */
const ACTIVE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing'])

/**
 * POST handler for Stripe webhook endpoint
 *
 * Processes incoming webhook events from Stripe with proper security validation.
 * Updates Firebase custom claims based on subscription status changes.
 *
 * Security Features:
 * - Raw body signature verification
 * - Event type validation
 * - Error handling without information leakage
 * - Proper HTTP status code responses
 *
 * @param request - Next.js request object with raw body
 * @returns NextResponse with appropriate status code
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get raw request body for signature verification
    // CRITICAL: Must use raw text, not parsed JSON
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature header')
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature using raw body
    // This prevents spoofing attacks and ensures event authenticity
    // Use async form for better crypto timing safety
    let event
    try {
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        STRIPE_CONFIG.WEBHOOK_SECRET
      )
    } catch (error: unknown) {
      console.error('Webhook signature verification failed:', error instanceof Error ? error.message : 'Unknown error')
      // Return 400 to tell Stripe the signature is invalid and should not retry
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Process the verified event
    await processWebhookEvent(event)

    // Return success response to Stripe
    return NextResponse.json({ received: true })

  } catch (error: unknown) {
    console.error('Webhook processing error:', error)

    // Return 200 to prevent Stripe from retrying on processing errors
    // The webhook was received and verified, but processing failed
    // Log error for debugging but don't expose details to Stripe
    return NextResponse.json(
      { received: true, error: 'Processing error logged' },
      { status: 200 }
    )
  }
}

/**
 * Process verified webhook events from Stripe
 *
 * Updates Firebase custom claims and Firestore documents based on
 * subscription events. This controls access to job posting features.
 *
 * @param event - Verified Stripe webhook event
 */
async function processWebhookEvent(event: { id: string; type: string; data: { object: unknown } }): Promise<void> {
  console.log(`[Stripe Webhook] Processing event ${event.id} (${event.type})`)

  try {
    switch (event.type as StripeWebhookEvent) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as { customer: string; id: string; status: string })
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCancellation(event.data.object as { customer: string })
        break

      case 'checkout.session.completed':
        await handleCheckoutCompletion(event.data.object as { customer: string; client_reference_id: string })
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error: unknown) {
    console.error(`Error processing ${event.type}:`, error)
    // Don't throw - allow webhook to return success to prevent retries
  }
}

/**
 * Handle subscription creation and updates
 *
 * Updates Firebase custom claims to grant job posting access
 * when user has an active subscription.
 *
 * @param subscription - Stripe subscription object
 */
async function handleSubscriptionUpdate(subscription: { customer: string; id: string; status: string }): Promise<void> {
  const customerId = subscription.customer
  const status = subscription.status // 'active', 'trialing', 'canceled', 'incomplete', etc.

  console.log(`[Subscription Update] sub_id=${subscription.id}, customer=${customerId}, status=${status}`)

  // Check if subscription status grants feature access
  const subActive = ACTIVE_SUBSCRIPTION_STATUSES.has(status)

  if (!subActive) {
    console.log(`[Subscription Update] Skipping non-active status: ${status}`)
    // Note: We still return early for non-active statuses to avoid unnecessary updates
    // The subscription.deleted event will handle deactivation
    return
  }

  try {
    // Find user by Stripe customer ID in Firestore
    const usersRef = adminDb.collection('users')
    const query = await usersRef.where('stripeCustomerId', '==', customerId).get()

    if (query.empty) {
      console.log(`No user found for Stripe customer ${customerId}`)
      return
    }

    const userDoc = query.docs[0]
    const userId = userDoc.id

    // Get existing user record to preserve existing custom claims (e.g., role)
    const userRecord = await adminAuth.getUser(userId)
    const existingClaims = userRecord.customClaims || {}

    // Merge new subscription claims with existing claims
    await adminAuth.setCustomUserClaims(userId, {
      ...existingClaims,
      subActive: true,
      stripeCustomerId: customerId,
      subscriptionId: subscription.id,
      updatedAt: new Date().toISOString(),
    })

    // Update Firestore document with subscription details
    await userDoc.ref.update({
      subActive: true,
      stripeCustomerId: customerId,
      subscriptionId: subscription.id,
      subscriptionStatus: status,
      updatedAt: new Date(),
    })

    console.log(`[Subscription Update] ✅ Activated subscription for user=${userId}, sub_id=${subscription.id}`)

  } catch (error: unknown) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

/**
 * Handle subscription cancellation
 *
 * Removes job posting access when subscription is cancelled.
 *
 * @param subscription - Stripe subscription object
 */
async function handleSubscriptionCancellation(subscription: { customer: string }): Promise<void> {
  const customerId = subscription.customer

  console.log(`[Subscription Cancellation] customer=${customerId}`)

  try {
    // Find user by Stripe customer ID in Firestore
    const usersRef = adminDb.collection('users')
    const query = await usersRef.where('stripeCustomerId', '==', customerId).get()

    if (query.empty) {
      console.log(`No user found for Stripe customer ${customerId}`)
      return
    }

    const userDoc = query.docs[0]
    const userId = userDoc.id

    // Get existing user record to preserve existing custom claims (e.g., role)
    const userRecord = await adminAuth.getUser(userId)
    const existingClaims = userRecord.customClaims || {}

    // Merge updated subscription claims with existing claims
    await adminAuth.setCustomUserClaims(userId, {
      ...existingClaims,
      subActive: false,
      subscriptionId: null,
      updatedAt: new Date().toISOString(),
    })

    // Update Firestore document
    await userDoc.ref.update({
      subActive: false,
      subscriptionId: null,
      subscriptionStatus: 'canceled',
      updatedAt: new Date(),
    })

    console.log(`[Subscription Cancellation] ❌ Removed subscription access for user=${userId}, customer=${customerId}`)

  } catch (error: unknown) {
    console.error('Error cancelling subscription:', error)
    throw error
  }
}

/**
 * Handle successful checkout completion
 *
 * Links Stripe customer ID to user account for future webhook processing.
 *
 * @param session - Stripe checkout session object
 */
async function handleCheckoutCompletion(session: { customer: string; client_reference_id: string }): Promise<void> {
  const customerId = session.customer
  const clientReferenceId = session.client_reference_id // User ID from checkout

  console.log(`[Checkout Completed] customer=${customerId}, user=${clientReferenceId}`)

  if (!clientReferenceId || !customerId) {
    console.log('[Checkout Completed] Missing client_reference_id or customer_id in checkout session')
    return
  }

  try {
    // Update user document with Stripe customer ID
    const userRef = adminDb.collection('users').doc(clientReferenceId)
    await userRef.update({
      stripeCustomerId: customerId,
      updatedAt: new Date(),
    })

    console.log(`[Checkout Completed] ✅ Linked customer=${customerId} to user=${clientReferenceId}`)

  } catch (error: unknown) {
    console.error('Error linking customer ID:', error)
    throw error
  }
}

/**
 * GET handler for webhook endpoint testing
 *
 * Provides basic endpoint verification for development and debugging.
 * Not used in production webhook processing.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    message: 'Stripe webhook endpoint ready',
    timestamp: new Date().toISOString(),
    note: 'Use POST method for webhook events',
  })
}