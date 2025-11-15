"use client"

import { auth } from '@/lib/firebase/client'

interface TrackEventPayload {
  event: string
  payload?: Record<string, unknown>
}

async function sendEvent(body: TrackEventPayload, token?: string | null): Promise<void> {
  try {
    await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
      keepalive: true,
    })
  } catch (error) {
    console.error('Failed to send telemetry event', error)
  }
}

export async function trackEvent(event: string, payload: Record<string, unknown> = {}): Promise<void> {
  try {
    const token = auth.currentUser ? await auth.currentUser.getIdToken() : null
    await sendEvent({ event, payload }, token)
  } catch (error) {
    console.error('trackEvent error', error)
  }
}
