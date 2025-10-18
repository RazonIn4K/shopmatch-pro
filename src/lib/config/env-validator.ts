/**
 * Environment Variable Validation Module
 *
 * Provides centralized validation of all required environment variables with
 * clear error messages and fail-fast behavior. Separates client-side (NEXT_PUBLIC_*)
 * and server-side variables for appropriate validation contexts.
 *
 * Purpose:
 * - Prevent runtime failures from missing configuration
 * - Provide clear error messages during development
 * - Enable startup validation for production deployments
 * - Document all required environment variables in one place
 *
 * Usage:
 * ```typescript
 * // In API routes or server components
 * import { validateServerEnv } from '@/lib/config/env-validator'
 * validateServerEnv() // Throws if any server vars missing
 *
 * // In client components
 * import { validateClientEnv } from '@/lib/config/env-validator'
 * validateClientEnv() // Throws if any client vars missing
 *
 * // For health checks
 * import { getEnvStatus } from '@/lib/config/env-validator'
 * const status = getEnvStatus() // Returns validation details
 * ```
 */

/**
 * Client-side environment variables (NEXT_PUBLIC_* prefix)
 * These are exposed to the browser and used for Firebase client SDK initialization
 */
const REQUIRED_CLIENT_ENV_VARS = {
  NEXT_PUBLIC_FIREBASE_API_KEY: 'Firebase API key for client authentication',
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'Firebase Auth domain for OAuth redirects',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'Firebase project identifier',
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'Firebase Storage bucket for file uploads',
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: 'Firebase Cloud Messaging sender ID',
  NEXT_PUBLIC_FIREBASE_APP_ID: 'Firebase app identifier',
} as const

/**
 * Server-side environment variables (never exposed to browser)
 * Used for Firebase Admin SDK, Stripe integration, and application configuration
 */
const REQUIRED_SERVER_ENV_VARS = {
  // Firebase Admin SDK
  FIREBASE_PROJECT_ID: 'Firebase project ID for Admin SDK (can match NEXT_PUBLIC_FIREBASE_PROJECT_ID)',
  FIREBASE_CLIENT_EMAIL: 'Service account email for Firebase Admin SDK authentication',
  FIREBASE_PRIVATE_KEY: 'Service account private key for Firebase Admin SDK (PEM format)',

  // Stripe Configuration
  STRIPE_SECRET_KEY: 'Stripe secret key (sk_test_* for test mode, sk_live_* for production)',
  STRIPE_WEBHOOK_SECRET: 'Stripe webhook signing secret for signature verification',
  STRIPE_PRICE_ID_PRO: 'Stripe Price ID for Pro subscription tier',

  // Application Configuration
  NODE_ENV: 'Node.js environment (development, production, test)',
} as const

/**
 * Optional environment variables with fallback behavior
 * These enhance functionality but have sensible defaults
 */
const OPTIONAL_ENV_VARS = {
  NEXT_PUBLIC_APP_URL: 'Application base URL (falls back to Vercel URLs or localhost)',
  NEXT_PUBLIC_VERCEL_URL: 'Vercel preview deployment URL (auto-set by Vercel)',
  VERCEL_URL: 'Vercel server-side deployment URL (auto-set by Vercel)',
  VERCEL_PROJECT_PRODUCTION_URL: 'Vercel production domain (auto-set by Vercel)',
} as const

/**
 * Environment variable validation result
 */
export interface EnvValidationResult {
  /** Overall validation status */
  valid: boolean

  /** Missing required variables */
  missing: Array<{
    name: string
    description: string
    scope: 'client' | 'server'
  }>

  /** Present optional variables */
  optionalPresent: string[]

  /** Missing optional variables */
  optionalMissing: string[]

  /** Total required variables checked */
  totalRequired: number

  /** Total required variables present */
  totalPresent: number
}

/**
 * Validates a single environment variable
 */
function validateEnvVar(name: string, value: string | undefined): boolean {
  if (!value) return false

  const trimmed = value.trim()
  if (trimmed.length === 0) return false

  // Special validation for private keys (must contain BEGIN/END markers)
  if (name === 'FIREBASE_PRIVATE_KEY') {
    return trimmed.includes('BEGIN PRIVATE KEY') && trimmed.includes('END PRIVATE KEY')
  }

  // Special validation for Stripe keys (must have correct prefix)
  if (name === 'STRIPE_SECRET_KEY') {
    return trimmed.startsWith('sk_test_') || trimmed.startsWith('sk_live_')
  }

  if (name === 'STRIPE_WEBHOOK_SECRET') {
    return trimmed.startsWith('whsec_')
  }

  if (name === 'STRIPE_PRICE_ID_PRO') {
    return trimmed.startsWith('price_')
  }

  // Special validation for email format
  if (name === 'FIREBASE_CLIENT_EMAIL') {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)
  }

  return true
}

