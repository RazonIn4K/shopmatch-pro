/**
 * Stripe SDK Mocks for Testing
 *
 * Provides mock implementations of Stripe SDK functions
 * for use in unit and integration tests.
 */

export const mockStripe = {
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test-session',
        customer: 'cus_test_123',
      }),
    },
  },
  billingPortal: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: 'bps_test_123',
        url: 'https://billing.stripe.com/test-portal',
      }),
    },
  },
  webhooks: {
    constructEventAsync: jest.fn().mockResolvedValue({
      id: 'evt_test_123',
      type: 'customer.subscription.updated',
      data: {
        object: {
          id: 'sub_test_123',
          customer: 'cus_test_123',
          status: 'active',
        },
      },
    }),
  },
  subscriptions: {
    retrieve: jest.fn().mockResolvedValue({
      id: 'sub_test_123',
      customer: 'cus_test_123',
      status: 'active',
      items: {
        data: [{
          price: {
            id: 'price_test_123',
          },
        }],
      },
    }),
  },
}

/**
 * Mock Stripe initialization
 * Call this in jest.setup.js or individual test files
 */
export function setupStripeMocks() {
  jest.mock('@/lib/stripe/config', () => ({
    stripe: mockStripe,
    STRIPE_CONFIG: {
      SECRET_KEY: 'sk_test_mock_key',
      WEBHOOK_SECRET: 'whsec_test_mock_secret',
      PRO_PRICE_ID: 'price_test_pro_123',
    },
    SUBSCRIPTION_TIERS: {
      pro: {
        name: 'Professional',
        priceId: 'price_test_pro_123',
        price: 29,
        features: ['Unlimited job postings', 'Application management'],
      },
    },
  }))
}

/**
 * Reset Stripe mocks between tests
 */
export function resetStripeMocks() {
  Object.values(mockStripe.checkout.sessions).forEach((fn) => {
    if (jest.isMockFunction(fn)) {
      fn.mockClear()
    }
  })
  Object.values(mockStripe.billingPortal.sessions).forEach((fn) => {
    if (jest.isMockFunction(fn)) {
      fn.mockClear()
    }
  })
  Object.values(mockStripe.webhooks).forEach((fn) => {
    if (jest.isMockFunction(fn)) {
      fn.mockClear()
    }
  })
  Object.values(mockStripe.subscriptions).forEach((fn) => {
    if (jest.isMockFunction(fn)) {
      fn.mockClear()
    }
  })
}
