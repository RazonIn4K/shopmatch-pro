/**
 * Health API Route Tests
 *
 * Tests the /api/health endpoint to verify test infrastructure
 */

import { GET } from '../route'
import { createMockRequest, getResponseJson } from '@/__tests__/setup'

describe('GET /api/health', () => {
  it('returns 200 with health status', async () => {
    const request = createMockRequest({
      url: 'http://localhost:3000/api/health',
    })

    const response = await GET(request)
    const data = await getResponseJson(response)

    expect(response.status).toBe(200)
    expect(response.status).toBe(200)
    expect(data).toMatchObject({
      status: 'ok',
      environment: 'test',
      checks: {
        firebase: true,
        stripe: true,
        environment: true,
      },
    })
    expect(typeof data.timestamp).toBe('string')
  })

  it('includes Firebase Admin fallback mode status', async () => {
    const request = createMockRequest({
      url: 'http://localhost:3000/api/health',
    })

    const response = await GET(request)
    const data = await getResponseJson(response)

    expect(data).toHaveProperty('checks')
    expect(data.checks).toHaveProperty('firebase')
    expect(typeof data.checks.firebase).toBe('boolean')
  })

  it('includes environment information', async () => {
    const request = createMockRequest({
      url: 'http://localhost:3000/api/health',
    })

    const response = await GET(request)
    const data = await getResponseJson(response)

    expect(data).toHaveProperty('environment')
    expect(data.environment).toBe('test')
  })
})
