#!/usr/bin/env node

/**
 * First-Load JS Bundle Size Measurement Script
 *
 * Parses Next.js build output to extract first-load JS sizes and validate
 * against budget. For Next.js versions that omit size columns from build
 * output, falls back to App Router client manifests and emitted JS chunks.
 *
 * This approach is more accurate than Playwright measurement because:
 * - Next.js build output shows actual compressed sizes when available
 * - App Router manifest fallback measures emitted production chunks
 * - Fallback uses brotli by default because Vercel/CDNs serve it to modern browsers
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

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join, relative } from 'path'
import { brotliCompressSync, gzipSync } from 'zlib'
import { runInNewContext } from 'vm'
import { validateFilePath } from '../utils/validate-file-path.mjs'

const FIRST_LOAD_BUDGET_KB = parseInt(process.env.FIRST_LOAD_BUDGET_KB || '300', 10)
const REPORT_PATH = process.env.REPORT_PATH || 'first-load-report.json'
const FALLBACK_COMPRESSION = process.env.FIRST_LOAD_FALLBACK_COMPRESSION || 'brotli'

// Read build output from file or stdin
const buildOutputPath = process.argv[2]
let buildOutput

if (buildOutputPath) {
  try {
    const validatedPath = validateFilePath(buildOutputPath)
    buildOutput = readFileSync(validatedPath, 'utf-8')
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
} else {
  // Read from stdin
  buildOutput = readFileSync(0, 'utf-8')
}

console.log(`🔍 Parsing Next.js build output for first-load JS sizes`)
console.log(`📊 Budget: ${FIRST_LOAD_BUDGET_KB} KB\n`)

function toKB(bytes) {
  return parseFloat((bytes / 1024).toFixed(2))
}

function normalizeStaticChunkPath(chunkPath) {
  return chunkPath
    .replace(/^\/_next\//, '')
    .replace(/^\/+/, '')
}

function compressedBytes(buffer) {
  if (FALLBACK_COMPRESSION === 'gzip') {
    return gzipSync(buffer).length
  }

  return brotliCompressSync(buffer).length
}

function parseRoutesFromBuildOutput(output) {
  // Parse Next.js <=15 build output.
  // Example line: "├ ○ /                             5.38 kB         243 kB"
  // Format: [symbol] [path] [route size] [first-load JS]
  const routePattern = /^[┌├└].*?(\/\S*)\s+(\d+\.?\d*)\s+(k?B)\s+(\d+\.?\d*)\s+(k?B)/gm
  const parsedRoutes = []
  let match

  while ((match = routePattern.exec(output)) !== null) {
    const [, path, routeSizeNum, routeSizeUnit, firstLoadNum, firstLoadUnit] = match

    // Convert to KB
    const routeKB = routeSizeUnit === 'B' ? parseFloat(routeSizeNum) / 1024 : parseFloat(routeSizeNum)
    const firstLoadKB = firstLoadUnit === 'B' ? parseFloat(firstLoadNum) / 1024 : parseFloat(firstLoadNum)

    parsedRoutes.push({
      path,
      routeKB: parseFloat(routeKB.toFixed(2)),
      firstLoadKB: parseFloat(firstLoadKB.toFixed(2)),
      rawKB: null,
      chunkCount: null,
    })
  }

  return parsedRoutes
}

function findFiles(dir, predicate) {
  if (!existsSync(dir)) {
    return []
  }

  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...findFiles(entryPath, predicate))
    } else if (entry.isFile() && predicate(entryPath)) {
      files.push(entryPath)
    }
  }

  return files
}

function appManifestPathToRoute(appPath) {
  const routeParts = appPath
    .replace(/^\/+/, '')
    .split('/')
    .filter(part => part && !part.startsWith('(') && !part.startsWith('@'))
    .filter(part => part !== 'page')

  return routeParts.length === 0 ? '/' : `/${routeParts.join('/')}`
}

function loadClientReferenceManifest(filePath) {
  const context = { globalThis: {} }
  runInNewContext(readFileSync(filePath, 'utf-8'), context, { filename: filePath })
  return context.globalThis.__RSC_MANIFEST || {}
}

function parseRoutesFromAppManifests() {
  const buildManifestPath = '.next/build-manifest.json'
  if (!existsSync(buildManifestPath)) {
    throw new Error('Could not find .next/build-manifest.json. Run `npm run build` before measuring Next.js 16 output.')
  }

  const buildManifest = JSON.parse(readFileSync(buildManifestPath, 'utf-8'))
  const sharedChunks = new Set([
    ...(buildManifest.polyfillFiles || []),
    ...(buildManifest.rootMainFiles || []),
  ])

  const manifestFiles = findFiles(
    '.next/server/app',
    filePath => filePath.endsWith('page_client-reference-manifest.js')
  )

  const routeMap = new Map()

  for (const manifestFile of manifestFiles) {
    const manifests = loadClientReferenceManifest(manifestFile)

    for (const [appPath, manifest] of Object.entries(manifests)) {
      const routePath = appManifestPathToRoute(appPath)
      const chunks = new Set(sharedChunks)

      for (const entryFiles of Object.values(manifest.entryJSFiles || {})) {
        for (const chunk of entryFiles) {
          chunks.add(normalizeStaticChunkPath(chunk))
        }
      }

      let rawBytes = 0
      let firstLoadBytes = 0
      const resolvedChunks = []

      for (const chunk of chunks) {
        const chunkPath = join('.next', normalizeStaticChunkPath(chunk))
        if (!existsSync(chunkPath) || !statSync(chunkPath).isFile()) {
          continue
        }

        const buffer = readFileSync(chunkPath)
        rawBytes += buffer.length
        firstLoadBytes += compressedBytes(buffer)
        resolvedChunks.push(relative('.next', chunkPath))
      }

      const route = {
        path: routePath,
        routeKB: null,
        firstLoadKB: toKB(firstLoadBytes),
        rawKB: toKB(rawBytes),
        chunkCount: resolvedChunks.length,
        chunks: resolvedChunks.sort(),
      }

      const existingRoute = routeMap.get(routePath)
      if (!existingRoute || route.firstLoadKB > existingRoute.firstLoadKB) {
        routeMap.set(routePath, route)
      }
    }
  }

  return [...routeMap.values()]
}

let measurement = 'next-build-output'
let compression = 'reported'
let routes = parseRoutesFromBuildOutput(buildOutput)

if (routes.length === 0) {
  console.log('ℹ️  Build output did not include first-load columns; using Next.js App Router manifest fallback.')
  measurement = 'next-app-manifest'
  compression = FALLBACK_COMPRESSION

  try {
    routes = parseRoutesFromAppManifests()
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error))
    process.exit(1)
  }
}

if (routes.length === 0) {
  console.error('\n❌ Error: Could not determine first-load JS sizes')
  console.error('Expected either Next.js route-table size output or .next App Router manifests')
  process.exit(1)
}

for (const route of routes.sort((a, b) => a.path.localeCompare(b.path))) {
  const chunkSummary = route.chunkCount === null ? '' : ` (${route.chunkCount} chunks, ${compression})`
  console.log(`  📄 ${route.path.padEnd(30)} → ${route.firstLoadKB.toFixed(2)} KB first-load${chunkSummary}`)
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
  measurement,
  compression,
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
