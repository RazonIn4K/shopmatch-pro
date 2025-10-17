/**
 * Firebase Admin SDK Mocks for Testing
 *
 * Provides mock implementations of Firebase Admin SDK functions
 * for use in unit and integration tests.
 */

type MockWithReset<T extends Record<string, unknown>> = T & {
  [key: string]: unknown
}

const authMock: MockWithReset<{
  verifyIdToken: jest.Mock
  getUser: jest.Mock
  setCustomUserClaims: jest.Mock
}> = {} as unknown as MockWithReset<{
  verifyIdToken: jest.Mock
  getUser: jest.Mock
  setCustomUserClaims: jest.Mock
}>

const firestoreMock: MockWithReset<{
  collection: jest.Mock
  doc: jest.Mock
  get: jest.Mock
  add: jest.Mock
  update: jest.Mock
  delete: jest.Mock
  set: jest.Mock
  where: jest.Mock
  orderBy: jest.Mock
  select: jest.Mock
  limit: jest.Mock
  offset: jest.Mock
  count: jest.Mock
}> = {} as unknown as MockWithReset<{
  collection: jest.Mock
  doc: jest.Mock
  get: jest.Mock
  add: jest.Mock
  update: jest.Mock
  delete: jest.Mock
  set: jest.Mock
  where: jest.Mock
  orderBy: jest.Mock
  select: jest.Mock
  limit: jest.Mock
  offset: jest.Mock
  count: jest.Mock
}>

function applyAuthDefaults(): void {
  authMock.verifyIdToken = jest.fn().mockResolvedValue({
    uid: 'test-user-id',
    email: 'test@example.com',
    role: 'owner',
    subActive: true,
  })

  authMock.getUser = jest.fn().mockResolvedValue({
    uid: 'test-user-id',
    email: 'test@example.com',
    displayName: 'Test User',
  })

  authMock.setCustomUserClaims = jest.fn().mockResolvedValue(undefined)
}

function applyFirestoreDefaults(): void {
  const chain = () => firestoreMock

  firestoreMock.collection = jest.fn().mockImplementation(chain)
  firestoreMock.doc = jest.fn().mockImplementation(chain)
  firestoreMock.where = jest.fn().mockImplementation(chain)
  firestoreMock.orderBy = jest.fn().mockImplementation(chain)
  firestoreMock.select = jest.fn().mockImplementation(chain)
  firestoreMock.limit = jest.fn().mockImplementation(chain)
  firestoreMock.offset = jest.fn().mockImplementation(chain)

  firestoreMock.get = jest.fn().mockResolvedValue({
    empty: true,
    docs: [],
  })

  firestoreMock.add = jest.fn().mockResolvedValue({
    id: 'test-doc-id',
    get: jest.fn().mockResolvedValue({
      exists: true,
      id: 'test-doc-id',
      data: jest.fn().mockReturnValue({}),
    }),
  })

  firestoreMock.update = jest.fn().mockResolvedValue(undefined)
  firestoreMock.delete = jest.fn().mockResolvedValue(undefined)
  firestoreMock.set = jest.fn().mockResolvedValue(undefined)

  const countGet = jest.fn().mockResolvedValue({
    data: jest.fn().mockReturnValue({ count: 0 }),
  })

  firestoreMock.count = jest.fn().mockReturnValue({ get: countGet })
}

applyAuthDefaults()
applyFirestoreDefaults()

export const mockFirebaseAdmin = {
  auth: () => authMock,
  firestore: () => firestoreMock,
}

/**
 * Mock Firebase Admin initialization
 * Call this in jest.setup.js or individual test files
 */
export function setupFirebaseAdminMocks() {
  jest.mock('@/lib/firebase/admin', () => ({
    adminAuth: authMock,
    adminDb: firestoreMock,
    isFirebaseAdminFallbackMode: false,
  }))
}

/**
 * Reset Firebase Admin mocks between tests
 */
export function resetFirebaseAdminMocks() {
  applyAuthDefaults()
  applyFirestoreDefaults()
}
