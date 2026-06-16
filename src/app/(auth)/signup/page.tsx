/**
 * Signup Page for ShopMatch Pro
 *
 * Provides user registration interface with role selection between job owners
 * (employers) and job seekers. This file serves as an orchestrator, delegating
 * business logic to useSignup hook and UI rendering to SignupView component.
 *
 * Architecture:
 * - page.tsx: Orchestrates hook + view (this file)
 * - useSignup.ts: Business logic and state management
 * - SignupView.tsx: Pure UI presentation
 * - schemas.ts: Zod validation schemas
 */

'use client'

import { useSignup } from './useSignup'
import { SignupView } from './SignupView'

/**
 * Signup Page Component
 *
 * Simple orchestrator that:
 * 1. Calls useSignup hook for business logic
 * 2. Passes props to SignupView for rendering
 * 3. Maintains minimal complexity (orchestration only)
 *
 * Complexity: Low (orchestration pattern)
 * Logic: Delegated to useSignup hook
 * UI: Delegated to SignupView component
 */
export default function SignupPage() {
  const {
    form,
    isLoading,
    authError,
    handleEmailSignup,
    handleGoogleSignup,
  } = useSignup()

  return (
    <main className="min-h-screen bg-[#f4f6f3] px-4 py-12 text-[#171a16] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-6xl items-center justify-center">
      <SignupView
        form={form}
        isLoading={isLoading}
        authError={authError}
        onSubmit={handleEmailSignup}
        onGoogleSignup={handleGoogleSignup}
      />
      </div>
    </main>
  )
}
