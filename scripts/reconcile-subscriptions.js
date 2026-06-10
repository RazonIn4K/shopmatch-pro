#!/usr/bin/env node

/**
 * Subscription Reconciliation Script for ShopMatch Pro
 *
 * Stripe webhooks keep subscription entitlements (users/{uid}.subActive and
 * the subActive custom claim) in sync with Stripe. If a webhook was missed
 * or its processing failed, a paying customer can lose access — or a lapsed
 * one keep it — silently. This script detects and repairs that drift.
 *
 * For every user with a stripeCustomerId this script:
 * - Lists their subscriptions from Stripe
 * - Derives the expected subActive using the same status definition as the
 *   webhook handler (only status === 'active' grants access)
 * - Compares against the users/{uid} document and the Auth custom claims
 * - Reports mismatches, and fixes both unless --dry-run
 *
 * Usage:
 *   node scripts/reconcile-subscriptions.js            # apply fixes
 *   node scripts/reconcile-subscriptions.js --dry-run  # report only, change nothing
 *
 * Requirements:
 * - Proper authentication (gcloud CLI or service account)
 * - Environment variables configured (.env.local), including STRIPE_SECRET_KEY
 *
 * Note: Fixed users must refresh their ID token (sign out/in, or
 * user.getIdToken(true)) before new claims take effect client-side.
 */

/* eslint-disable @typescript-eslint/no-require-imports */
require('dotenv').config({ path: '.env.local' })

const { initializeApp, getApps, cert } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')
const Stripe = require('stripe')

const DRY_RUN = process.argv.includes('--dry-run')

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
 * Expected subActive for a Stripe customer. Mirrors handleSubscriptionUpdate
 * in src/app/api/stripe/webhook/route.ts: only a subscription with
 * status === 'active' grants access.
 */
async function expectedSubActiveFor(stripe, customerId) {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    limit: 10,
  })

  return subscriptions.data.some((subscription) => subscription.status === 'active')
}

async function reconcile() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY environment variable is required')
  }

  const app = initializeFirebaseAdmin()
  const auth = getAuth(app)
  const db = getFirestore(app)
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  console.log(`\n${DRY_RUN ? '🔍 DRY RUN — no changes will be made' : '🚀 Reconciling subscription entitlements'}\n`)

  // No index supports a stripeCustomerId != null query (see
  // firestore.indexes.json), so fetch all users and filter in memory
  console.log('📥 Fetching all users and filtering for stripeCustomerId in memory (no != index)')
  const snapshot = await db.collection('users').get()
  const usersWithCustomer = snapshot.docs.filter((doc) => doc.data().stripeCustomerId)

  console.log(`   ${snapshot.size} users total, ${usersWithCustomer.length} with a stripeCustomerId\n`)

  const stats = { checked: 0, inSync: 0, fixed: 0, errors: 0 }

  for (const userDoc of usersWithCustomer) {
    const uid = userDoc.id
    const data = userDoc.data()
    stats.checked++

    try {
      const expected = await expectedSubActiveFor(stripe, data.stripeCustomerId)

      const userRecord = await auth.getUser(uid)
      const existingClaims = userRecord.customClaims || {}

      const docActive = data.subActive === true
      const claimActive = existingClaims.subActive === true

      if (docActive === expected && claimActive === expected) {
        stats.inSync++
        continue
      }

      console.log(
        `   ${DRY_RUN ? 'would fix' : 'fixing'} ${data.email || uid} (${data.stripeCustomerId}): ` +
        `expected subActive ${expected}, doc ${docActive}, claims ${claimActive}`
      )

      if (!DRY_RUN) {
        await userDoc.ref.update({
          subActive: expected,
          updatedAt: new Date(),
        })

        // Preserve unrelated existing claims
        await auth.setCustomUserClaims(uid, { ...existingClaims, subActive: expected })
      }

      stats.fixed++
    } catch (error) {
      stats.errors++
      console.error(`   ❌ ${data.email || uid}:`, error.message || error)
    }
  }

  console.log('\n📊 Summary')
  console.log(`   checked:    ${stats.checked}`)
  console.log(`   in sync:    ${stats.inSync}`)
  console.log(`   ${DRY_RUN ? 'would fix' : 'fixed'}:  ${stats.fixed}`)
  console.log(`   errors:     ${stats.errors}`)

  if (stats.fixed > 0 && !DRY_RUN) {
    console.log('\n💡 Fixed users must refresh their ID token (sign out/in) for new claims to apply.')
  }
}

reconcile().catch((error) => {
  console.error('\n❌ Reconciliation failed:', error)
  process.exit(1)
})
