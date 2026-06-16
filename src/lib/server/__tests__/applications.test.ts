import { transformApplicationDocument } from '../applications'

jest.mock('@/lib/firebase/admin', () => ({
  adminAuth: {},
  adminDb: {},
}))

function makeDocument(data: Record<string, unknown>) {
  return {
    id: 'legacy_application',
    data: () => data,
  } as unknown as FirebaseFirestore.DocumentSnapshot
}

describe('transformApplicationDocument', () => {
  it('normalizes missing legacy display fields', () => {
    const application = transformApplicationDocument(
      makeDocument({
        seekerId: 'seeker_1',
        ownerId: 'owner_1',
        jobId: 'job_1',
        createdAt: '2026-06-16T12:00:00.000Z',
      })
    )

    expect(application.jobTitle).toBe('Archived role')
    expect(application.company).toBe('Company unavailable')
    expect(application.seekerName).toBe('Anonymous applicant')
    expect(application.seekerEmail).toBe('Email unavailable')
    expect(application.status).toBe('pending')
  })
})
