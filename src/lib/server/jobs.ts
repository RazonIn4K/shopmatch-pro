/**
 * Server data layer: jobs collection.
 *
 * All Firestore access for job documents lives here. Route handlers stay
 * responsible for HTTP concerns (request parsing, auth guards, response
 * shaping); this module owns queries, transactions, and document
 * transformation. Functions throw ApiError so handleApiError can map
 * failures to consistent HTTP responses.
 *
 * Extracted from src/app/api/jobs/route.ts and src/app/api/jobs/[id]/route.ts
 * with no intended behavior change (PR 3B).
 */

import { FieldValue } from 'firebase-admin/firestore'

import { ApiError } from '@/lib/api/errors'
import { adminDb, isFirebaseAdminFallbackMode } from '@/lib/firebase/admin'
import { jobFormSchema, jobStatuses, jobTypes } from '@/types'
import type { Job } from '@/types'

import { toDateValue } from './firestore'

/** Validated job form payload (output of jobFormSchema). */
export type JobFormInput = ReturnType<typeof jobFormSchema.parse>

export type JobListFilters = {
  ownerId?: string
  status?: (typeof jobStatuses)[number]
  type?: (typeof jobTypes)[number]
  location?: string
  remote?: boolean
  experience?: 'entry' | 'mid' | 'senior' | 'lead'
  page: number
  limit: number
}

export type JobListResult = {
  jobs: Job[]
  total: number
}

/**
 * Converts a Firestore job document into the Job API model, normalizing
 * Timestamp fields to Dates for JSON serialization.
 */
export function transformJobDocument(doc: FirebaseFirestore.DocumentSnapshot): Job {
  const data = doc.data()!
  return {
    id: doc.id,
    ...data,
    createdAt: toDateValue(data.createdAt),
    updatedAt: toDateValue(data.updatedAt),
    publishedAt: toDateValue(data.publishedAt),
    expiresAt: toDateValue(data.expiresAt),
  } as Job
}

function buildJobsQuery(filters: JobListFilters): FirebaseFirestore.Query {
  let query: FirebaseFirestore.Query = adminDb.collection('jobs')

  // For public listing, only show published jobs unless ownerId filter is present
  if (filters.ownerId) {
    query = query.where('ownerId', '==', filters.ownerId)
  } else {
    query = query.where('status', '==', 'published')
  }

  // Apply additional filters
  if (filters.status && filters.ownerId) {
    // Only allow status filter if user is filtering their own jobs
    query = query.where('status', '==', filters.status)
  }
  if (filters.type) {
    query = query.where('type', '==', filters.type)
  }
  if (filters.remote !== undefined) {
    query = query.where('remote', '==', filters.remote)
  }
  if (filters.experience) {
    query = query.where('experience', '==', filters.experience)
  }

  return query
}

async function applyLocationFiltering(
  jobs: Job[],
  totalQuery: FirebaseFirestore.Query,
  location: string
) {
  const locationLower = location.toLowerCase()

  // Fetch all jobs matching base filters (select only location field for efficiency)
  const allJobsSnapshot = await totalQuery
    .orderBy('createdAt', 'desc')
    .select('location')
    .get()

  // Count jobs matching location filter
  const locationMatchCount = allJobsSnapshot.docs.filter((doc) => {
    const docLocation = doc.data().location
    return docLocation && docLocation.toLowerCase().includes(locationLower)
  }).length

  // Filter current page results by location
  const filteredJobs = jobs.filter((job) => {
    if (typeof job.location !== 'string') {
      return false
    }
    return job.location.toLowerCase().includes(locationLower)
  })

  return { filteredJobs, filteredTotal: locationMatchCount }
}

function buildDemoJobs(): Job[] {
  const now = new Date().toISOString()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  return [
    {
      id: 'demo-job-1',
      title: 'Senior React Developer',
      company: 'TechCorp Solutions',
      type: 'full-time',
      location: 'San Francisco, CA',
      remote: true,
      salary: { currency: 'USD', period: 'yearly', min: 120000, max: 180000 },
      experience: 'senior',
      description:
        'Join our team building cutting-edge web applications with React, TypeScript, and Node.js.',
      requirements: ['5+ years of React experience', 'Strong TypeScript skills', 'Experience with Node.js'],
      status: 'published',
      ownerId: 'demo-owner',
      viewCount: 45,
      applicationCount: 8,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      expiresAt,
    },
    {
      id: 'demo-job-2',
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      type: 'full-time',
      location: 'Remote',
      remote: true,
      salary: { currency: 'USD', period: 'yearly', min: 90000, max: 140000 },
      experience: 'mid',
      description:
        'Fast-growing startup seeking a versatile full stack engineer to help build our SaaS platform.',
      requirements: ['3+ years full stack development', 'React and Node.js', 'PostgreSQL or similar'],
      status: 'published',
      ownerId: 'demo-owner',
      viewCount: 67,
      applicationCount: 12,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      expiresAt,
    },
    {
      id: 'demo-job-3',
      title: 'Frontend Developer',
      company: 'Design Studio Pro',
      type: 'contract',
      location: 'New York, NY',
      remote: false,
      salary: { currency: 'USD', period: 'hourly', min: 80, max: 120 },
      experience: 'mid',
      description:
        'Creative agency looking for a talented frontend developer to join us for a 6-month contract.',
      requirements: ['Strong HTML/CSS/JavaScript', 'React or Vue.js', 'Eye for design'],
      status: 'published',
      ownerId: 'demo-owner',
      viewCount: 34,
      applicationCount: 5,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      expiresAt,
    },
  ] as Job[]
}

