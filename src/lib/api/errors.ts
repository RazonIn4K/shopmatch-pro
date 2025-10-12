import { NextResponse } from 'next/server'

/**
 * Domain-specific error object used by API route handlers.
 */
export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(message: string, status = 400, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

/**
 * Convert unknown errors into standardized HTTP responses.
 */
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        details: error.details,
      },
      { status: error.status },
    )
  }

  console.error('Unhandled API error', error)
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}
