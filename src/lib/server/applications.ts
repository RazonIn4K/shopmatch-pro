/**
 * Server data layer: applications collection.
 *
 * All Firestore access for application documents lives here, including the
 * transactional submission flow introduced in PR #190 (atomic application
 * create + job counter increment). Route handlers keep HTTP concerns;
 * functions here throw ApiError for handleApiError to translate.
 *
 * Extracted from the applications API routes with no intended behavior
 * change (PR 3B).
 */

import { FieldValue } from 'firebase-admin/firestore'

import { ApiError } from '@/lib/api/errors'
import { adminAuth, adminDb } from '@/lib/firebase/admin'
import {
  applicationStatuses,
  applicationStatusUpdateSchema,
  applicationSubmissionSchema,
} from '@/types'
import type { Application } from '@/types'

import { isMissingIndexError, toDateValue } from './firestore'

/** Validated application submission payload. */
export type ApplicationSubmissionInput = ReturnType<typeof applicationSubmissionSchema.parse>

/** Validated application status update payload. */
export type ApplicationStatusUpdateInput = ReturnType<typeof applicationStatusUpdateSchema.parse>

export type ApplicationListFilters = {
  jobId?: string
  seekerId?: string
  ownerId?: string
  status?: (typeof applicationStatuses)[number]
  page: number
  limit: number
}

export type ApplicationListResult = {
  applications: Application[]
  total: number
}

/**
 * Converts a Firestore application document into the Application API model,
 * normalizing Timestamp fields to Dates for JSON serialization.
 */
export function transformApplicationDocument(doc: FirebaseFirestore.DocumentSnapshot): Application {
  const data = doc.data()!
  return {
    id: doc.id,
    ...data,
    createdAt: toDateValue(data.createdAt),
    updatedAt: toDateValue(data.updatedAt),
    reviewedAt: toDateValue(data.reviewedAt),
  } as Application
}

function createdAtToMillis(value: Application['createdAt']): number {
  if (!value) {
    return 0
  }

  if (value instanceof Date) {
    return value.getTime()
  }

  if (typeof value === 'string') {
    return new Date(value).getTime()
  }

  if (typeof value === 'object' && typeof value.toDate === 'function') {
    return value.toDate().getTime()
  }

  return 0
}

function sortApplicationsByCreatedAtDesc(applications: Application[]): Application[] {
  return [...applications].sort((a, b) => createdAtToMillis(b.createdAt) - createdAtToMillis(a.createdAt))
}

function buildApplicationsQuery(filters: ApplicationListFilters): FirebaseFirestore.Query {
  let query: FirebaseFirestore.Query = adminDb.collection('applications')

  if (filters.jobId) {
    query = query.where('jobId', '==', filters.jobId)
  }
  if (filters.seekerId) {
    query = query.where('seekerId', '==', filters.seekerId)
  }
  if (filters.ownerId) {
    query = query.where('ownerId', '==', filters.ownerId)
  }
  if (filters.status) {
    query = query.where('status', '==', filters.status)
  }

  return query
}

/** Lists applications with pagination and total count. */
export async function listApplications(
  filters: ApplicationListFilters
): Promise<ApplicationListResult> {
  const offset = (filters.page - 1) * filters.limit

  try {
    const snapshot = await buildApplicationsQuery(filters)
      .orderBy('createdAt', 'desc')
      .limit(filters.limit)
      .offset(offset)
      .get()

    const countSnapshot = await buildApplicationsQuery(filters).count().get()
    const total = countSnapshot.data().count

    const applications = snapshot.docs.map(transformApplicationDocument)

    return { applications, total }
  } catch (error) {
    if (!isMissingIndexError(error)) {
      throw error
    }

    const snapshot = await buildApplicationsQuery(filters).get()
    const sortedApplications = sortApplicationsByCreatedAtDesc(
      snapshot.docs.map(transformApplicationDocument)
    )

    return {
      applications: sortedApplications.slice(offset, offset + filters.limit),
      total: sortedApplications.length,
    }
  }
}

/**
 * Fetches a single application, ensuring the requester participates in it
 * (as the applicant or the job owner).
 */
export async function getApplicationForParticipant(
  applicationId: string,
  requesterUid: string
): Promise<Application> {
  const appRef = adminDb.collection('applications').doc(applicationId)
  const doc = await appRef.get()

  if (!doc.exists) {
    throw new ApiError('Application not found', 404)
  }

  const appData = doc.data()!

  // Ensure requester is either the seeker or the owner
  if (appData.seekerId !== requesterUid && appData.ownerId !== requesterUid) {
    throw new ApiError('You do not have permission to view this application', 403)
  }

  return transformApplicationDocument(doc)
}

/**
 * Submits an application for a job on behalf of a seeker.
 *
 * Runs as a Firestore transaction so the application document creation and
 * the job's applicationCount increment are atomic. Duplicate submissions are
 * rejected both via the deterministic `${jobId}_${seekerUid}` document ID and
 * a legacy-compatible jobId/seekerId lookup.
 */
