/**
 * Server data layer: users collection.
 *
 * Read helpers for user profile documents. Writes happen through the auth
 * flows (AuthContext document creation, initialize-claims route) and are out
 * of scope for this module.
 */

import { adminDb } from '@/lib/firebase/admin'

export interface UserRecordSummary {
  exists: boolean
  role: string | null
}

/**
 * Fetches a user document and returns its role.
 *
 * Returns `{ exists: false, role: null }` when the document is missing so
 * callers can distinguish "no such user" (404) from "wrong role" (403).
 */
export async function getUserRecordSummary(uid: string): Promise<UserRecordSummary> {
  const doc = await adminDb.collection('users').doc(uid).get()

  if (!doc.exists) {
    return { exists: false, role: null }
  }

  const role = doc.data()?.role
  return { exists: true, role: typeof role === 'string' ? role : null }
}
