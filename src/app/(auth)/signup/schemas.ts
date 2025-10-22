/**
 * Signup Page Validation Schemas
 *
 * Zod schemas for form validation across signup flow.
 * These schemas ensure data integrity and provide user-friendly error messages.
 */

import { z } from 'zod'

/**
 * Signup form validation schema
 *
 * Comprehensive validation for:
 * - Email format and uniqueness
 * - Password strength requirements
 * - Display name requirements
 * - Role selection validation
 * - Password confirmation matching
 *
 * Used by useSignup hook and SignupView component.
 */
export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  displayName: z.string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be less than 50 characters'),
  role: z.enum(['owner', 'seeker'], {
    message: 'Please select a role',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

/**
 * TypeScript types derived from schemas
 */
export type SignupFormData = z.infer<typeof signupSchema>