export async function submitApplication(
  jobId: string,
  seekerUid: string,
  payload: ApplicationSubmissionInput
): Promise<Application> {
  // Get seeker details
  const userRecord = await adminAuth.getUser(seekerUid)

  const jobRef = adminDb.collection('jobs').doc(jobId)
  // Deterministic ID makes a duplicate application a same-document conflict
  const appRef = adminDb.collection('applications').doc(`${jobId}_${seekerUid}`)
  const now = new Date()

  // Create application and increment the counter atomically
  await adminDb.runTransaction(async (transaction) => {
    // Firestore transactions require all reads before any writes
    const jobDoc = await transaction.get(jobRef)

    if (!jobDoc.exists) {
      throw new ApiError('Job not found', 404)
    }

    const job = jobDoc.data()!
    if (job.status !== 'published') {
      throw new ApiError('This job is not accepting applications', 400)
    }

    // Check if user has already applied
    const existingAppDoc = await transaction.get(appRef)
    if (existingAppDoc.exists) {
      throw new ApiError('You have already applied to this job', 400)
    }

    // Legacy applications have auto-generated IDs, so the deterministic-ID
    // check above cannot detect them — query by jobId/seekerId as well
    const existingApplications = await transaction.get(
      adminDb
        .collection('applications')
        .where('jobId', '==', jobId)
        .where('seekerId', '==', seekerUid)
        .limit(1),
    )

    if (!existingApplications.empty) {
      throw new ApiError('You have already applied to this job', 400)
    }

    const applicationData = {
      jobId,
      seekerId: seekerUid,
      ownerId: job.ownerId,
      coverLetter: payload.coverLetter || null,
      phone: payload.phone || null,
      jobTitle: job.title,
      company: job.company,
      seekerName: userRecord.displayName || 'Anonymous',
      seekerEmail: userRecord.email || '',
      status: 'pending' as const,
      createdAt: now,
      updatedAt: now,
    }

    transaction.create(appRef, applicationData)
    transaction.update(jobRef, {
      applicationCount: FieldValue.increment(1),
    })
  })

  // Retrieve the created application
  const appDoc = await appRef.get()
  return transformApplicationDocument(appDoc)
}

/**
 * Updates an application's status (and reviewer notes) after verifying the
 * requester owns the linked job. Sets reviewedAt on the first transition out
 * of pending.
 */
export async function updateApplicationStatus(
  applicationId: string,
  ownerUid: string,
  update: ApplicationStatusUpdateInput
): Promise<Application> {
  const appRef = adminDb.collection('applications').doc(applicationId)
  const doc = await appRef.get()

  if (!doc.exists) {
    throw new ApiError('Application not found', 404)
  }

  const appData = doc.data()!

  // Verify the authenticated owner manages the linked job
  if (appData.ownerId !== ownerUid) {
    throw new ApiError('You do not have permission to update this application', 403)
  }

  const now = new Date()
  const updates: Partial<Application> = {
    status: update.status,
    notes: update.notes,
    updatedAt: now,
  }

  // Set reviewedAt if status is being changed from pending and reviewedAt is not set
  if (appData.status === 'pending' && update.status !== 'pending' && !appData.reviewedAt) {
    updates.reviewedAt = now
  }

  await appRef.update(updates)

  // Retrieve updated document
  const updatedDoc = await appRef.get()
  return transformApplicationDocument(updatedDoc)
}

/**
 * Raw export data for an owner's applications. The discriminated result lets
 * the export route keep its distinct 404 responses ("no jobs" vs "no
 * applications") byte-for-byte identical.
 */
export type OwnerApplicationsExportData =
  | { kind: 'no-jobs' }
  | { kind: 'no-applications' }
  | {
      kind: 'ok'
      applications: FirebaseFirestore.DocumentData[]
      jobTitles: Map<string, string>
      seekers: Map<string, { email: string }>
    }

/**
 * Collects every application across the owner's jobs, plus job titles and
 * seeker emails, for CSV export. Timestamp fields are returned raw; the CSV
 * layer owns formatting.
 */
export async function getOwnerApplicationsExportData(
  ownerUid: string
): Promise<OwnerApplicationsExportData> {
  // Fetch all jobs owned by user
  const jobsSnapshot = await adminDb
    .collection('jobs')
    .where('ownerId', '==', ownerUid)
    .get()

  if (jobsSnapshot.empty) {
    return { kind: 'no-jobs' }
  }

  const jobIds = jobsSnapshot.docs.map((doc) => doc.id)
  const jobTitles = new Map<string, string>()
  for (const doc of jobsSnapshot.docs) {
    jobTitles.set(doc.id, doc.data().title)
  }

  // Fetch all applications for these jobs
  // Note: Firestore 'in' queries support up to 10 items, so batch if needed
  const applications: FirebaseFirestore.DocumentData[] = []

  for (let i = 0; i < jobIds.length; i += 10) {
    const batch = jobIds.slice(i, i + 10)
    const applicationsSnapshot = await adminDb
      .collection('applications')
      .where('jobId', 'in', batch)
      .orderBy('createdAt', 'desc')
      .get()

    applications.push(...applicationsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })))
  }

  if (applications.length === 0) {
    return { kind: 'no-applications' }
  }

  // Fetch seeker details (email) for each application
  const seekerIds = [...new Set(applications.map((app) => app.seekerId as string))]
  const seekers = new Map<string, { email: string }>()

  for (const seekerId of seekerIds) {
    try {
      const seekerDoc = await adminDb.collection('users').doc(seekerId).get()
      if (seekerDoc.exists) {
        const seekerData = seekerDoc.data()
        seekers.set(seekerId, {
          email: seekerData?.email || 'N/A',
        })
      }
    } catch (error) {
      console.error(`Failed to fetch seeker ${seekerId}:`, error)
      seekers.set(seekerId, { email: 'N/A' })
    }
  }

  return { kind: 'ok', applications, jobTitles, seekers }
}
