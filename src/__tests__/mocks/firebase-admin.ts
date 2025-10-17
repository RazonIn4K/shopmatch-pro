/**
 * Firebase Admin SDK Mocks for Testing
 *
 * Provides mock implementations of Firebase Admin SDK functions
 * for use in unit and integration tests.
 */

export const mockFirebaseAdmin = {
  auth: () => ({
    verifyIdToken: jest.fn().mockResolvedValue({
      uid: 'test-user-id',
      email: 'test@example.com',
      role: 'owner',
      subActive: true,
    }),
    getUser: jest.fn().mockResolvedValue({
      uid: 'test-user-id',
      email: 'test@example.com',
      displayName: 'Test User',
    }),
    setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
  }),
  firestore: () => ({
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue({
      exists: true,
      id: 'test-doc-id',
      data: jest.fn().mockReturnValue({
        id: 'test-doc-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    }),
    add: jest.fn().mockResolvedValue({
      id: 'test-doc-id',
      get: jest.fn().mockResolvedValue({
        exists: true,
        id: 'test-doc-id',
        data: jest.fn().mockReturnValue({}),
      }),
    }),
    update: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    count: jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue({
        data: jest.fn().mockReturnValue({ count: 0 }),
      }),
    }),
  }),
}

/**
 * Mock Firebase Admin initialization
 * Call this in jest.setup.js or individual test files
 */
export function setupFirebaseAdminMocks() {
  jest.mock('@/lib/firebase/admin', () => ({
    adminAuth: mockFirebaseAdmin.auth(),
    adminDb: mockFirebaseAdmin.firestore(),
    isFirebaseAdminFallbackMode: false,
  }))
}

/**
 * Reset Firebase Admin mocks between tests
 */
export function resetFirebaseAdminMocks() {
  jest.clearAllMocks()
}
