/**
 * Rate Limiting Utility for API Routes
 *
 * Implements in-memory rate limiting with configurable limits and time windows.
 * Uses LRU cache to prevent memory leaks in long-running processes.
 *
 * @example
 * ```typescript
 * import { rateLimiter } from '@/lib/api/rate-limit'
 *
 * // In API route:
 * const limiter = rateLimiter({ maxRequests: 5, windowMs: 3600000 }) // 5 req/hour
 * const { allowed, remaining, reset } = await limiter.check(userId)
 *
 * if (!allowed) {
 *   return NextResponse.json({
 *     error: 'Rate limit exceeded',
 *     retryAfter: Math.ceil((reset - Date.now()) / 1000)
 *   }, { status: 429 })
 * }
 * ```
 */

interface RateLimitOptions {
  /**
   * Maximum number of requests allowed within the time window
   */
  maxRequests: number

  /**
   * Time window in milliseconds
   * @example 3600000 // 1 hour
   * @example 60000   // 1 minute
   */
  windowMs: number

  /**
   * Maximum number of unique keys to track (prevents memory leaks)
   * Oldest entries are evicted when limit is reached
   * @default 1000
   */
  maxKeys?: number
}

interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  allowed: boolean

  /**
   * Number of requests remaining in the current window
   */
  remaining: number

  /**
   * Timestamp (ms) when the rate limit window resets
   */
  reset: number

  /**
   * Total number of requests made in the current window
   */
  current: number
}

interface RequestRecord {
  /**
   * Timestamps of requests within the current window
   */
  requests: number[]

  /**
   * Last access time for LRU eviction
   */
  lastAccess: number
}

/**
 * Creates a rate limiter with configurable options
 *
 * Uses sliding window algorithm to track requests over time.
 * Automatically cleans up expired requests and old keys.
 *
 * @param options - Rate limit configuration
 * @returns Rate limiter instance with check method
 */
export function rateLimiter(options: RateLimitOptions) {
  const { maxRequests, windowMs, maxKeys = 1000 } = options

  // In-memory store with LRU eviction
  const store = new Map<string, RequestRecord>()

  /**
   * Removes expired requests from a record
   */
  function cleanExpiredRequests(record: RequestRecord, now: number): void {
    const cutoff = now - windowMs
    record.requests = record.requests.filter((timestamp) => timestamp > cutoff)
  }

  /**
   * Evicts the least recently used key if store is full
   */
  function evictLRU(): void {
    if (store.size >= maxKeys) {
      let oldestKey: string | null = null
      let oldestTime = Infinity

      for (const [key, record] of store.entries()) {
        if (record.lastAccess < oldestTime) {
          oldestTime = record.lastAccess
          oldestKey = key
        }
      }

      if (oldestKey) {
        store.delete(oldestKey)
      }
    }
  }

  /**
   * Check if a request is allowed for the given key
   *
   * @param key - Unique identifier (typically user ID)
   * @returns Rate limit result with allowed status and metadata
   */
  async function check(key: string): Promise<RateLimitResult> {
    const now = Date.now()

    // Get or create record
    let record = store.get(key)

    if (!record) {
      evictLRU()
      record = { requests: [], lastAccess: now }
      store.set(key, record)
    }

    // Clean expired requests
    cleanExpiredRequests(record, now)

    // Update last access time
    record.lastAccess = now

    // Check if request is allowed
    const current = record.requests.length
    const allowed = current < maxRequests

    if (allowed) {
      record.requests.push(now)
    }

    // Calculate reset time (end of current window)
    const oldestRequest = record.requests[0] || now
    const reset = oldestRequest + windowMs

    return {
      allowed,
      remaining: Math.max(0, maxRequests - (allowed ? current + 1 : current)),
      reset,
      current: allowed ? current + 1 : current,
    }
  }

  /**
   * Reset rate limit for a specific key (useful for testing)
   */
  function reset(key: string): void {
    store.delete(key)
  }

  /**
   * Get current status for a key without incrementing count
   */
  async function status(key: string): Promise<RateLimitResult> {
    const now = Date.now()
    const record = store.get(key)

    if (!record) {
      return {
        allowed: true,
        remaining: maxRequests,
        reset: now + windowMs,
        current: 0,
      }
    }

    cleanExpiredRequests(record, now)

    const current = record.requests.length
    const allowed = current < maxRequests
    const oldestRequest = record.requests[0] || now
    const resetTime = oldestRequest + windowMs

    return {
      allowed,
      remaining: Math.max(0, maxRequests - current),
      reset: resetTime,
      current,
    }
  }

  return {
    check,
    reset,
    status,
  }
}

/**
 * Pre-configured rate limiter for CSV exports
 * Limit: 5 exports per hour per user
 */
export const csvExportLimiter = rateLimiter({
  maxRequests: 5,
  windowMs: 60 * 60 * 1000, // 1 hour
  maxKeys: 1000, // Track up to 1000 unique users
})
