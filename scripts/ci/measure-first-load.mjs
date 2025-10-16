#!/usr/bin/env node

/**
 * First-Load JS Bundle Size Measurement Script
 *
 * Parses Next.js build output to extract first-load JS sizes and validate
 * against budget. Uses Next.js's reported gzip sizes (what Vercel/CDN serves).
 *
 * This approach is more accurate than Playwright measurement because:
 * - Next.js build output shows actual compressed sizes
 * - Standalone server doesn't compress (but Vercel does)
 * - Measures what production users will actually download
 * - Faster and more reliable than browser automation
 *
 * Usage:
 *   npm run build > build-output.txt 2>&1
 *   FIRST_LOAD_BUDGET_KB=300 node scripts/ci/measure-first-load.mjs build-output.txt
 *
 * Or pipe directly:
 *   npm run build 2>&1 | FIRST_LOAD_BUDGET_KB=300 node scripts/ci/measure-first-load.mjs
 *
 * Exits with code 1 if budget exceeded, 0 otherwise.
 */

import { readFileSync, writeFileSync } from 'fs'

const FIRST_LOAD_BUDGET_KB = parseInt(process.env.FIRST_LOAD_BUDGET_KB || '300', 10)
const REPORT_PATH = process.env.REPORT_PATH || 'first-load-report.json'

// Read build output from file or stdin
const buildOutputPath = process.argv[2]
let buildOutput

if (buildOutputPath) {
  buildOutput = readFileSync(buildOutputPath, 'utf-8')
} else {
  // Read from stdin
  buildOutput = readFileSync(0, 'utf-8')
}

console.log(`🔍 Parsing Next.js build output for first-load JS sizes`)
console.log(`📊 Budget: ${FIRST_LOAD_BUDGET_KB} KB\n`)

// Parse Next.js build output
// Example line: "├ ○ /                             5.38 kB         243 kB"
// Format: [symbol] [path] [route size] [first-load JS]
const routePattern = /^[┌├└].*?(\/\S*)\s+(\d+\.?\d*)\s+(k?B)\s+(\d+\.?\d*)\s+(k?B)/gm

const routes = []
let match

while ((match = routePattern.exec(buildOutput)) !== null) {
  const [, path, routeSizeNum, routeSizeUnit, firstLoadNum, firstLoadUnit] = match

  // Convert to KB
  const routeKB = routeSizeUnit === 'B' ? parseFloat(routeSizeNum) / 1024 : parseFloat(routeSizeNum)
  const firstLoadKB = firstLoadUnit === 'B' ? parseFloat(firstLoadNum) / 1024 : parseFloat(firstLoadNum)

  routes.push({
    path,
    routeKB: parseFloat(routeKB.toFixed(2)),
    firstLoadKB: parseFloat(firstLoadKB.toFixed(2))
  })

  console.log(`  📄 ${path.padEnd(30)} → ${firstLoadKB.toFixed(2)} KB first-load`)
}

if (routes.length === 0) {
  console.error('\n❌ Error: Could not parse Next.js build output')
  console.error('Expected format: npm run build output with route table')
  process.exit(1)
}

// Find homepage (/) first-load JS
const homepage = routes.find(r => r.path === '/')
if (!homepage) {
  console.error('\n❌ Error: Could not find homepage (/) in build output')
  process.exit(1)
}

const homepageFirstLoadKB = homepage.firstLoadKB
const budgetExceeded = homepageFirstLoadKB > FIRST_LOAD_BUDGET_KB

// Find largest first-load route
const largestRoute = routes.reduce((max, route) =>
  route.firstLoadKB > max.firstLoadKB ? route : max
, routes[0])

const report = {
  timestamp: new Date().toISOString(),
  budgetKB: FIRST_LOAD_BUDGET_KB,
  homepageFirstLoadKB,
  budgetExceeded,
  routes: routes.sort((a, b) => b.firstLoadKB - a.firstLoadKB),
  summary: {
    routeCount: routes.length,
    largestRoute,
    averageFirstLoadKB: parseFloat(
      (routes.reduce((sum, r) => sum + r.firstLoadKB, 0) / routes.length).toFixed(2)
    )
  }
}

// Write report to file
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))

console.log(`\n📈 First-Load JS Summary:`)
console.log(`   Homepage: ${homepageFirstLoadKB} KB`)
console.log(`   Budget: ${FIRST_LOAD_BUDGET_KB} KB`)
console.log(`   Status: ${budgetExceeded ? '❌ FAILED' : '✅ PASSED'}`)
console.log(`\n📄 Report saved to: ${REPORT_PATH}`)

if (budgetExceeded) {
  const excess = (homepageFirstLoadKB - FIRST_LOAD_BUDGET_KB).toFixed(2)
  console.log(`\n❌ Budget exceeded by ${excess} KB!`)
  console.log(`\n💡 Recommendations:`)
  console.log(`   - Use dynamic imports for large components`)
  console.log(`   - Remove unused dependencies`)
  console.log(`   - Enable tree shaking`)
  console.log(`   - Split large pages into smaller chunks`)

  if (largestRoute.path !== '/') {
    console.log(`\n🔍 Largest route (${largestRoute.firstLoadKB} KB):`)
    console.log(`   ${largestRoute.path}`)
  }

  process.exit(1)
}

console.log(`\n✅ First-load JS budget respected!`)
console.log(`\n🏆 Best practices:`)
console.log(`   - Homepage loads only ${homepageFirstLoadKB} KB`)
console.log(`   - ${FIRST_LOAD_BUDGET_KB - homepageFirstLoadKB} KB budget remaining`)
console.log(`   - Largest route: ${largestRoute.path} (${largestRoute.firstLoadKB} KB)`)
process.exit(0)
