/**
 * CSV Generation Utility with Excel Compatibility
 *
 * Converts JavaScript objects to CSV format with proper escaping,
 * UTF-8 BOM for Excel compatibility, and type-safe column mapping.
 *
 * @example
 * ```typescript
 * import { toCSV } from '@/lib/csv/to-csv'
 *
 * const applications = [
 *   { jobTitle: 'Engineer', seeker: 'John', status: 'pending' },
 *   { jobTitle: 'Designer', seeker: 'Jane', status: 'reviewed' }
 * ]
 *
 * const csv = toCSV(applications, {
 *   columns: {
 *     jobTitle: 'Job Title',
 *     seeker: 'Applicant Name',
 *     status: 'Status'
 *   },
 *   includeHeaders: true,
 *   addBOM: true
 * })
 * ```
 */

export interface CSVOptions<T> {
  /**
   * Column mapping: object key → CSV header name
   * If not provided, all object keys are used as-is
   */
  columns?: Record<keyof T, string> | (keyof T)[]

  /**
   * Include header row with column names
   * @default true
   */
  includeHeaders?: boolean

  /**
   * Add UTF-8 BOM for Excel compatibility
   * @default true
   */
  addBOM?: boolean

  /**
   * Custom value transformer for specific columns
   * Useful for formatting dates, enums, etc.
   */
  transforms?: Partial<Record<keyof T, (value: unknown) => string>>
}

/**
 * Escapes a CSV field value according to RFC 4180
 *
 * Rules:
 * - Fields containing comma, newline, or quote are enclosed in quotes
 * - Quote characters within fields are escaped by doubling them
 * - null/undefined are converted to empty strings
 *
 * @param value - Value to escape
 * @returns Escaped CSV field
 */
export function escapeCSVField(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  const str = String(value)

  // Check if field needs quoting
  const needsQuoting = str.includes(',') || str.includes('\n') || str.includes('"') || str.includes('\r')

  if (!needsQuoting) {
    return str
  }

  // Escape quotes by doubling them, then wrap in quotes
  const escaped = str.replace(/"/g, '""')
  return `"${escaped}"`
}

/**
 * Converts an array of objects to CSV format
 *
 * @param data - Array of objects to convert
 * @param options - CSV generation options
 * @returns CSV string with optional UTF-8 BOM
 *
 * @throws {Error} If data array is empty and columns are not specified
 */
export function toCSV<T extends Record<string, unknown>>(
  data: T[],
  options: CSVOptions<T> = {}
): string {
  const {
    columns,
    includeHeaders = true,
    addBOM = true,
    transforms = {},
  } = options

  // Handle empty data
  if (data.length === 0) {
    if (!columns) {
      throw new Error('Cannot generate CSV from empty array without column specification')
    }

    // Return just headers if includeHeaders is true
    if (includeHeaders) {
      const headers = Array.isArray(columns)
        ? columns.map(String)
        : Object.values(columns)

      const headerRow = headers.map(escapeCSVField).join(',')
      return addBOM ? `\uFEFF${headerRow}` : headerRow
    }

    return addBOM ? '\uFEFF' : ''
  }

  // Determine columns
  let columnKeys: (keyof T)[]
  let columnHeaders: string[]

  if (!columns) {
    // Use all keys from first object
    columnKeys = Object.keys(data[0]) as (keyof T)[]
    columnHeaders = columnKeys.map(String)
  } else if (Array.isArray(columns)) {
    // Use provided keys
    columnKeys = columns
    columnHeaders = columns.map(String)
  } else {
    // Use provided key-to-header mapping
    columnKeys = Object.keys(columns) as (keyof T)[]
    columnHeaders = Object.values(columns)
  }

  // Build CSV rows
  const rows: string[] = []

  // Add header row
  if (includeHeaders) {
    rows.push(columnHeaders.map(escapeCSVField).join(','))
  }

  // Add data rows
  for (const item of data) {
    const row = columnKeys.map((key) => {
      const value = item[key]

      // Apply transform if provided
      let transformedValue: unknown = value
      if (transforms) {
        const transform = (transforms as Record<string, ((v: unknown) => string) | undefined>)[key as string]
        if (transform) {
          transformedValue = transform(value)
        }
      }

      return escapeCSVField(transformedValue)
    })

    rows.push(row.join(','))
  }

  const csv = rows.join('\n')

  // Add UTF-8 BOM for Excel compatibility
  return addBOM ? `\uFEFF${csv}` : csv
}

/**
 * Common transforms for CSV export
 */
export const commonTransforms = {
  /**
   * Format Firestore Timestamp to ISO 8601
   */
  timestamp: (value: unknown): string => {
    if (!value) return ''
    if (typeof value === 'object' && 'toDate' in value) {
      // Firestore Timestamp
      return (value as { toDate: () => Date }).toDate().toISOString()
    }
    if (value instanceof Date) {
      return value.toISOString()
    }
    return String(value)
  },

  /**
   * Format date to YYYY-MM-DD
   */
  date: (value: unknown): string => {
    if (!value) return ''
    const date = value instanceof Date ? value : new Date(String(value))
    return date.toISOString().split('T')[0]
  },

  /**
   * Format boolean as Yes/No
   */
  boolean: (value: unknown): string => {
    if (value === null || value === undefined) return ''
    return value ? 'Yes' : 'No'
  },

  /**
   * Capitalize first letter
   */
  capitalize: (value: unknown): string => {
    if (!value) return ''
    const str = String(value)
    return str.charAt(0).toUpperCase() + str.slice(1)
  },

  /**
   * Format number with commas (e.g., 1000 → 1,000)
   */
  number: (value: unknown): string => {
    if (value === null || value === undefined) return ''
    const num = Number(value)
    return isNaN(num) ? String(value) : num.toLocaleString('en-US')
  },
}
