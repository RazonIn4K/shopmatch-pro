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
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

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
   * Security: Managed via environment variable to allow easy updates without code changes.
   */
  PRO_PRICE_ID: process.env.STRIPE_PRICE_ID_PRO!,

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
  WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,

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
    priceId: STRIPE_CONFIG.PRO_PRICE_ID,
  },
} as const

/**
 * Type exports for enhanced TypeScript support
 *
 * Provides type safety for subscription-related operations throughout the application.
 */
export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS
export type SubscriptionTierConfig = typeof SUBSCRIPTION_TIERS[SubscriptionTier]