import { z } from 'zod'

export interface FirestoreTimestampLike {
  toDate: () => Date
}

export const firestoreTimestampSchema = z.custom<FirestoreTimestampLike>(
  (value) =>
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Partial<FirestoreTimestampLike>).toDate === 'function',
  {
    message: 'Timestamp-like objects must provide a toDate() method',
  },
)

export const timestampSchema = z.union([
  z.date(),
  z.string().datetime({ message: 'Timestamp must be an ISO 8601 string' }),
  firestoreTimestampSchema,
])

export type FirestoreTimestamp = z.infer<typeof firestoreTimestampSchema>
export type TimestampValue = z.infer<typeof timestampSchema>
