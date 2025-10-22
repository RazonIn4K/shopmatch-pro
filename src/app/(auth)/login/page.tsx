/**
 * Login Page
 *
 * Acts as a lightweight orchestrator that chooses between the login
 * and password reset views. Business logic is encapsulated in the
 * corresponding hooks, keeping this component declarative.
 */

'use client'

import { useState, useCallback } from 'react'

import { LoginView } from './LoginView'
import { PasswordResetView } from './PasswordResetView'
import { useLogin } from './useLogin'
import { usePasswordReset } from './usePasswordReset'

/**
 * LoginPage Component
 *
 * Switches between the login view and the password reset view based on
 * user interaction. All form/state logic is delegated to custom hooks.
 */
export default function LoginPage() {
  const [isResettingPassword, setIsResettingPassword] = useState(false)

  const {
    form: loginForm,
    isLoading: isLoginLoading,
    authError: loginError,
    handleEmailLogin,
    handleGoogleLogin,
  } = useLogin()

  const {
    form: resetForm,
    isLoading: isResetLoading,
    authError: resetError,
    handlePasswordReset,
    clearAuthError,
  } = usePasswordReset()

  const showResetView = useCallback(() => {
    loginForm.clearErrors()
    setIsResettingPassword(true)
    clearAuthError()
  }, [clearAuthError, loginForm])

  const showLoginView = useCallback(() => {
    resetForm.reset()
    clearAuthError()
    setIsResettingPassword(false)
  }, [clearAuthError, resetForm])

  return (
    <main className="flex-1 min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {isResettingPassword ? (
        <PasswordResetView
          form={resetForm}
          isLoading={isResetLoading}
          authError={resetError}
          onSubmit={handlePasswordReset}
          onBack={showLoginView}
        />
      ) : (
        <LoginView
          form={loginForm}
          isLoading={isLoginLoading}
          authError={loginError}
          onSubmit={handleEmailLogin}
          onGoogleLogin={handleGoogleLogin}
          onForgotPassword={showResetView}
        />
      )}
    </main>
  )
}
