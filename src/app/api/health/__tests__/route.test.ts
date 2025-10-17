/**
 * Health API Route Tests
 *
 * Tests the /api/health endpoint to verify test infrastructure
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { GET } from '../route'
import { getResponseJson } from '@/__tests__/setup'

describe('GET /api/health', () => {
  it('returns 200 with health status', async () => {
    const response = await GET()
    const data = await getResponseJson(response) as Record<string, unknown>

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
    const response = await GET()
    const data = await getResponseJson(response) as Record<string, any>

    expect(data).toHaveProperty('checks')
    expect(data.checks).toHaveProperty('firebase')
    expect(typeof data.checks.firebase).toBe('boolean')
  })

  it('includes environment information', async () => {
    const response = await GET()
    const data = await getResponseJson(response) as Record<string, any>

    expect(data).toHaveProperty('environment')
    expect(data.environment).toBe('test')
  })
})
