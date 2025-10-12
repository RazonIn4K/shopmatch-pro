import { z } from 'zod'

/**
 * Enumerations for job metadata.
 */
export const jobTypes = ['full-time', 'part-time', 'contract', 'freelance'] as const
export type JobType = (typeof jobTypes)[number]

export const jobStatuses = ['draft', 'published', 'closed'] as const
export type JobStatus = (typeof jobStatuses)[number]

export const compensationPeriods = ['hourly', 'monthly', 'yearly'] as const
export type CompensationPeriod = (typeof compensationPeriods)[number]

/**
 * Zod schema describing job compensation details.
 */
export const jobCompensationSchema = z.object({
  min: z
    .number({ message: 'Minimum salary must be a number' })
    .nonnegative('Minimum salary cannot be negative')
    .optional(),
  max: z
    .number({ message: 'Maximum salary must be a number' })
    .nonnegative('Maximum salary cannot be negative')
    .optional(),
  currency: z
    .string()
    .trim()
    .length(3, 'Currency must be a 3-letter ISO code')
    .default('USD'),
  period: z.enum(compensationPeriods).default('yearly'),
})
  .refine(
    (data) => {
      if (data.min !== undefined && data.max !== undefined) {
        return data.max >= data.min
      }
      return true
    },
    { message: 'Maximum salary must be greater than or equal to minimum salary', path: ['max'] },
  )
  .superRefine((data, ctx) => {
    if (data.min === undefined && data.max === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Provide either a minimum or maximum salary',
        path: ['min'],
      })
    }
  })

/**
 * Shared job schema backing Firestore documents and API payloads.
 */
export const jobSchema = z.object({
  id: z.string().optional(), // Firestore doc.id, populated client-side
  ownerId: z.string().min(1, 'Owner ID is required'),
  title: z.string().trim().min(5).max(100),
  company: z.string().trim().min(2).max(100),
  description: z.string().trim().min(50).max(5000),
  type: z.enum(jobTypes),
  location: z.string().trim().min(2).max(120),
  remote: z.boolean().default(false),
  salary: jobCompensationSchema.optional(),
  requirements: z.array(z.string().trim().min(1)).max(25).optional(),
  skills: z.array(z.string().trim().min(1)).max(30).optional(),
  experience: z.enum(['entry', 'mid', 'senior', 'lead']).optional(),
  status: z.enum(jobStatuses).default('draft'),
  viewCount: z.number().int().nonnegative().default(0),
  applicationCount: z.number().int().nonnegative().default(0),
  createdAt: z.date().or(z.any()).optional(),
  updatedAt: z.date().or(z.any()).optional(),
  publishedAt: z.date().or(z.any()).optional(),
  expiresAt: z.date().or(z.any()).optional(),
})

export type Job = z.infer<typeof jobSchema>

/**
 * Schema for job form submission.
 *
 * Omits calculated fields and system timestamps; ensures requirements/skills
 * arrays exist even when empty to simplify form bindings.
 */
export const jobFormSchema = z.object({
  title: z.string().trim().min(5).max(100),
  company: z.string().trim().min(2).max(100),
  description: z.string().trim().min(50).max(5000),
  type: z.enum(jobTypes),
  location: z.string().trim().min(2).max(120),
  remote: z.boolean(),
  salary: z.object({
    min: z.number().nonnegative().optional(),
    max: z.number().nonnegative().optional(),
    currency: z.string().trim().length(3).default('USD'),
    period: z.enum(compensationPeriods).default('yearly'),
  }).partial().optional(),
  requirements: z.array(z.string()).max(25),
  skills: z.array(z.string()).max(30),
  experience: z.enum(['entry', 'mid', 'senior', 'lead']).optional(),
  status: z.enum(jobStatuses),
})

export type JobFormValues = z.infer<typeof jobFormSchema>

/**
 * Default values for initializing the job form.
 */
export const defaultJobFormValues: JobFormValues = {
  title: '',
  company: '',
  description: '',
  type: 'full-time',
  location: '',
  remote: false,
  requirements: [],
  skills: [],
  experience: 'entry',
  status: 'draft',
}
