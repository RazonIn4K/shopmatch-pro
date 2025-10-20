import { NextRequest, NextResponse } from 'next/server'
import * as Sentry from '@sentry/nextjs'

/**
 * Test endpoint for Sentry error tracking
 * GET /api/sentry-test - Returns 200 OK with test message
 * GET /api/sentry-test?error=true - Triggers test error and sends to Sentry
 *
 * @example
 * curl http://localhost:3000/api/sentry-test
 * curl "http://localhost:3000/api/sentry-test?error=true"
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const shouldError = searchParams.get('error') === 'true'

  if (shouldError) {
    // Trigger a test error to verify Sentry is capturing errors
    const error = new Error('Sentry Test Error - This is a test error to verify Sentry integration')

    // Add context to the error
    Sentry.setContext('test_context', {
      test_type: 'manual_trigger',
      endpoint: '/api/sentry-test',
      timestamp: new Date().toISOString(),
    })

    // Capture the error in Sentry
    Sentry.captureException(error)

    return NextResponse.json(
      {
        error: 'Test error triggered and sent to Sentry',
        message: 'Check your Sentry dashboard to see if the error was captured',
        errorId: Sentry.lastEventId(),
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    status: 'ok',
    message: 'Sentry test endpoint is working',
    hint: 'Add ?error=true query parameter to trigger a test error',
  })
}
