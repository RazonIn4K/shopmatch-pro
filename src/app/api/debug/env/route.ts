/**
 * Debug endpoint to check environment configuration
 * REMOVE THIS IN PRODUCTION!
 */

import { NextResponse } from 'next/server'
import { getAppBaseUrl } from '@/lib/env'

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    computedBaseUrl: getAppBaseUrl(),
    nodeEnv: process.env.NODE_ENV,
  })
}
