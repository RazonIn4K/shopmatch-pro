/**
 * Login Page for ShopMatch Pro
 *
 * Provides user authentication interface with support for email/password
 * and Google OAuth sign-in methods. Includes error handling, loading states,
 * and seamless user experience.
 *
 * Features:
 * - Email/password authentication
 * - Google OAuth integration
 * - Password reset functionality
 * - Form validation with Zod schema
 * - Responsive design with shadcn/ui components
 * - Error state management and user feedback
 *
 * Architecture:
 * - Uses custom hooks (useLogin, usePasswordReset) for business logic
 * - Separates concerns: UI components vs authentication logic
 * - Extracted forms into separate components to reduce complexity
 * - Testable and maintainable code structure
 */

'use client'

import { useState } from 'react'

import { LoginForm } from './LoginForm'
import { PasswordResetForm } from './PasswordResetForm'

/**
 * Login Page Component
 *
 * Main authentication interface that handles user sign-in flows.
 * Coordinates between login form and password reset form.
 *
 * Refactored to reduce cyclomatic complexity (was 13, now < 5)
 * and method length (was 214 lines, now < 50 lines).
 */
export default function LoginPage() {
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  if (isResettingPassword) {
    return <PasswordResetForm onBackToLogin={() => setIsResettingPassword(false)} />
  }

  return <LoginForm onForgotPassword={() => setIsResettingPassword(true)} />
}