/**
 * Lists jobs with pagination, optional filters, and total count.
 *
 * Preserves the demo/fallback behavior of the original route: demo jobs are
 * served when the Admin SDK runs in fallback mode, or when the query returns
 * empty in development.
 *
 * @throws Firestore errors (including missing-index failures) untransformed;
 *         callers classify them via isMissingIndexError.
 */
export async function listJobs(filters: JobListFilters): Promise<JobListResult> {
  const baseQuery = buildJobsQuery(filters)
  const offset = (filters.page - 1) * filters.limit
  const paginatedQuery = baseQuery.orderBy('createdAt', 'desc').limit(filters.limit).offset(offset)

  let jobs: Job[]
  let usingLocalFallback = false

  if (isFirebaseAdminFallbackMode) {
    jobs = buildDemoJobs()
    usingLocalFallback = true
  } else {
    const snapshot = await paginatedQuery.get()
    jobs = snapshot.docs.map(transformJobDocument)
  }

  if (jobs.length === 0 && process.env.NODE_ENV === 'development') {
    jobs = buildDemoJobs()
    usingLocalFallback = true
  }

  // Handle location filter and count
  let filteredJobs = jobs
  let filteredTotal = jobs.length

  if (filters.location) {
    if (usingLocalFallback) {
      const locationLower = filters.location.toLowerCase()
      filteredJobs = jobs.filter((job) => job.location.toLowerCase().includes(locationLower))
      filteredTotal = filteredJobs.length
    } else {
      const result = await applyLocationFiltering(jobs, baseQuery, filters.location)
      filteredJobs = result.filteredJobs
      filteredTotal = result.filteredTotal
    }
  } else if (!usingLocalFallback) {
    // No location filter - use standard count query
    const countSnapshot = await baseQuery.count().get()
    filteredTotal = countSnapshot.data().count
  }

  return { jobs: filteredJobs, total: filteredTotal }
}

/**
 * Fetches a single job, enforcing draft visibility (only the owner may see
 * drafts) and incrementing the view counter for published jobs.
 *
 * The returned Job reflects the pre-increment snapshot, matching the
 * original route behavior.
 */
export async function getJob(jobId: string, viewerUid: string | null): Promise<Job> {
  const jobRef = adminDb.collection('jobs').doc(jobId)
  const doc = await jobRef.get()

  if (!doc.exists) {
    throw new ApiError('Job not found', 404)
  }

  const jobData = doc.data()!

  // Enforce draft visibility: only owner can view draft jobs
  if (jobData.status === 'draft' && jobData.ownerId !== viewerUid) {
    throw new ApiError('Job not found', 404)
  }

  // Increment view count for published jobs
  if (jobData.status === 'published') {
    await jobRef.update({
      viewCount: FieldValue.increment(1),
    })
  }

  return transformJobDocument(doc)
}

/** Creates a job owned by ownerId and returns the stored document. */
export async function createJob(jobData: JobFormInput, ownerId: string): Promise<Job> {
  const now = new Date()
  const newJobData = {
    ...jobData,
    ownerId,
    viewCount: 0,
    applicationCount: 0,
    createdAt: now,
    updatedAt: now,
    publishedAt: jobData.status === 'published' ? now : null,
  }

  const docRef = await adminDb.collection('jobs').add(newJobData)
  const doc = await docRef.get()
  return transformJobDocument(doc)
}

/**
 * Updates a job after verifying ownership. Sets publishedAt only on the
 * draft-to-published transition.
 */
export async function updateJob(jobId: string, ownerId: string, jobData: JobFormInput): Promise<Job> {
  const jobRef = adminDb.collection('jobs').doc(jobId)
  const doc = await jobRef.get()

  if (!doc.exists) {
    throw new ApiError('Job not found', 404)
  }

  const existingJob = doc.data()!
  if (existingJob.ownerId !== ownerId) {
    throw new ApiError('You do not have permission to update this job', 403)
  }

  const now = new Date()
  const wasPublished = existingJob.status === 'published'
  const isNowPublished = jobData.status === 'published'

  const updates = {
    ...jobData,
    updatedAt: now,
    // Set publishedAt only if transitioning from draft to published
    ...((!wasPublished && isNowPublished) && { publishedAt: now }),
  }

  await jobRef.update(updates)

  const updatedDoc = await jobRef.get()
  return transformJobDocument(updatedDoc)
}

/**
 * Deletes a job after verifying ownership, cascading the delete to its
 * applications so none are orphaned.
 *
 * Applications are deleted first: if a batch fails the job remains and the
 * delete can simply be retried. Batches are capped at Firestore's 500-write
 * limit, so the cascade is best-effort cleanup rather than a transaction.
 */
export async function deleteJob(jobId: string, ownerId: string): Promise<void> {
  const jobRef = adminDb.collection('jobs').doc(jobId)
  const doc = await jobRef.get()

  if (!doc.exists) {
    throw new ApiError('Job not found', 404)
  }

  const job = doc.data()!
  if (job.ownerId !== ownerId) {
    throw new ApiError('You do not have permission to delete this job', 403)
  }

  // Delete associated applications first (no orphans on partial failure)
  const applicationsSnapshot = await adminDb
    .collection('applications')
    .where('jobId', '==', jobId)
    .select()
    .get()

  const applicationRefs = applicationsSnapshot.docs.map((appDoc) => appDoc.ref)
  for (let i = 0; i < applicationRefs.length; i += 500) {
    const batch = adminDb.batch()
    for (const ref of applicationRefs.slice(i, i + 500)) {
      batch.delete(ref)
    }
    await batch.commit()
  }

  // Delete the job document
  await jobRef.delete()
}
