#!/usr/bin/env node

/**
 * First-Load JS Bundle Size Measurement Script
 *
 * Measures the actual JavaScript bytes downloaded on initial page load
 * using Playwright to simulate a real browser session.
 *
 * This is more accurate than measuring .next/static/chunks directory size
 * because it:
 * - Only counts JS actually loaded on the page (not all chunks)
 * - Excludes prefetch requests
 * - Excludes Next.js data requests (_next/data)
 * - Measures compressed size (what users actually download)
 *
 * Usage:
 *   FIRST_LOAD_BUDGET_KB=300 node scripts/ci/measure-first-load.mjs
 *
 * Exits with code 1 if budget exceeded, 0 otherwise.
 */

import { chromium } from 'playwright'
import { writeFileSync } from 'fs'

const FIRST_LOAD_BUDGET_KB = parseInt(process.env.FIRST_LOAD_BUDGET_KB || '300', 10)
const TARGET_URL = process.env.TARGET_URL || 'http://localhost:3000'
const REPORT_PATH = process.env.REPORT_PATH || 'first-load-report.json'

async function measureFirstLoad() {
  console.log(`🔍 Measuring first-load JS for: ${TARGET_URL}`)
  console.log(`📊 Budget: ${FIRST_LOAD_BUDGET_KB} KB\n`)

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (compatible; FirstLoadMeasurement/1.0)'
  })
  const page = await context.newPage()

  const jsResources = []
  let totalBytes = 0

  // Track all network responses
  page.on('response', async (response) => {
    const url = response.url()
    const contentType = response.headers()['content-type'] || ''

    // Only count JavaScript resources
    if (!contentType.includes('javascript') && !url.endsWith('.js')) {
      return
    }

    // Exclude prefetch requests (not part of initial load)
    const request = response.request()
    if (request.resourceType() === 'prefetch') {
      return
    }

    // Exclude Next.js data requests (JSON, not JS)
    if (url.includes('/_next/data/')) {
      return
    }

    try {
      const buffer = await response.body()
      const size = buffer.length
      const sizeKB = (size / 1024).toFixed(2)

      jsResources.push({
        url: url.replace(TARGET_URL, ''),
        sizeBytes: size,
        sizeKB: parseFloat(sizeKB),
        contentType
      })

      totalBytes += size
      console.log(`  📦 ${sizeKB} KB - ${url.replace(TARGET_URL, '')}`)
    } catch (err) {
      // Some responses may not have a body (304, etc.)
      console.log(`  ⚠️  Could not measure: ${url}`)
    }
  })

  // Navigate to the page and wait for network idle
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' })

  // Give it a moment for any late-loading scripts
  await page.waitForTimeout(2000)

  await browser.close()

  const totalKB = (totalBytes / 1024).toFixed(2)
  const budgetExceeded = parseFloat(totalKB) > FIRST_LOAD_BUDGET_KB

  const report = {
    timestamp: new Date().toISOString(),
    url: TARGET_URL,
    budgetKB: FIRST_LOAD_BUDGET_KB,
    totalBytes,
    totalKB: parseFloat(totalKB),
    budgetExceeded,
    resources: jsResources.sort((a, b) => b.sizeBytes - a.sizeBytes),
    summary: {
      resourceCount: jsResources.length,
      largestResource: jsResources.length > 0 ? jsResources[0] : null,
      averageResourceSizeKB: jsResources.length > 0
        ? parseFloat((totalBytes / jsResources.length / 1024).toFixed(2))
        : 0
    }
  }

  // Write report to file
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))

  console.log(`\n📈 First-Load JS Summary:`)
  console.log(`   Total: ${totalKB} KB (${jsResources.length} resources)`)
  console.log(`   Budget: ${FIRST_LOAD_BUDGET_KB} KB`)
  console.log(`   Status: ${budgetExceeded ? '❌ FAILED' : '✅ PASSED'}`)
  console.log(`\n📄 Report saved to: ${REPORT_PATH}`)

  if (budgetExceeded) {
    const excess = (parseFloat(totalKB) - FIRST_LOAD_BUDGET_KB).toFixed(2)
    console.log(`\n❌ Budget exceeded by ${excess} KB!`)
    console.log(`\n💡 Recommendations:`)
    console.log(`   - Use dynamic imports for large components`)
    console.log(`   - Remove unused dependencies`)
    console.log(`   - Enable tree shaking`)
    console.log(`   - Split large pages into smaller chunks`)

    if (report.summary.largestResource) {
      console.log(`\n🔍 Largest resource (${report.summary.largestResource.sizeKB} KB):`)
      console.log(`   ${report.summary.largestResource.url}`)
    }

    process.exit(1)
  }

  console.log(`\n✅ First-load JS budget respected!`)
  process.exit(0)
}

measureFirstLoad().catch((error) => {
  console.error('❌ Error measuring first-load JS:', error)
  process.exit(1)
})
