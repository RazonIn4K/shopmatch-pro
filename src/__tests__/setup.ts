/**
 * Test Setup and Configuration
 *
 * This file is loaded by Jest before running tests.
 * It sets up global mocks, test utilities, and environment configuration.
 */

import { setupFirebaseAdminMocks, resetFirebaseAdminMocks } from './mocks/firebase-admin'
import { setupStripeMocks, resetStripeMocks } from './mocks/stripe'

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.FIREBASE_PROJECT_ID = 'test-project'
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com'
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\nMOCK_KEY\n-----END PRIVATE KEY-----'
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_mock_secret'
process.env.STRIPE_PRICE_ID_PRO = 'price_test_pro_123'
process.env.ALLOW_FIREBASE_ADMIN_FALLBACK = 'true'

// Setup global mocks
setupFirebaseAdminMocks()
setupStripeMocks()

// Reset mocks before each test
beforeEach(() => {
  resetFirebaseAdminMocks()
  resetStripeMocks()
})

// Mock Next.js globals with proper types
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    method: string
    url: string
    headers: Headers
    private bodyValue: string | null

    constructor(input: string | Request, init?: RequestInit) {
      this.method = init?.method || 'GET'
      this.url = typeof input === 'string' ? input : input.url
      this.headers = new Headers(init?.headers)
      this.bodyValue = (init?.body as string) || null
    }

    async json() {
      return typeof this.bodyValue === 'string'
        ? JSON.parse(this.bodyValue)
        : this.bodyValue
    }

    async text() {
      return typeof this.bodyValue === 'string'
        ? this.bodyValue
        : JSON.stringify(this.bodyValue)
    }
  } as unknown as typeof globalThis.Request
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers extends Map<string, string> {
    get(key: string): string | null {
      return super.get(key.toLowerCase()) || null
    }
    set(key: string, value: string): this {
      super.set(key.toLowerCase(), value)
      return this
    }
  } as unknown as typeof globalThis.Headers
}

if (typeof global.Response === 'undefined') {
  const ResponseClass = class Response {
    status: number
    statusText: string
    headers: Headers
    private bodyValue: string | null

    constructor(body?: string | null, init: ResponseInit = {}) {
      this.bodyValue = body || null
      this.status = init.status || 200
      this.statusText = init.statusText || 'OK'
      this.headers = new Headers(init.headers)
    }

    async json() {
      return typeof this.bodyValue === 'string'
        ? JSON.parse(this.bodyValue)
        : this.bodyValue
    }

    async text() {
      return typeof this.bodyValue === 'string'
        ? this.bodyValue
        : JSON.stringify(this.bodyValue)
    }

    static json(data: unknown, init?: ResponseInit) {
      return new ResponseClass(JSON.stringify(data), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      })
    }
  }

  global.Response = ResponseClass as unknown as typeof globalThis.Response
}

/**
 * Test Utilities
 */

/**
 * Create a mock Next.js request object
 */
export function createMockRequest(options: {
  method?: string
  url?: string
  headers?: Record<string, string>
  body?: unknown
} = {}): Request {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    headers = {},
    body = null,
  } = options

  return new Request(url, {
    method,
    headers: headers as HeadersInit,
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * Create a mock authenticated request with Bearer token
 */
export function createMockAuthRequest(
  uid: string = 'test-user-id',
  options: Parameters<typeof createMockRequest>[0] = {}
): Request {
  return createMockRequest({
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer mock-token-${uid}`,
    },
  })
}

/**
 * Extract JSON body from Next.js Response
 */
export async function getResponseJson(response: Response): Promise<unknown> {
  // Handle NextResponse which has a different structure
  if (response.json && typeof response.json === 'function') {
    return await response.json()
  }
  // Fallback for plain Response
  const text = await response.text()
  return JSON.parse(text)
}
