/**
 * Login Page E2E Tests
 *
 * Tests the complete user flows for login and password reset:
 * - Email/password login
 * - Google OAuth (UI only - doesn't test actual OAuth flow)
 * - Password reset flow
 * - Form switching
 * - Error display
 */

import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test.describe('Initial State', () => {
    test('should display login form by default', async ({ page }) => {
      await expect(page.getByText('Welcome to ShopMatch Pro')).toBeVisible()
      await expect(page.getByText('Sign in to your account to continue')).toBeVisible()
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
    })

    test('should not display password reset form initially', async ({ page }) => {
      await expect(page.getByText('Reset Password')).toHaveCount(0)
      await expect(page.getByRole('button', { name: /send reset email/i })).toHaveCount(0)
    })
  })

  test.describe('Login Flow', () => {
    test('should show validation errors for empty form submission', async ({ page }) => {
      await page.getByRole('button', { name: /sign in/i }).click()

      await expect(page.getByText('Please enter a valid email address')).toBeVisible()
      await expect(page.getByText('Password is required')).toBeVisible()
    })

    test('should show validation error for invalid email', async ({ page }) => {
      await page.getByLabel(/email/i).fill('invalid-email')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByRole('button', { name: /sign in/i }).click()

      await expect(page.getByText('Please enter a valid email address')).toBeVisible()
    })

    test('should accept valid email format', async ({ page }) => {
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('password123')

      // Click sign in - will fail auth but form validation passes
      await page.getByRole('button', { name: /sign in/i }).click()

      // No validation errors should be visible
      await expect(page.getByText('Please enter a valid email address')).toHaveCount(0)
    })

    test('should display Google sign-in button', async ({ page }) => {
      const googleButton = page.getByRole('button', { name: /continue with google/i })
      await expect(googleButton).toBeVisible()
      await expect(googleButton).toBeEnabled()
    })
  })

  test.describe('Password Reset Flow', () => {
    test('should switch to password reset form', async ({ page }) => {
      await page.getByText(/forgot your password/i).click()

      await expect(page.getByText('Reset Password')).toBeVisible()
      await expect(page.getByText(/enter your email address and we'll send you a link/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /send reset email/i })).toBeVisible()
    })

    test('should switch back to login form', async ({ page }) => {
      // Go to reset form
      await page.getByText(/forgot your password/i).click()
      await expect(page.getByText('Reset Password')).toBeVisible()

      // Go back to login
      await page.getByRole('button', { name: /back to sign in/i }).click()

      await expect(page.getByText('Welcome to ShopMatch Pro')).toBeVisible()
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })

    test('should show validation error for empty email in reset form', async ({ page }) => {
      await page.getByText(/forgot your password/i).click()
      await page.getByRole('button', { name: /send reset email/i }).click()

      await expect(page.getByText('Please enter a valid email address')).toBeVisible()
    })

    test('should show validation error for invalid email in reset form', async ({ page }) => {
      await page.getByText(/forgot your password/i).click()
      await page.getByLabel(/email/i).fill('not-an-email')
      await page.getByRole('button', { name: /send reset email/i }).click()

      await expect(page.getByText('Please enter a valid email address')).toBeVisible()
    })
  })

  test.describe('Accessibility', () => {
    test('should have accessible form labels', async ({ page }) => {
      // Login form
      await expect(page.getByLabel(/email/i)).toBeVisible()
      await expect(page.getByLabel(/password/i)).toBeVisible()

      // Password reset form
      await page.getByText(/forgot your password/i).click()
      await expect(page.getByLabel(/email/i)).toBeVisible()
    })

    test('should have keyboard navigable forms', async ({ page }) => {
      // Tab through login form
      await page.keyboard.press('Tab') // Focus email
      await expect(page.getByLabel(/email/i)).toBeFocused()

      await page.keyboard.press('Tab') // Focus password
      await expect(page.getByLabel(/password/i)).toBeFocused()

      await page.keyboard.press('Tab') // Focus sign in button
      await expect(page.getByRole('button', { name: /sign in/i })).toBeFocused()
    })

    test('should allow form submission with Enter key', async ({ page }) => {
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('password123')
      await page.getByLabel(/password/i).press('Enter')

      // Form should submit (will fail auth but that's expected)
      // Verify no validation errors
      await expect(page.locator('text=/valid email/i')).not.toBeVisible()
    })
  })

  test.describe('Form State Management', () => {
    test('should clear password reset form when switching back to login', async ({ page }) => {
      // Fill reset form
      await page.getByText(/forgot your password/i).click()
      await page.getByLabel(/email/i).fill('test@example.com')

      // Switch back to login
      await page.getByRole('button', { name: /back to sign in/i }).click()

      // Switch back to reset - form should be empty
      await page.getByText(/forgot your password/i).click()
      await expect(page.getByLabel(/email/i)).toHaveValue('')
    })

    test('should maintain login form state when switching to reset and back', async ({ page }) => {
      // Fill login form
      await page.getByLabel(/email/i).fill('test@example.com')
      await page.getByLabel(/password/i).fill('password123')

      // Switch to reset
      await page.getByText(/forgot your password/i).click()

      // Switch back to login
      await page.getByRole('button', { name: /back to sign in/i }).click()

      // Login form should maintain state
      await expect(page.getByLabel(/email/i)).toHaveValue('test@example.com')
      await expect(page.getByLabel(/password/i)).toHaveValue('password123')
    })
  })
})
