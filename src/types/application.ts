import { z } from 'zod'

import { jobTypes } from './job'
import { timestampSchema } from './timestamp'

export const applicationStatuses = ['pending', 'reviewed', 'accepted', 'rejected'] as const
export type ApplicationStatus = (typeof applicationStatuses)[number]

/**
 * Base schema for application documents stored in Firestore.
 */
export const applicationSchema = z.object({
  id: z.string().optional(), // Firestore doc.id, populated client-side
  jobId: z.string().min(1, 'Job ID is required'),
  seekerId: z.string().min(1, 'Applicant ID is required'),
  ownerId: z.string().min(1, 'Job owner ID is required'),
  coverLetter: z
    .string()
    .max(2000, 'Cover letter must be 2000 characters or less')
    .optional()
    .or(z.literal('')),
  resumeUrl: z.string().url().optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[+()0-9\-\s]{7,20}$/, 'Enter a valid phone number')
    .optional(),
  email: z.string().email().optional(),
  jobTitle: z.string().min(1, 'Job title snapshot is required'),
  company: z.string().min(1, 'Company snapshot is required'),
  jobType: z.enum(jobTypes).optional(),
  seekerName: z.string().min(1, 'Seeker name is required'),
  seekerEmail: z.string().email('Seeker email is required'),
  status: z.enum(applicationStatuses).default('pending'),
  notes: z.string().max(2000).optional(),
  createdAt: timestampSchema.optional(),
  updatedAt: timestampSchema.optional(),
  reviewedAt: timestampSchema.optional(),
})

export type Application = z.infer<typeof applicationSchema>

/**
 * Schema for seekers submitting a new application.
 *
 * Only the fields the applicant is allowed to provide are included here. Server
 * logic will hydrate denormalized job and owner metadata as part of the write.
 */
export const applicationSubmissionSchema = z.object({
  coverLetter: z
    .string()
    .trim()
    .min(50, 'Cover letter must be at least 50 characters')
    .max(2000, 'Cover letter must be 2000 characters or less')
    .optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[+()0-9\-\s]{7,20}$/, 'Enter a valid phone number')
    .optional(),
  resumeUrl: z.string().url('Resume must be a valid URL').optional(),
})

export type ApplicationSubmissionValues = z.infer<typeof applicationSubmissionSchema>

/**
 * Schema for owners updating application status or notes.
 */
export const applicationStatusUpdateSchema = z.object({
  status: z.enum(applicationStatuses),
  notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional(),
})

export type ApplicationStatusUpdateValues = z.infer<typeof applicationStatusUpdateSchema>
