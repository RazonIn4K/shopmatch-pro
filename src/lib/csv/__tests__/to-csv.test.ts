/**
 * Unit Tests for CSV Generation Utility
 *
 * Run with: node --loader ts-node/esm src/lib/csv/__tests__/to-csv.test.ts
 * Or with test runner: jest/vitest src/lib/csv/__tests__/to-csv.test.ts
 */

import { toCSV, escapeCSVField, commonTransforms } from '../to-csv'

// Simple test framework
let testsPassed = 0
let testsFailed = 0

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const result = fn()
    if (result instanceof Promise) {
      result
        .then(() => {
          console.log(`✓ ${name}`)
          testsPassed++
        })
        .catch((error) => {
          console.error(`✗ ${name}`)
          console.error(`  Error: ${error.message}`)
          testsFailed++
        })
    } else {
      console.log(`✓ ${name}`)
      testsPassed++
    }
  } catch (error) {
    console.error(`✗ ${name}`)
    console.error(`  Error: ${error instanceof Error ? error.message : String(error)}`)
    testsFailed++
  }
}

function assertEqual(actual: unknown, expected: unknown, message?: string) {
  if (actual !== expected) {
    throw new Error(
      message ||
        `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
    )
  }
}

// CSV Field Escaping Tests
test('escapeCSVField: handles null and undefined', () => {
  assertEqual(escapeCSVField(null), '')
  assertEqual(escapeCSVField(undefined), '')
})

test('escapeCSVField: does not escape simple strings', () => {
  assertEqual(escapeCSVField('hello'), 'hello')
  assertEqual(escapeCSVField('123'), '123')
})

test('escapeCSVField: escapes strings with commas', () => {
  assertEqual(escapeCSVField('hello, world'), '"hello, world"')
})

test('escapeCSVField: escapes strings with newlines', () => {
  assertEqual(escapeCSVField('hello\nworld'), '"hello\nworld"')
})

test('escapeCSVField: escapes strings with quotes', () => {
  assertEqual(escapeCSVField('hello "world"'), '"hello ""world"""')
})

test('escapeCSVField: handles mixed special characters', () => {
  assertEqual(
    escapeCSVField('Name: "John", Age: 30\nCity: NYC'),
    '"Name: ""John"", Age: 30\nCity: NYC"'
  )
})

// CSV Generation Tests
test('toCSV: generates CSV with headers', () => {
  const data = [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 },
  ]

  const csv = toCSV(data, { addBOM: false })
  const expected = 'name,age\nJohn,30\nJane,25'

  assertEqual(csv, expected)
})

test('toCSV: generates CSV without headers', () => {
  const data = [
    { name: 'John', age: 30 },
    { name: 'Jane', age: 25 },
  ]

  const csv = toCSV(data, { includeHeaders: false, addBOM: false })
  const expected = 'John,30\nJane,25'

  assertEqual(csv, expected)
})

test('toCSV: adds UTF-8 BOM by default', () => {
  const data = [{ name: 'John' }]
  const csv = toCSV(data)

  assertEqual(csv.charCodeAt(0), 0xfeff, 'Should start with BOM')
  assertEqual(csv.substring(1), 'name\nJohn', 'Content should follow BOM')
})

test('toCSV: uses custom column mapping', () => {
  const data = [
    { firstName: 'John', age: 30 },
    { firstName: 'Jane', age: 25 },
  ]

  const csv = toCSV(data, {
    columns: {
      firstName: 'Full Name',
      age: 'Age (years)',
    },
    addBOM: false,
  })

  const expected = 'Full Name,Age (years)\nJohn,30\nJane,25'
  assertEqual(csv, expected)
})

test('toCSV: applies custom transforms', () => {
  const data = [
    { name: 'john', verified: true },
    { name: 'jane', verified: false },
  ]

  const csv = toCSV(data, {
    transforms: {
      name: (val) => String(val).toUpperCase(),
      verified: commonTransforms.boolean,
    },
    addBOM: false,
  })

  const expected = 'name,verified\nJOHN,Yes\nJANE,No'
  assertEqual(csv, expected)
})

test('toCSV: handles empty array with columns', () => {
  const csv = toCSV([], {
    columns: { name: 'Name', age: 'Age' },
    addBOM: false,
  })

  assertEqual(csv, 'Name,Age')
})

test('toCSV: throws on empty array without columns', () => {
  try {
    toCSV([], { addBOM: false })
    throw new Error('Should have thrown')
  } catch (error) {
    if (error instanceof Error) {
      assertEqual(
        error.message.includes('empty array'),
        true,
        'Should mention empty array'
      )
    }
  }
})

test('toCSV: handles missing fields gracefully', () => {
  const data = [
    { name: 'John', age: 30 },
    { name: 'Jane' }, // missing age
  ]

  const csv = toCSV(data, { addBOM: false })
  const expected = 'name,age\nJohn,30\nJane,'

  assertEqual(csv, expected)
})

test('toCSV: escapes fields with special characters', () => {
  const data = [
    { title: 'Software Engineer, Senior', company: 'Tech Corp' },
    { title: 'Designer\n(Remote)', company: 'Creative "Studio"' },
  ]

  const csv = toCSV(data, { addBOM: false })
  const expected =
    'title,company\n' +
    '"Software Engineer, Senior",Tech Corp\n' +
    '"Designer\n(Remote)","Creative ""Studio"""'

  assertEqual(csv, expected)
})

// Common Transforms Tests
test('commonTransforms.timestamp: handles Firestore Timestamp', () => {
  const mockTimestamp = {
    toDate: () => new Date('2025-10-16T12:00:00.000Z'),
  }

  const result = commonTransforms.timestamp(mockTimestamp)
  assertEqual(result, '2025-10-16T12:00:00.000Z')
})

test('commonTransforms.timestamp: handles Date objects', () => {
  const date = new Date('2025-10-16T12:00:00.000Z')
  const result = commonTransforms.timestamp(date)
  assertEqual(result, '2025-10-16T12:00:00.000Z')
})

test('commonTransforms.date: formats as YYYY-MM-DD', () => {
  const date = new Date('2025-10-16T12:00:00.000Z')
  const result = commonTransforms.date(date)
  assertEqual(result, '2025-10-16')
})

test('commonTransforms.boolean: formats as Yes/No', () => {
  assertEqual(commonTransforms.boolean(true), 'Yes')
  assertEqual(commonTransforms.boolean(false), 'No')
  assertEqual(commonTransforms.boolean(null), '')
})

test('commonTransforms.capitalize: capitalizes first letter', () => {
  assertEqual(commonTransforms.capitalize('hello'), 'Hello')
  assertEqual(commonTransforms.capitalize('WORLD'), 'WORLD')
  assertEqual(commonTransforms.capitalize(''), '')
})

test('commonTransforms.number: formats with commas', () => {
  assertEqual(commonTransforms.number(1000), '1,000')
  assertEqual(commonTransforms.number(1000000), '1,000,000')
  assertEqual(commonTransforms.number(123), '123')
})

// Integration Test
test('Integration: full export workflow', () => {
  const applications = [
    {
      jobTitle: 'Software Engineer, Senior',
      seekerEmail: 'john@example.com',
      status: 'pending',
      coverLetter: 'I am very interested in this role.\nThank you!',
      appliedAt: new Date('2025-10-15T10:00:00.000Z'),
    },
    {
      jobTitle: 'Product Designer',
      seekerEmail: 'jane@example.com',
      status: 'reviewed',
      coverLetter: 'Portfolio: https://jane.design',
      appliedAt: new Date('2025-10-14T15:30:00.000Z'),
    },
  ]

  const csv = toCSV(applications, {
    columns: {
      jobTitle: 'Job Title',
      seekerEmail: 'Applicant Email',
      status: 'Status',
      coverLetter: 'Cover Letter',
      appliedAt: 'Applied At',
    },
    transforms: {
      status: commonTransforms.capitalize,
      appliedAt: commonTransforms.timestamp,
    },
    addBOM: false,
  })

  const lines = csv.split('\n')
  assertEqual(lines.length, 3, 'Should have 3 lines (header + 2 data rows)')

  // Check header
  assertEqual(
    lines[0],
    'Job Title,Applicant Email,Status,Cover Letter,Applied At'
  )

  // Check first data row
  assertEqual(
    lines[1],
    '"Software Engineer, Senior",john@example.com,Pending,"I am very interested in this role.\nThank you!",2025-10-15T10:00:00.000Z'
  )

  // Check second data row
  assertEqual(
    lines[2],
    'Product Designer,jane@example.com,Reviewed,Portfolio: https://jane.design,2025-10-14T15:30:00.000Z'
  )
})

// Run all tests
console.log('\n🧪 Running CSV Utility Tests...\n')

// Wait a bit for async tests to complete
setTimeout(() => {
  console.log(`\n📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`)
  if (testsFailed > 0) {
    process.exit(1)
  }
}, 100)
