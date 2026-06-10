#!/usr/bin/env node

/**
 * Custom Claims Backfill Script for ShopMatch Pro
 *
 * The Firestore rules v2 check authorization via JWT custom claims
 * (request.auth.token.role / request.auth.token.subActive) instead of
 * reading the users/{uid} document. Users created before claims
 * initialization existed (or whose claims drifted) need a backfill.
 *
 * For every Firebase Auth user this script:
 * - Reads the users/{uid} Firestore document
 * - Derives role (owner/seeker) and subActive from the document
 * - Sets custom claims, preserving any other existing claims
 * - Skips users whose claims already match
 *
 * Usage:
 *   node scripts/backfill-claims.js            # apply changes
 *   node scripts/backfill-claims.js --dry-run  # report only, change nothing
 *
 * Requirements:
 * - Proper authentication (gcloud CLI or service account)
 * - Environment variables configured (.env.local)
 *
 * Note: Users must refresh their ID token (sign out/in, or
 * user.getIdToken(true)) before new claims take effect client-side.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' })

const { initializeApp, getApps, cert } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

const DRY_RUN = process.argv.includes('--dry-run')
const VALID_ROLES = ['owner', 'seeker']

/**
 * Initialize Firebase Admin SDK (ADC first, service account fallback)
 */
function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  const projectId = process.env.FIREBASE_PROJECT_ID

  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID environment variable is required')
  }

  console.log(`🔥 Initializing Firebase Admin for project: ${projectId}`)

  try {
    const app = initializeApp({ projectId })
    console.log('✅ Using Application Default Credentials (gcloud CLI)')
    return app
  } catch {
    console.log('⚠️ ADC failed, trying service account credentials...')

    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!clientEmail || !privateKey) {
      throw new Error(
        'Neither ADC nor service account credentials available. ' +
        'Run: gcloud auth application-default login'
      )
    }

    const app = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    })
    console.log('✅ Using service account credentials')
    return app
  }
}

/**
 * Decide the claims a user should have, based on their Firestore document.
 * Returns null when the user should be skipped.
 */
function desiredClaimsFor(uid, userDoc) {
  if (!userDoc.exists) {
    console.log(`   ⚠️ ${uid}: no users/ document — skipping`)
    return null
  }

  const data = userDoc.data()
  const role = data.role

  if (!VALID_ROLES.includes(role)) {
    console.log(`   ⚠️ ${uid}: invalid role "${role}" — skipping`)
    return null
  }

  return {
    role,
    subActive: data.subActive === true,
  }
}

async function backfill() {
  const app = initializeFirebaseAdmin()
  const auth = getAuth(app)
  const db = getFirestore(app)

  console.log(`\n${DRY_RUN ? '🔍 DRY RUN — no changes will be made' : '🚀 Applying claim backfill'}\n`)

  const stats = { total: 0, updated: 0, alreadyCorrect: 0, skipped: 0 }
  let pageToken

  do {
    const page = await auth.listUsers(1000, pageToken)
    pageToken = page.pageToken

    for (const user of page.users) {
      stats.total++

      const userDoc = await db.collection('users').doc(user.uid).get()
      const desired = desiredClaimsFor(user.uid, userDoc)

      if (!desired) {
        stats.skipped++
        continue
      }

      const existing = user.customClaims || {}

      if (existing.role === desired.role && existing.subActive === desired.subActive) {
        stats.alreadyCorrect++
        continue
      }

      console.log(
        `   ${DRY_RUN ? 'would update' : 'updating'} ${user.email || user.uid}: ` +
        `role ${existing.role ?? '∅'} → ${desired.role}, ` +
        `subActive ${existing.subActive ?? '∅'} → ${desired.subActive}`
      )

      if (!DRY_RUN) {
        // Preserve unrelated existing claims
        await auth.setCustomUserClaims(user.uid, { ...existing, ...desired })
      }

      stats.updated++
    }
  } while (pageToken)

  console.log('\n📊 Summary')
  console.log(`   total users:      ${stats.total}`)
  console.log(`   ${DRY_RUN ? 'would update' : 'updated'}:     ${stats.updated}`)
  console.log(`   already correct:  ${stats.alreadyCorrect}`)
  console.log(`   skipped:          ${stats.skipped}`)

  if (stats.updated > 0 && !DRY_RUN) {
    console.log('\n💡 Updated users must refresh their ID token (sign out/in) for new claims to apply.')
  }
}

backfill().catch((error) => {
  console.error('\n❌ Backfill failed:', error)
  process.exit(1)
})
