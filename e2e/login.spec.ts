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

      // React Hook Form shows validation errors - at least one should appear
      await expect(page.getByText('Please enter a valid email address')).toBeVisible()
    })

    test('should show validation error for invalid email', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i)
      await emailInput.fill('invalid-email')
      await page.getByLabel(/password/i).fill('password123')

      // HTML5 validation prevents form submission for invalid email format
      // Check that the email input has validation error state
      await page.getByRole('button', { name: /sign in/i }).click()

      // The browser's native validation should prevent submission
      // We can verify by checking the input's validation state
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)
      expect(validationMessage).toBeTruthy()
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
      await expect(page.getByText(/enter your email address and we'll send you a reset link/i)).toBeVisible()
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

      // Empty email triggers Firebase error (HTML5 validation may not catch empty type="email")
      // Should show either validation error or Firebase error
      await expect(page.getByText(/error|please enter|required/i)).toBeVisible()
    })

    test('should show validation error for invalid email in reset form', async ({ page }) => {
      await page.getByText(/forgot your password/i).click()
      const emailInput = page.getByLabel(/email/i)
      await emailInput.fill('not-an-email')
      await page.getByRole('button', { name: /send reset email/i }).click()

      // HTML5 validation prevents form submission for invalid email format
      const validationMessage = await emailInput.evaluate((el: HTMLInputElement) => el.validationMessage)
      expect(validationMessage).toBeTruthy()
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
      // Click email field to start form interaction
      await page.getByLabel(/email/i).click()
      await expect(page.getByLabel(/email/i)).toBeFocused()

      // Tab to password field
      await page.keyboard.press('Tab')
      await expect(page.getByLabel(/password/i)).toBeFocused()

      // Tab to sign in button
      await page.keyboard.press('Tab')
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
