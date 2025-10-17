/**
 * Jobs API Route Tests
 *
 * Tests the /api/jobs endpoint for job listing and creation
 */

import { GET, POST } from '../route'
import { createMockAuthRequest, createMockRequest, getResponseJson } from '@/__tests__/setup'
import { mockFirebaseAdmin } from '@/__tests__/mocks/firebase-admin'

describe('/api/jobs', () => {
  const mockJobData = {
    id: 'job-test-123',
    ownerId: 'test-user-id',
    title: 'Senior Developer',
    description: 'Looking for a senior developer',
    company: 'Test Company',
    location: 'Remote',
    type: 'full-time',
    status: 'published',
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    viewCount: 0,
    applicationCount: 0,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/jobs', () => {
    it('returns published jobs for unauthenticated users', async () => {
      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        docs: [
          {
            id: mockJobData.id,
            data: () => mockJobData,
          },
        ],
      })

      mockFirebaseAdmin.firestore().count().get.mockResolvedValueOnce({
        data: () => ({ count: 1 }),
      })

      const request = createMockRequest({
        url: 'http://localhost:3000/api/jobs',
      })

      const response = await GET(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(200)
      expect(data.jobs).toHaveLength(1)
      expect(data.jobs[0].id).toBe(mockJobData.id)
      expect(data.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        pages: 1,
      })
    })

    it('filters jobs by ownerId when authenticated', async () => {
      const userId = 'test-user-id'

      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        docs: [{
          id: mockJobData.id,
          data: () => mockJobData,
        }],
      })

      mockFirebaseAdmin.firestore().count().get.mockResolvedValueOnce({
        data: () => ({ count: 1 }),
      })

      const request = createMockAuthRequest(userId, {
        url: `http://localhost:3000/api/jobs?ownerId=${userId}`,
      })

      const response = await GET(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(200)
      expect(data.jobs).toHaveLength(1)
    })

    it('rejects ownerId filter for unauthorized users', async () => {
      const request = createMockAuthRequest('user-1', {
        url: 'http://localhost:3000/api/jobs?ownerId=user-2',
      })

      const response = await GET(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(403)
      expect(data.error).toContain('cannot filter by another user')
    })

    it('supports pagination parameters', async () => {
      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        docs: [],
      })

      mockFirebaseAdmin.firestore().count().get.mockResolvedValueOnce({
        data: () => ({ count: 100 }),
      })

      const request = createMockRequest({
        url: 'http://localhost:3000/api/jobs?page=2&limit=10',
      })

      const response = await GET(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(200)
      expect(data.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 100,
        pages: 10,
      })
    })

    it('filters by job type', async () => {
      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        docs: [],
      })

      mockFirebaseAdmin.firestore().count().get.mockResolvedValueOnce({
        data: () => ({ count: 0 }),
      })

      const request = createMockRequest({
        url: 'http://localhost:3000/api/jobs?type=remote',
      })

      const response = await GET(request)

      expect(response.status).toBe(200)
      expect(mockFirebaseAdmin.firestore().where).toHaveBeenCalledWith('type', '==', 'remote')
    })

    it('filters by location', async () => {
      const jobWithLocation = {
        ...mockJobData,
        location: 'San Francisco',
      }

      mockFirebaseAdmin.firestore().orderBy().select().get.mockResolvedValueOnce({
        docs: [{
          data: () => ({ location: 'San Francisco' }),
        }],
      })

      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        docs: [{
          id: jobWithLocation.id,
          data: () => jobWithLocation,
        }],
      })

      const request = createMockRequest({
        url: 'http://localhost:3000/api/jobs?location=san francisco',
      })

      const response = await GET(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(200)
      expect(data.jobs[0].location).toContain('San Francisco')
    })
  })

  describe('POST /api/jobs', () => {
    const validJobPayload = {
      title: 'Senior Developer',
      description: 'Looking for a senior developer',
      company: 'Test Company',
      location: 'Remote',
      type: 'full-time',
      status: 'published',
    }

    it('creates a job for authenticated user with active subscription', async () => {
      const userId = 'test-user-id'

      mockFirebaseAdmin.auth().verifyIdToken.mockResolvedValueOnce({
        uid: userId,
        subActive: true,
      })

      mockFirebaseAdmin.firestore().add.mockResolvedValueOnce({
        id: 'new-job-id',
        get: jest.fn().mockResolvedValue({
          id: 'new-job-id',
          data: () => ({
            ...validJobPayload,
            ownerId: userId,
            createdAt: new Date(),
          }),
        }),
      })

      const request = createMockAuthRequest(userId, {
        method: 'POST',
        url: 'http://localhost:3000/api/jobs',
        body: validJobPayload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(201)
      expect(data.message).toBe('Job created successfully')
      expect(data.job.title).toBe(validJobPayload.title)
      expect(data.job.ownerId).toBe(userId)
    })

    it('rejects job creation without active subscription', async () => {
      mockFirebaseAdmin.auth().verifyIdToken.mockResolvedValueOnce({
        uid: 'test-user-id',
        subActive: false,
      })

      const request = createMockAuthRequest('test-user-id', {
        method: 'POST',
        url: 'http://localhost:3000/api/jobs',
        body: validJobPayload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(403)
      expect(data.error).toContain('subscription')
    })

    it('validates required fields', async () => {
      mockFirebaseAdmin.auth().verifyIdToken.mockResolvedValueOnce({
        uid: 'test-user-id',
        subActive: true,
      })

      const invalidPayload = {
        title: '', // Empty title should fail validation
      }

      const request = createMockAuthRequest('test-user-id', {
        method: 'POST',
        url: 'http://localhost:3000/api/jobs',
        body: invalidPayload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(422)
      expect(data.error).toBe('Validation failed')
    })

    it('sets publishedAt for published jobs', async () => {
      mockFirebaseAdmin.auth().verifyIdToken.mockResolvedValueOnce({
        uid: 'test-user-id',
        subActive: true,
      })

      const now = new Date()
      mockFirebaseAdmin.firestore().add.mockResolvedValueOnce({
        id: 'new-job-id',
        get: jest.fn().mockResolvedValue({
          id: 'new-job-id',
          data: () => ({
            ...validJobPayload,
            publishedAt: now,
          }),
        }),
      })

      const request = createMockAuthRequest('test-user-id', {
        method: 'POST',
        url: 'http://localhost:3000/api/jobs',
        body: { ...validJobPayload, status: 'published' },
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(201)
      expect(data.job.publishedAt).toBeDefined()
    })

    it('does not set publishedAt for draft jobs', async () => {
      mockFirebaseAdmin.auth().verifyIdToken.mockResolvedValueOnce({
        uid: 'test-user-id',
        subActive: true,
      })

      mockFirebaseAdmin.firestore().add.mockResolvedValueOnce({
        id: 'new-job-id',
        get: jest.fn().mockResolvedValue({
          id: 'new-job-id',
          data: () => ({
            ...validJobPayload,
            status: 'draft',
            publishedAt: null,
          }),
        }),
      })

      const request = createMockAuthRequest('test-user-id', {
        method: 'POST',
        url: 'http://localhost:3000/api/jobs',
        body: { ...validJobPayload, status: 'draft' },
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(201)
      expect(data.job.publishedAt).toBeNull()
    })

    it('initializes counters to zero', async () => {
      mockFirebaseAdmin.auth().verifyIdToken.mockResolvedValueOnce({
        uid: 'test-user-id',
        subActive: true,
      })

      mockFirebaseAdmin.firestore().add.mockResolvedValueOnce({
        id: 'new-job-id',
        get: jest.fn().mockResolvedValue({
          id: 'new-job-id',
          data: () => ({
            ...validJobPayload,
            viewCount: 0,
            applicationCount: 0,
          }),
        }),
      })

      const request = createMockAuthRequest('test-user-id', {
        method: 'POST',
        url: 'http://localhost:3000/api/jobs',
        body: validJobPayload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(201)
      expect(data.job.viewCount).toBe(0)
      expect(data.job.applicationCount).toBe(0)
    })
  })

  describe('Idempotency Protection', () => {
    it('returns existing job when duplicate created within 5 minutes', async () => {
      const userId = 'test-user-id'
      const existingJobId = 'existing-job-123'
      const now = new Date()

      mockFirebaseAdmin.auth().verifyIdToken.mockResolvedValueOnce({
        uid: userId,
        subActive: true,
      })

      // Mock the duplicate check query to return an existing job
      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        empty: false,
        docs: [{
          id: existingJobId,
          data: () => ({
            ...validJobPayload,
            ownerId: userId,
            createdAt: now,
            updatedAt: now,
            publishedAt: now,
            viewCount: 5,
            applicationCount: 2,
          }),
        }],
      })

      const request = createMockAuthRequest(userId, {
        method: 'POST',
        url: 'http://localhost:3000/api/jobs',
        body: validJobPayload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(200) // Idempotent response
      expect(data.message).toBe('Job already exists')
      expect(data.job.id).toBe(existingJobId)
      expect(mockFirebaseAdmin.firestore().add).not.toHaveBeenCalled()
    })

    it('creates new job when no duplicate found', async () => {
      const userId = 'test-user-id'

      mockFirebaseAdmin.auth().verifyIdToken.mockResolvedValueOnce({
        uid: userId,
        subActive: true,
      })

      // Mock the duplicate check query to return empty
      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        empty: true,
        docs: [],
      })

      mockFirebaseAdmin.firestore().add.mockResolvedValueOnce({
        id: 'new-job-id',
        get: jest.fn().mockResolvedValue({
          id: 'new-job-id',
          data: () => ({
            ...validJobPayload,
            ownerId: userId,
            createdAt: new Date(),
          }),
        }),
      })

      const request = createMockAuthRequest(userId, {
        method: 'POST',
        url: 'http://localhost:3000/api/jobs',
        body: validJobPayload,
      })

      const response = await POST(request)
      const data = await getResponseJson(response)

      expect(response.status).toBe(201)
      expect(data.message).toBe('Job created successfully')
      expect(mockFirebaseAdmin.firestore().add).toHaveBeenCalled()
    })

    it('allows same title after 5-minute window', async () => {
      const userId = 'test-user-id'

      mockFirebaseAdmin.auth().verifyIdToken.mockResolvedValueOnce({
        uid: userId,
        subActive: true,
      })

      // Mock the duplicate check query with correct where clause order
      mockFirebaseAdmin.firestore().get.mockResolvedValueOnce({
        empty: true, // No jobs found within 5-minute window
        docs: [],
      })

      mockFirebaseAdmin.firestore().add.mockResolvedValueOnce({
        id: 'new-job-id',
        get: jest.fn().mockResolvedValue({
          id: 'new-job-id',
          data: () => validJobPayload,
        }),
      })

      const request = createMockAuthRequest(userId, {
        method: 'POST',
        url: 'http://localhost:3000/api/jobs',
        body: validJobPayload,
      })

      const response = await POST(request)

      expect(response.status).toBe(201)
      expect(mockFirebaseAdmin.firestore().where).toHaveBeenCalledWith('ownerId', '==', userId)
      expect(mockFirebaseAdmin.firestore().where).toHaveBeenCalledWith('title', '==', validJobPayload.title)
    })
  })
})
