/**
 * Login Page Validation Schemas
 *
 * Zod schemas for form validation across login and password reset flows.
 * These schemas ensure data integrity and provide user-friendly error messages.
 */

import { z } from 'zod'

/**
 * Login form validation schema
 *
 * Validates email format and password presence.
 * Used by useLogin hook and LoginForm component.
 */
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

/**
 * Password reset form validation schema
 *
 * Validates email format for password reset requests.
 * Used by usePasswordReset hook and PasswordResetForm component.
 */
export const resetSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

/**
 * TypeScript types derived from schemas
 */
export type LoginFormData = z.infer<typeof loginSchema>
export type ResetFormData = z.infer<typeof resetSchema>
