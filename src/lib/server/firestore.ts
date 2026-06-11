/**
 * Shared Firestore helpers for the server data layer.
 *
 * These utilities are intentionally framework-free: no Next.js imports, no
 * request/response handling. They exist so route handlers and data modules
 * share one implementation of common Firestore concerns.
 */

/**
 * Converts a Firestore Timestamp-like value to a JavaScript Date.
 *
 * Mirrors the long-standing inline pattern `value?.toDate?.() ?? value`:
 * - Timestamp instances are converted via `toDate()`
 * - Dates, strings, null, and undefined pass through unchanged
 */
export function toDateValue<T>(value: T): Date | T {
  if (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  ) {
    return (value as unknown as { toDate(): Date }).toDate()
  }
  return value
}

/**
 * Detects the Firestore "missing composite index" failure mode.
 *
 * Used by list endpoints to fail fast with an actionable 503 instead of
 * surfacing an opaque 500 (see jobs route error handling).
 */
export function isMissingIndexError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false
  }

  const code = (error as { code?: unknown }).code
  const message = (error as { message?: unknown }).message
  const normalizedMessage = typeof message === 'string' ? message.toLowerCase() : ''

  return (
    (code === 9 || code === 'failed-precondition') &&
    normalizedMessage.includes('requires an index')
  )
}
