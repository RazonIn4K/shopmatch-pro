/**
 * Applications API Route Tests
 *
 * Tests the /api/applications endpoint for application listing
 */

import { GET } from '../route'
import { createMockAuthRequest, getResponseJson } from '@/__tests__/setup'
import { mockFirebaseAdmin } from '@/__tests__/mocks/firebase-admin'

describe('GET /api/applications', () => {
  const mockApplicationData = {
    id: 'app-test-123',
    jobId: 'job-test-123',
    seekerId: 'seeker-test-123',
    ownerId: 'owner-test-123',
    status: 'pending',
    coverLetter: 'I am interested in this position',
    phone: '+1234567890',
    jobTitle: 'Senior Developer',
    company: 'Test Company',
    seekerName: 'Test Seeker',
    seekerEmail: 'seeker@test.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication & Authorization', () => {
    it('requires authentication', async () => {
      mockFirebaseAdmin.auth().verifyIdToken.mockRejectedValueOnce(
        new Error('Invalid token')
      )

      const request = createMockAuthRequest('invalid-user', {
        url: 'http://localhost:3000/api/applications',
      })

      const response = await GET(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(401)
      expect(data.error).toContain('Unauthorized')
    })

    it('defaults to seeker perspective when no filters provided', async () => {
      const seekerId = 'test-seeker-id'

      mockFirebaseAdmin.auth().verifyIdToken.mockResolvedValueOnce({
        uid: seekerId,
        subActive: true,
        role: 'seeker',
      })

      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        docs: [{
          id: mockApplicationData.id,
          data: () => mockApplicationData,
        }],
      })

      mockFirebaseAdmin.firestore().count().get.mockResolvedValueOnce({
        data: () => ({ count: 1 }),
      })

      const request = createMockAuthRequest(seekerId, {
        url: 'http://localhost:3000/api/applications',
      })

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockFirebaseAdmin.firestore().where).toHaveBeenCalledWith('seekerId', '==', seekerId)
    })

    it('allows owner to filter by ownerId', async () => {
      const ownerId = 'test-owner-id'

      mockFirebaseAdmin.auth().verifyIdToken.mockResolvedValueOnce({
        uid: ownerId,
        subActive: true,
        role: 'owner',
      })

      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        docs: [{
          id: mockApplicationData.id,
          data: () => ({ ...mockApplicationData, ownerId }),
        }],
      })

      mockFirebaseAdmin.firestore().count().get.mockResolvedValueOnce({
        data: () => ({ count: 1 }),
      })

      const request = createMockAuthRequest(ownerId, {
        url: `http://localhost:3000/api/applications?ownerId=${ownerId}`,
      })

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockFirebaseAdmin.firestore().where).toHaveBeenCalledWith('ownerId', '==', ownerId)
    })

    it('rejects filtering by other user seekerId', async () => {
      const request = createMockAuthRequest('user-1', {
        url: 'http://localhost:3000/api/applications?seekerId=user-2',
      })

      const response = await GET(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(403)
      expect(data.error).toContain('Cannot query applications for other seekers')
    })

    it('rejects filtering by other user ownerId', async () => {
      const request = createMockAuthRequest('user-1', {
        url: 'http://localhost:3000/api/applications?ownerId=user-2',
      })

      const response = await GET(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(403)
      expect(data.error).toContain('Cannot query applications for other owners')
    })
  })

  describe('Filtering', () => {
    it('filters by jobId', async () => {
      const jobId = 'job-test-123'

      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        docs: [{
          id: mockApplicationData.id,
          data: () => ({ ...mockApplicationData, jobId }),
        }],
      })

      mockFirebaseAdmin.firestore().count().get.mockResolvedValueOnce({
        data: () => ({ count: 1 }),
      })

      const request = createMockAuthRequest('test-seeker-id', {
        url: `http://localhost:3000/api/applications?jobId=${jobId}`,
      })

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockFirebaseAdmin.firestore().where).toHaveBeenCalledWith('jobId', '==', jobId)
    })

    it('filters by status', async () => {
      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        docs: [{
          id: mockApplicationData.id,
          data: () => ({ ...mockApplicationData, status: 'accepted' }),
        }],
      })

      mockFirebaseAdmin.firestore().count().get.mockResolvedValueOnce({
        data: () => ({ count: 1 }),
      })

      const request = createMockAuthRequest('test-seeker-id', {
        url: 'http://localhost:3000/api/applications?status=accepted',
      })

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockFirebaseAdmin.firestore().where).toHaveBeenCalledWith('status', '==', 'accepted')
    })
  })

  describe('Pagination', () => {
    it('supports page and limit parameters', async () => {
      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        docs: [],
      })

      mockFirebaseAdmin.firestore().count().get.mockResolvedValueOnce({
        data: () => ({ count: 50 }),
      })

      const request = createMockAuthRequest('test-seeker-id', {
        url: 'http://localhost:3000/api/applications?page=2&limit=10',
      })

      const response = await GET(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(200)
      expect(data.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 50,
        pages: 5,
      })
    })

    it('enforces maximum limit of 100', async () => {
      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        docs: [],
      })

      mockFirebaseAdmin.firestore().count().get.mockResolvedValueOnce({
        data: () => ({ count: 0 }),
      })

      const request = createMockAuthRequest('test-seeker-id', {
        url: 'http://localhost:3000/api/applications?limit=200',
      })

      const response = await GET(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(200)
      expect(data.pagination.limit).toBe(100)
    })

    it('enforces minimum page of 1', async () => {
      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        docs: [],
      })

      mockFirebaseAdmin.firestore().count().get.mockResolvedValueOnce({
        data: () => ({ count: 0 }),
      })

      const request = createMockAuthRequest('test-seeker-id', {
        url: 'http://localhost:3000/api/applications?page=0',
      })

      const response = await GET(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(200)
      expect(data.pagination.page).toBe(1)
    })
  })

  describe('Response Data', () => {
    it('returns applications with proper date conversion', async () => {
      const now = new Date()

      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        docs: [{
          id: mockApplicationData.id,
          data: () => ({
            ...mockApplicationData,
            createdAt: { toDate: () => now },
            updatedAt: { toDate: () => now },
            reviewedAt: { toDate: () => now },
          }),
        }],
      })

      mockFirebaseAdmin.firestore().count().get.mockResolvedValueOnce({
        data: () => ({ count: 1 }),
      })

      const request = createMockAuthRequest('test-seeker-id', {
        url: 'http://localhost:3000/api/applications',
      })

      const response = await GET(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(200)
      expect(data.applications).toHaveLength(1)
      expect(data.applications[0].id).toBe(mockApplicationData.id)
    })

    it('includes all application fields', async () => {
      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        docs: [{
          id: mockApplicationData.id,
          data: () => mockApplicationData,
        }],
      })

      mockFirebaseAdmin.firestore().count().get.mockResolvedValueOnce({
        data: () => ({ count: 1 }),
      })

      const request = createMockAuthRequest('test-seeker-id', {
        url: 'http://localhost:3000/api/applications',
      })

      const response = await GET(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(200)
      const app = data.applications[0]
      expect(app).toHaveProperty('jobId')
      expect(app).toHaveProperty('seekerId')
      expect(app).toHaveProperty('ownerId')
      expect(app).toHaveProperty('status')
      expect(app).toHaveProperty('coverLetter')
      expect(app).toHaveProperty('jobTitle')
      expect(app).toHaveProperty('company')
    })
  })

  describe('Query Ordering', () => {
    it('orders by createdAt descending', async () => {
      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        docs: [],
      })

      mockFirebaseAdmin.firestore().count().get.mockResolvedValueOnce({
        data: () => ({ count: 0 }),
      })

      const request = createMockAuthRequest('test-seeker-id', {
        url: 'http://localhost:3000/api/applications',
      })

      await GET(request)

      expect(mockFirebaseAdmin.firestore().orderBy).toHaveBeenCalledWith('createdAt', 'desc')
    })
  })
})
