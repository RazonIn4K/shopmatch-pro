/**
 * Environment helpers for deriving deployment-aware configuration values.
 *
 * The Vercel deployment previously depended on `NEXT_PUBLIC_APP_URL` being set
 * to a non-localhost value. When the variable was missing or left at the local
 * default, runtime features (Stripe redirects, metadata canonical URLs) would
 * continue to reference `http://localhost:3000`, breaking the hosted site.
 *
 * This module centralises the base URL detection logic so that we can fall
 * back to Vercel-provided environment hints (`VERCEL_URL`,
 * `NEXT_PUBLIC_VERCEL_URL`) before defaulting to localhost. The helper ensures
 * the returned value is a well-formed absolute URL suitable for server and
 * client contexts.
 */

const DEFAULT_APP_URL = 'http://localhost:3000'

/**
 * Normalises a raw environment URL by trimming whitespace, adding a protocol
 * when necessary, and removing trailing slashes.
 */
function normaliseUrl(candidate?: string | null): string | null {
  if (!candidate) {
    return null
  }

  const trimmed = candidate.trim()
  if (trimmed.length === 0) {
    return null
  }

  // Preserve explicit protocols when provided; otherwise assume HTTPS except
  // for localhost, where HTTP is the expected scheme.
  const hasProtocol = /^https?:\/\//i.test(trimmed)
  const hostnameOnly = !hasProtocol && !trimmed.startsWith('//')

  let url = trimmed
  if (hostnameOnly) {
    const shouldUseHttp = trimmed.startsWith('localhost') || trimmed.startsWith('127.0.0.1')
    url = `${shouldUseHttp ? 'http' : 'https'}://${trimmed}`
  }

  // Normalise protocol-relative URLs (e.g. //example.com)
  if (!hasProtocol && trimmed.startsWith('//')) {
    url = `https:${trimmed}`
  }

  // Remove trailing slashes for consistency
  return url.replace(/\/+$/u, '')
}

/**
 * Determines the application base URL with sensible fallbacks for Vercel.
 */
export function getAppBaseUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
    process.env.VERCEL_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
  ]

  for (const candidate of candidates) {
    const normalised = normaliseUrl(candidate)
    if (normalised) {
      return normalised
    }
  }

  return DEFAULT_APP_URL
}

/**
 * Convenience helper for metadata definitions that require a URL instance.
 */
export function getMetadataBase(): URL {
  return new URL(getAppBaseUrl())
}
