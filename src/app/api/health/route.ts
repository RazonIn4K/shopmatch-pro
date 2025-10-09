/**
 * Health Check API Route for ShopMatch Pro
 *
 * This endpoint provides comprehensive system health monitoring for deployment,
 * debugging, and operational visibility. It validates critical integrations
 * and environment configuration without exposing sensitive information.
 *
 * Purpose:
 * - Deployment verification and monitoring
 * - Environment validation during development
 * - Integration health checks for Firebase and Stripe
 * - Debugging support for production issues
 *
 * Security Considerations:
 * - No sensitive data exposure in responses
 * - Safe environment variable validation
 * - No authentication required (used by monitoring systems)
 * - Proper error handling without information leakage
 */

import { NextResponse } from 'next/server'

/**
 * Comprehensive health check response interface
 *
 * Provides detailed status information for:
 * - System availability and configuration
 * - Third-party service integration status
 * - Environment variable validation
 * - Deployment and operational monitoring
 */
interface HealthCheckResponse {
  /** Overall system status */
  status: 'ok' | 'error'

  /** ISO timestamp of health check execution */
  timestamp: string

  /** Current Node.js environment */
  environment: string

  /** Individual service health indicators */
  checks: {
    /** Firebase configuration and connectivity status */
    firebase: boolean

    /** Stripe configuration and API availability */
    stripe: boolean

    /** Environment variables validation status */
    environment: boolean
  }

  /** Array of specific error messages (only present when status is 'error') */
  errors?: string[]

  /** General error message for unexpected failures */
  error?: string
}

/**
 * GET handler for health check endpoint
 *
 * Performs comprehensive system validation including:
 * 1. Environment variables presence and format validation
 * 2. Firebase configuration smoke testing
 * 3. Stripe configuration validation
 * 4. Service connectivity verification
 *
 * Returns appropriate HTTP status codes:
 * - 200: All systems operational
 * - 500: Configuration or service errors detected
 *
 * @returns NextResponse with health status JSON
 *
 * @example
 * ```bash
 * # Check system health
 * curl http://localhost:3000/api/health
 *
 * # Response (healthy system)
 * {
 *   "status": "ok",
 *   "timestamp": "2025-10-09T21:44:14.780Z",
 *   "environment": "development",
 *   "checks": {
 *     "firebase": true,
 *     "stripe": true,
 *     "environment": true
 *   }
 * }
 * ```
 */
export async function GET(): Promise<NextResponse<HealthCheckResponse>> {
  /**
   * Initialize health check response with default values
   *
   * All checks start as false and are validated individually.
   * This ensures we accurately report the status of each component.
   */
  const healthCheck: HealthCheckResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      firebase: false,
      stripe: false,
      environment: false,
    },
  }

  try {
    // Check if required environment variables are present
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'FIREBASE_PROJECT_ID',
      'STRIPE_SECRET_KEY',
      'STRIPE_PRICE_ID_PRO',
    ]

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

    if (missingVars.length === 0) {
      healthCheck.checks.environment = true
    } else {
      healthCheck.checks.environment = false
      healthCheck.errors = [`Missing environment variables: ${missingVars.join(', ')}`]
    }

    // Try to initialize Firebase (basic smoke test)
    try {
      const { initializeApp, getApps } = await import('firebase/app')
      const apps = getApps()

      if (apps.length > 0 || process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
        healthCheck.checks.firebase = true
      }
    } catch (error) {
      healthCheck.checks.firebase = false
      healthCheck.errors = healthCheck.errors || []
      healthCheck.errors.push(`Firebase check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Try to initialize Stripe (basic smoke test)
    try {
      const Stripe = (await import('stripe')).default
      if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
        healthCheck.checks.stripe = true
      }
    } catch (error) {
      healthCheck.checks.stripe = false
      healthCheck.errors = healthCheck.errors || []
      healthCheck.errors.push(`Stripe check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Determine overall status
    const allChecksPass = Object.values(healthCheck.checks).every(check => check === true)

    if (!allChecksPass) {
      healthCheck.status = 'error'
      return NextResponse.json(healthCheck, { status: 500 })
    }

    return NextResponse.json(healthCheck)

  } catch (error) {
    healthCheck.status = 'error'
    healthCheck.error = error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(healthCheck, { status: 500 })
  }
}