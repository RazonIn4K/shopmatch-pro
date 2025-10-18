import { jest } from '@jest/globals'

jest.mock('firebase-admin/app', () => {
  const initializeApp = jest.fn(() => ({ name: 'mockApp' }))
  const getApps = jest.fn(() => [])
  const cert = jest.fn(() => ({}))

  return {
    cert,
    getApps,
    initializeApp,
  }
})

jest.mock('firebase-admin/auth', () => ({
  getAuth: jest.fn(() => ({
    app: 'mockApp',
    verifyIdToken: jest.fn(),
  })),
}))

jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => ({
    collection: jest.fn(),
  })),
}))

describe('firebase admin configuration', () => {
  const ORIGINAL_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ORIGINAL_ENV }
    delete process.env.FIREBASE_PRIVATE_KEY
    delete process.env.FIREBASE_CLIENT_EMAIL
    delete process.env.ALLOW_FIREBASE_ADMIN_FALLBACK
    process.env.FIREBASE_PROJECT_ID = 'test-project'
    process.env.FORCE_FIREBASE_ADMIN_VALIDATION = 'true'

  })

  afterEach(() => {
    process.env = ORIGINAL_ENV

    delete process.env.FORCE_FIREBASE_ADMIN_VALIDATION
  })

  test('throws in production when fallback is enabled without service account', async () => {
    process.env.NODE_ENV = 'production'
    process.env.ALLOW_FIREBASE_ADMIN_FALLBACK = 'true'

    expect(process.env.NODE_ENV).toBe('production')
    expect(process.env.ALLOW_FIREBASE_ADMIN_FALLBACK).toBe('true')

    await jest
      .isolateModulesAsync(async () => {
        await import('../admin')
      })
      .then(
        () => {
          throw new Error('Expected Firebase Admin import to throw in production fallback mode')
        },
        error => {
          expect(error).toBeInstanceOf(Error)
          expect((error as Error).message).toContain('Service account credentials are required in production')
        }
      )
  })

  test('allows fallback outside production and logs a warning', async () => {
    process.env.NODE_ENV = 'development'
    process.env.ALLOW_FIREBASE_ADMIN_FALLBACK = 'true'

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    await jest.isolateModulesAsync(async () => {
      await import('../admin')
    })

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Running without service account credentials')
    )

    warnSpy.mockRestore()
  })
})
