import { jest } from '@jest/globals'

if (typeof globalThis.Request === 'undefined') {
  class MockRequest {}
  // @ts-expect-error - assign to global runtime for Next polyfills
  globalThis.Request = MockRequest
}

if (typeof globalThis.Response === 'undefined') {
  class MockResponse {}
  // @ts-expect-error - assign to global runtime for Next polyfills
  globalThis.Response = MockResponse
}

if (typeof globalThis.Headers === 'undefined') {
  class MockHeaders {
    private readonly store = new Map<string, string>()

    constructor(init?: Record<string, string> | [string, string][]) {
      if (Array.isArray(init)) {
        for (const [key, value] of init) {
          this.set(key, value)
        }
      } else if (init) {
        for (const [key, value] of Object.entries(init)) {
          this.set(key, value)
        }
      }
    }

    set(key: string, value: string) {
      this.store.set(key.toLowerCase(), value)
    }

    get(key: string) {
      return this.store.get(key.toLowerCase()) ?? null
    }
  }

  // @ts-expect-error - assign to global runtime for Next polyfills
  globalThis.Headers = MockHeaders
}

jest.mock('@/lib/api/auth', () => ({
  verifyAuth: jest.fn(),
}))

jest.mock('@/lib/firebase/admin', () => ({
  adminAuth: {
    getUser: jest.fn(),
  },
  adminDb: {
    collection: jest.fn(),
  },
}))

jest.mock('next/server', () => ({
  NextRequest: class {},
  NextResponse: class {
    static json(body: unknown, init?: { status?: number }) {
      return {
        status: init?.status ?? 200,
        async json() {
          return body
        },
      }
    }
  },
}))

jest.mock('@/lib/stripe/config', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
  },
  STRIPE_CONFIG: {
    PRO_PRICE_ID: 'price_test',
  },
  SUBSCRIPTION_TIERS: {
    PRO: {
      id: 'pro',
      name: 'Pro',
    },
  },
}))

import { POST } from '../route'
let POST: typeof import('../route').POST
let mockedVerifyAuth: jest.Mock
let mockedAdminAuth: { getUser: jest.Mock }
let mockedAdminDb: { collection: jest.Mock }
let mockedStripe: {
  checkout: {
    sessions: {
      create: jest.Mock
    }
  }
}

describe('POST /api/stripe/checkout', () => {
  let getUserDoc: jest.Mock

  beforeAll(async () => {
    ({ POST } = await import('../route'))
    const authModule = await import('@/lib/api/auth')
    const adminModule = await import('@/lib/firebase/admin')
    const stripeModule = await import('@/lib/stripe/config')

    mockedVerifyAuth = authModule.verifyAuth as unknown as jest.Mock
    mockedAdminAuth = adminModule.adminAuth as unknown as { getUser: jest.Mock }
    mockedAdminDb = adminModule.adminDb as unknown as { collection: jest.Mock }
    mockedStripe = stripeModule.stripe as unknown as {
      checkout: {
        sessions: {
          create: jest.Mock
        }
      }
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()

    mockedVerifyAuth.mockResolvedValue({ uid: 'user-123' })
    mockedAdminAuth.getUser.mockResolvedValue({ email: 'user@example.com' })

    getUserDoc = jest.fn()
    const docMock = jest.fn(() => ({ get: getUserDoc }))
    mockedAdminDb.collection.mockReturnValue({ doc: docMock })

    mockedStripe.checkout.sessions.create.mockResolvedValue({
      id: 'cs_test',
      url: 'https://checkout.stripe.com/test-session',
    })
  })

  test('reuses existing Stripe customer when available', async () => {
    getUserDoc.mockResolvedValue({
      data: () => ({ stripeCustomerId: 'cus_123' }),
    })

    const request = {
      json: jest.fn().mockResolvedValue({ idempotencyKey: 'test-idempotency-key' }),
      headers: new Headers(),
    }

    const response = await POST(request as any)

    expect(response.status).toBe(200)

    const call = mockedStripe.checkout.sessions.create.mock.calls[0]
    const payload = call[0]
    const options = call[1]

    expect(payload).toMatchObject({ customer: 'cus_123' })
    expect(payload).not.toHaveProperty('customer_email')
    expect(options).toEqual({ idempotencyKey: 'test-idempotency-key' })
  })

  test('falls back to customer_email when no stored customer exists', async () => {
    getUserDoc.mockResolvedValue({
      data: () => ({}),
    })

    const request = {
      json: jest.fn().mockResolvedValue({ idempotencyKey: 'test-idempotency-key' }),
      headers: new Headers(),
    }

    const response = await POST(request as any)
    expect(response.status).toBe(200)

    const call = mockedStripe.checkout.sessions.create.mock.calls[0]
    const payload = call[0]

    expect(payload).toMatchObject({ customer_email: 'user@example.com' })
    expect(payload).not.toHaveProperty('customer')
  })

  test('returns 400 for invalid request payload', async () => {
    const request = {
      json: jest.fn().mockResolvedValue({}),
      headers: new Headers(),
    }

    const response = await POST(request as any)

    expect(response.status).toBe(400)
    expect(mockedStripe.checkout.sessions.create).not.toHaveBeenCalled()
  })
})
