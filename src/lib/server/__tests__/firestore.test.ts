/**
 * Unit tests for shared server data-layer Firestore helpers.
 *
 * These helpers back the document transformers in jobs.ts and
 * applications.ts, so their pass-through semantics must match the
 * long-standing inline `value?.toDate?.() ?? value` behavior exactly.
 */

import { isMissingIndexError, toDateValue } from '../firestore'

describe('toDateValue', () => {
  it('converts Timestamp-like objects via toDate()', () => {
    const date = new Date('2026-01-15T12:00:00Z')
    const timestampLike = { toDate: () => date }

    expect(toDateValue(timestampLike)).toBe(date)
  })

  it('passes Date instances through unchanged', () => {
    const date = new Date('2026-01-15T12:00:00Z')

    expect(toDateValue(date)).toBe(date)
  })

  it('passes strings through unchanged', () => {
    expect(toDateValue('2026-01-15T12:00:00Z')).toBe('2026-01-15T12:00:00Z')
  })

  it('passes null and undefined through unchanged', () => {
    expect(toDateValue(null)).toBeNull()
    expect(toDateValue(undefined)).toBeUndefined()
  })

  it('passes plain objects without toDate through unchanged', () => {
    const value = { seconds: 1700000000, nanoseconds: 0 }

    expect(toDateValue(value)).toBe(value)
  })
})

describe('isMissingIndexError', () => {
  it('detects numeric failed-precondition code with index message', () => {
    expect(
      isMissingIndexError({
        code: 9,
        message: 'FAILED_PRECONDITION: The query requires an index.',
      })
    ).toBe(true)
  })

  it('detects string failed-precondition code with index message', () => {
    expect(
      isMissingIndexError({
        code: 'failed-precondition',
        message: 'The query requires an index. Create it here: ...',
      })
    ).toBe(true)
  })

  it('rejects failed-precondition errors unrelated to indexes', () => {
    expect(
      isMissingIndexError({
        code: 9,
        message: 'FAILED_PRECONDITION: some other constraint failed',
      })
    ).toBe(false)
  })

  it('rejects other error codes even with index wording', () => {
    expect(
      isMissingIndexError({
        code: 13,
        message: 'The query requires an index.',
      })
    ).toBe(false)
  })

  it('rejects non-object inputs', () => {
    expect(isMissingIndexError(null)).toBe(false)
    expect(isMissingIndexError(undefined)).toBe(false)
    expect(isMissingIndexError('requires an index')).toBe(false)
  })
})
