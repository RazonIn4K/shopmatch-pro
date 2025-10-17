/**
 * Stripe Webhook Route Tests
 *
 * Tests the /api/stripe/webhook endpoint for subscription lifecycle events
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { POST } from '../route'
import { createMockRequest, getResponseJson } from '@/__tests__/setup'
import { mockStripe } from '@/__tests__/mocks/stripe'
import { mockFirebaseAdmin } from '@/__tests__/mocks/firebase-admin'

describe('POST /api/stripe/webhook', () => {
  const mockSignature = 'mock_stripe_signature'
  const mockCustomerId = 'cus_test_123'
  const mockSubscriptionId = 'sub_test_123'
  const mockUserId = 'test-user-id'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Signature Verification', () => {
    it('rejects requests without signature header', async () => {
      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/stripe/webhook',
        headers: {},
        body: { type: 'customer.subscription.created' },
      })

      const response = await POST(request as any)
      const data = await getResponseJson(response) as Record<string, any>

      expect(response.status).toBe(400)
      expect(data.error).toBe('Missing signature')
    })

    it('rejects requests with invalid signature', async () => {
      mockStripe.webhooks.constructEventAsync.mockRejectedValueOnce(
        new Error('Invalid signature')
      )

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/stripe/webhook',
        headers: { 'stripe-signature': 'invalid_signature' },
        body: { type: 'customer.subscription.created' },
      })

      const response = await POST(request as any)
      const data = await getResponseJson(response) as Record<string, any>

      expect(response.status).toBe(400)
      expect(data.error).toBe('Invalid signature')
    })

    it('accepts requests with valid signature', async () => {
      mockStripe.webhooks.constructEventAsync.mockResolvedValueOnce({
        id: 'evt_test_123',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: mockSubscriptionId,
            customer: mockCustomerId,
            status: 'active',
          },
        },
      })

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/stripe/webhook',
        headers: { 'stripe-signature': mockSignature },
        body: {},
      })

      const response = await POST(request as any)
      const data = await getResponseJson(response) as Record<string, any>

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })
  })

  describe('Subscription Created Event', () => {
    it('activates subscription for new customer', async () => {
      mockStripe.webhooks.constructEventAsync.mockResolvedValueOnce({
        id: 'evt_test_123',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: mockSubscriptionId,
            customer: mockCustomerId,
            status: 'active',
          },
        },
      })

      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        empty: false,
        docs: [{
          id: mockUserId,
          ref: {
            update: jest.fn().mockResolvedValue(undefined),
          },
        }],
      })

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/stripe/webhook',
        headers: { 'stripe-signature': mockSignature },
        body: {},
      })

      const response = await POST(request as any)
      const data = await getResponseJson(response) as Record<string, any>

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
      expect(mockFirebaseAdmin.auth().setCustomUserClaims).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          subActive: true,
          subscriptionId: mockSubscriptionId,
        })
      )
    })

    it('handles trialing subscriptions as active', async () => {
      mockStripe.webhooks.constructEventAsync.mockResolvedValueOnce({
        id: 'evt_test_123',
        type: 'customer.subscription.created',
        data: {
          object: {
            id: mockSubscriptionId,
            customer: mockCustomerId,
            status: 'trialing',
          },
        },
      })

      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        empty: false,
        docs: [{
          id: mockUserId,
          ref: {
            update: jest.fn().mockResolvedValue(undefined),
          },
        }],
      })

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/stripe/webhook',
        headers: { 'stripe-signature': mockSignature },
        body: {},
      })

      const response = await POST(request as any)

      expect(response.status).toBe(200)
      expect(mockFirebaseAdmin.auth().setCustomUserClaims).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          subActive: true,
        })
      )
    })

    it('skips non-active subscription statuses', async () => {
      mockStripe.webhooks.constructEventAsync.mockResolvedValueOnce({
        id: 'evt_test_123',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: mockSubscriptionId,
            customer: mockCustomerId,
            status: 'incomplete',
          },
        },
      })

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/stripe/webhook',
        headers: { 'stripe-signature': mockSignature },
        body: {},
      })

      const response = await POST(request as any)
      const data = await getResponseJson(response) as Record<string, any>

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
      expect(mockFirebaseAdmin.auth().setCustomUserClaims).not.toHaveBeenCalled()
    })
  })

  describe('Subscription Deleted Event', () => {
    it('deactivates subscription on cancellation', async () => {
      mockStripe.webhooks.constructEventAsync.mockResolvedValueOnce({
        id: 'evt_test_123',
        type: 'customer.subscription.deleted',
        data: {
          object: {
            customer: mockCustomerId,
          },
        },
      })

      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        empty: false,
        docs: [{
          id: mockUserId,
          ref: {
            update: jest.fn().mockResolvedValue(undefined),
          },
        }],
      })

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/stripe/webhook',
        headers: { 'stripe-signature': mockSignature },
        body: {},
      })

      const response = await POST(request as any)
      const data = await getResponseJson(response) as Record<string, any>

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
      expect(mockFirebaseAdmin.auth().setCustomUserClaims).toHaveBeenCalledWith(
        mockUserId,
        expect.objectContaining({
          subActive: false,
          subscriptionId: null,
        })
      )
    })
  })

  describe('Checkout Completed Event', () => {
    it('links customer ID to user on successful checkout', async () => {
      const clientReferenceId = 'user_test_123'

      mockStripe.webhooks.constructEventAsync.mockResolvedValueOnce({
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: mockCustomerId,
            client_reference_id: clientReferenceId,
          },
        },
      })

      mockFirebaseAdmin.firestore().doc.mockReturnValueOnce({
        update: jest.fn().mockResolvedValue(undefined),
      })

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/stripe/webhook',
        headers: { 'stripe-signature': mockSignature },
        body: {},
      })

      const response = await POST(request as any)
      const data = await getResponseJson(response) as Record<string, any>

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })

    it('handles missing client_reference_id gracefully', async () => {
      mockStripe.webhooks.constructEventAsync.mockResolvedValueOnce({
        id: 'evt_test_123',
        type: 'checkout.session.completed',
        data: {
          object: {
            customer: mockCustomerId,
            client_reference_id: null,
          },
        },
      })

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/stripe/webhook',
        headers: { 'stripe-signature': mockSignature },
        body: {},
      })

      const response = await POST(request as any)
      const data = await getResponseJson(response) as Record<string, any>

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('returns 200 on processing errors to prevent retries', async () => {
      mockStripe.webhooks.constructEventAsync.mockResolvedValueOnce({
        id: 'evt_test_123',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: mockSubscriptionId,
            customer: mockCustomerId,
            status: 'active',
          },
        },
      })

      mockFirebaseAdmin.firestore().get.mockRejectedValueOnce(
        new Error('Firestore error')
      )

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/stripe/webhook',
        headers: { 'stripe-signature': mockSignature },
        body: {},
      })

      const response = await POST(request as any)
      const data = await getResponseJson(response) as Record<string, any>

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })

    it('ignores unknown event types', async () => {
      mockStripe.webhooks.constructEventAsync.mockResolvedValueOnce({
        id: 'evt_test_123',
        type: 'unknown.event.type',
        data: { object: {} },
      })

      const request = createMockRequest({
        method: 'POST',
        url: 'http://localhost:3000/api/stripe/webhook',
        headers: { 'stripe-signature': mockSignature },
        body: {},
      })

      const response = await POST(request as any)
      const data = await getResponseJson(response) as Record<string, any>

      expect(response.status).toBe(200)
      expect(data.received).toBe(true)
    })
  })
})
