import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/api/auth'
import { adminDb } from '@/lib/firebase/admin'

export const runtime = 'nodejs'

interface EventRequestBody {
  event?: string
  payload?: Record<string, unknown>
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const auth = await verifyAuth(request)
    const body = (await request.json()) as EventRequestBody

    if (!body.event || typeof body.event !== 'string') {
      return NextResponse.json({ error: 'event is required' }, { status: 400 })
    }

    await adminDb.collection('events').add({
      event: body.event,
      payload: body.payload ?? {},
      userId: auth.uid,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Telemetry event error:', error)
    return NextResponse.json({ error: 'Unable to record event' }, { status: 500 })
  }
}