/**
 * Validates client-side environment variables
 *
 * @throws Error if any required client variables are missing or invalid
 */
export function validateClientEnv(): void {
  const missing: string[] = []

  for (const [name, description] of Object.entries(REQUIRED_CLIENT_ENV_VARS)) {
    if (!validateEnvVar(name, process.env[name])) {
      missing.push(`${name}: ${description}`)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required client environment variables:\n${missing.map(m => `  - ${m}`).join('\n')}\n\n` +
        `These variables must be prefixed with NEXT_PUBLIC_ and set in your .env.local file.`
    )
  }
}

/**
 * Validates server-side environment variables
 *
 * @throws Error if any required server variables are missing or invalid
 */
export function validateServerEnv(): void {
  const missing: string[] = []

  for (const [name, description] of Object.entries(REQUIRED_SERVER_ENV_VARS)) {
    if (!validateEnvVar(name, process.env[name])) {
      missing.push(`${name}: ${description}`)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required server environment variables:\n${missing.map(m => `  - ${m}`).join('\n')}\n\n` +
        `These variables must be set in your .env.local file (never commit this file).\n` +
        `For production, configure these in your hosting platform (Vercel, etc.).`
    )
  }
}

/**
 * Validates all environment variables (client + server)
 *
 * @throws Error if any required variables are missing or invalid
 */
export function validateAllEnv(): void {
  validateClientEnv()
  validateServerEnv()
}

/**
 * Gets detailed environment validation status without throwing
 *
 * Useful for health checks and diagnostic endpoints where you want
 * to report missing variables without failing the request.
 *
 * @returns Detailed validation result with missing variables
 */
export function getEnvStatus(): EnvValidationResult {
  const missing: EnvValidationResult['missing'] = []
  let totalPresent = 0

  // Check client variables
  for (const [name, description] of Object.entries(REQUIRED_CLIENT_ENV_VARS)) {
    if (!validateEnvVar(name, process.env[name])) {
      missing.push({ name, description, scope: 'client' })
    } else {
      totalPresent++
    }
  }

  // Check server variables
  for (const [name, description] of Object.entries(REQUIRED_SERVER_ENV_VARS)) {
    if (!validateEnvVar(name, process.env[name])) {
      missing.push({ name, description, scope: 'server' })
    } else {
      totalPresent++
    }
  }

  // Check optional variables
  const optionalPresent: string[] = []
  const optionalMissing: string[] = []

  for (const name of Object.keys(OPTIONAL_ENV_VARS)) {
    if (validateEnvVar(name, process.env[name])) {
      optionalPresent.push(name)
    } else {
      optionalMissing.push(name)
    }
  }

  const totalRequired =
    Object.keys(REQUIRED_CLIENT_ENV_VARS).length + Object.keys(REQUIRED_SERVER_ENV_VARS).length

  return {
    valid: missing.length === 0,
    missing,
    optionalPresent,
    optionalMissing,
    totalRequired,
    totalPresent,
  }
}

/**
 * Gets a human-readable summary of environment variable status
 *
 * @returns Formatted string suitable for logging or display
 */
export function getEnvSummary(): string {
  const status = getEnvStatus()

  if (status.valid) {
    return `✅ All ${status.totalRequired} required environment variables are configured`
  }

  const lines = [
    `❌ Missing ${status.missing.length} of ${status.totalRequired} required environment variables:`,
    '',
  ]

  // Group by scope
  const clientMissing = status.missing.filter(m => m.scope === 'client')
  const serverMissing = status.missing.filter(m => m.scope === 'server')

  if (clientMissing.length > 0) {
    lines.push('Client-side (NEXT_PUBLIC_*):')
    clientMissing.forEach(m => {
      lines.push(`  - ${m.name}: ${m.description}`)
    })
    lines.push('')
  }

  if (serverMissing.length > 0) {
    lines.push('Server-side:')
    serverMissing.forEach(m => {
      lines.push(`  - ${m.name}: ${m.description}`)
    })
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Validates environment variables at module import time (server-side only)
 *
 * This ensures that missing configuration is detected immediately when the
 * application starts, rather than at runtime when a feature is first used.
 *
 * Only runs on server-side to avoid breaking client-side builds.
 */
if (typeof window === 'undefined') {
  try {
    validateAllEnv()
    console.log('✅ Environment validation passed')
  } catch (error) {
    // In development, log error but don't crash (for better DX)
    // In production, crash immediately to prevent deployment with missing config
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Environment validation failed (production mode - will exit)')
      console.error(error instanceof Error ? error.message : String(error))
      process.exit(1)
    } else {
      console.warn('⚠️  Environment validation failed (development mode - continuing anyway)')
      console.warn(error instanceof Error ? error.message : String(error))
      console.warn('\nRun `npm run validate-env` to check your .env.local configuration')
    }
  }
}
