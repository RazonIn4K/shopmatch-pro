/**
 * Stripe Configuration for ShopMatch Pro
 *
 * This file configures Stripe payment processing and subscription management.
 * It handles both client-side and server-side Stripe operations with proper
 * security practices and environment-based configuration.
 *
 * Critical Security Notes:
 * - Stripe secret key must never be exposed to client-side code
 * - Webhook signatures must be verified with raw request bodies
 * - Price IDs should be managed via environment variables
 * - All webhook endpoints must use Node.js runtime (no Edge Runtime)
 */

import { Stripe } from 'stripe'

/**
 * Require a Stripe environment variable at runtime.
 *
 * Next.js imports route modules during production builds, so Stripe
 * configuration must be validated when payment code runs, not when this module
 * is imported.
 */
function requireStripeEnv(name: 'STRIPE_SECRET_KEY' | 'STRIPE_PRICE_ID_PRO' | 'STRIPE_WEBHOOK_SECRET'): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(
      `Missing required Stripe environment variable: ${name}.\n` +
      'Please check your .env.local file and ensure all Stripe configuration is set.\n' +
      'Run "npm run validate-env" for detailed validation.'
    )
  }

  return value
}

let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(requireStripeEnv('STRIPE_SECRET_KEY'))
  }

  return stripeClient
}

/**
 * Stripe client instance for server-side operations
 *
 * Initialized with:
 * - Secret key from environment variables
 * - Proper TypeScript typing for enhanced development experience
 * - Used exclusively in API routes and server-side functions
 *
 * Security Rationale:
 * - Never imported in client-side components
 * - Handles sensitive payment operations
 * - Performs webhook signature verification
 * - Manages subscription lifecycle events
 *
 * @example
 * ```typescript
 * // In API route handler
 * import { stripe } from '@/lib/stripe/config'
 *
 * const session = await stripe.checkout.sessions.create({
 *   mode: 'subscription',
 *   line_items: [{ price: STRIPE_CONFIG.PRO_PRICE_ID, quantity: 1 }]
 * })
 * ```
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    const client = getStripeClient()
    const value = Reflect.get(client, prop, receiver)
    return typeof value === 'function' ? value.bind(client) : value
  },
})

/**
 * Stripe configuration constants
 *
 * Centralized configuration for Stripe integration including:
 * - Price identifiers for subscription tiers
 * - Webhook security settings
 * - API version management
 *
 * All values sourced from environment variables for security and flexibility.
 */
export const STRIPE_CONFIG = {
  /**
   * Pro subscription price identifier
   *
   * This ID corresponds to the Stripe Price object for the ShopMatch Pro tier.
   * Created in Stripe Dashboard → Products → Pricing.
   *
   * Security: Price IDs are not sensitive and can be safely exposed to the client.
   * Uses NEXT_PUBLIC_ prefix for client-side access, falls back to server-only var.
   */
  get PRO_PRICE_ID() {
    return (typeof window === 'undefined'
      ? process.env.STRIPE_PRICE_ID_PRO
      : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO) || requireStripeEnv('STRIPE_PRICE_ID_PRO')
  },

  /**
   * Webhook endpoint secret for signature verification
   *
   * Required for verifying webhook authenticity. Generated in Stripe Dashboard → Webhooks.
   *
   * Critical Security Feature:
   * - Prevents webhook spoofing attacks
   * - Must be used with raw request body (not parsed JSON)
   * - Required for all production webhook handlers
   *
   * @see https://docs.stripe.com/webhooks
   */
  get WEBHOOK_SECRET() {
    return requireStripeEnv('STRIPE_WEBHOOK_SECRET')
  },

  /**
   * Stripe API version for compatibility
   *
   * Ensures consistent behavior across different Stripe SDK versions.
   * Using a specific version prevents unexpected breaking changes.
   *
   * Note: Earlier API version was commented out due to compatibility issues.
   * Current implementation uses Stripe's default version for maximum compatibility.
   */
  // API_VERSION: '2024-12-18.acacia' as const, // Temporarily disabled for compatibility
} as const

/**
 * Subscription tier definitions
 *
 * Defines available subscription plans with their properties.
 * Easily extensible for additional tiers or pricing models.
 *
 * Current Structure:
 * - PRO: Full-featured tier for job posting and application management
 *
 * Future Extensions:
 * - FREE: Limited trial tier
 * - ENTERPRISE: Advanced features for large organizations
 * - TEAM: Multi-user management features
 */
export const SUBSCRIPTION_TIERS = {
  /**
   * ShopMatch Pro subscription tier
   *
   * Features:
   * - Unlimited job postings
   * - Application management dashboard
   * - Advanced filtering and search
   * - Priority support
   *
   * Technical Details:
   * - Maps to Stripe Price ID for payment processing
   * - Used in checkout session creation
   * - Referenced in subscription management flows
   */
  PRO: {
    id: 'pro',
    name: 'ShopMatch Pro',
    description: 'Post unlimited jobs and manage applications',
    get priceId() {
      return STRIPE_CONFIG.PRO_PRICE_ID
    },
  },
} as const

/**
 * Type exports for enhanced TypeScript support
 *
 * Provides type safety for subscription-related operations throughout the application.
 */
export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS
export type SubscriptionTierConfig = typeof SUBSCRIPTION_TIERS[SubscriptionTier]
