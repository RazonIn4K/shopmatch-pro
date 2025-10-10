#!/usr/bin/env node

/**
 * User Creation Script for ShopMatch Pro
 *
 * This script creates a test user with owner role for development and testing.
 * It uses Firebase Admin SDK with proper environment configuration.
 *
 * Usage: node scripts/create-user.js
 *
 * Requirements:
 * - Firebase project must be accessible
 * - Proper authentication (gcloud CLI or service account)
 * - Environment variables must be configured
 */

require('dotenv').config({ path: '.env.local' })

const { initializeApp, getApps, cert } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

/**
 * Initialize Firebase Admin SDK
 */
function initializeFirebaseAdmin() {
  // Check if already initialized
  if (getApps().length > 0) {
    return getApps()[0]
  }

  const projectId = process.env.FIREBASE_PROJECT_ID

  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID environment variable is required')
  }

  console.log(`🔥 Initializing Firebase Admin for project: ${projectId}`)

  // Try to use Application Default Credentials first (gcloud CLI)
  try {
    const app = initializeApp({
      projectId: projectId
    })
    console.log('✅ Using Application Default Credentials (gcloud CLI)')
    return app
  } catch (error) {
    console.log('⚠️ ADC failed, trying service account credentials...')

    // Fallback to service account if ADC fails
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!clientEmail || !privateKey) {
      throw new Error(
        'Neither ADC nor service account credentials available. ' +
        'Run: gcloud auth application-default login --project=shopmatch-pro'
      )
    }

    const app = initializeApp({
      credential: cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey,
      })
    })
    console.log('✅ Using service account credentials')
    return app
  }
}

/**
 * Create a test user with owner role
 */
async function createTestUser() {
  try {
    console.log('🚀 Starting user creation process...')

    // Initialize Firebase Admin
    const app = initializeFirebaseAdmin()
    const auth = getAuth(app)
    const db = getFirestore(app)

    // User details
    const email = 'owner@shopmatchpro.com'
    const password = 'OwnerPass123!'
    const displayName = 'ShopMatch Pro Owner'

    console.log(`👤 Creating user: ${email}`)

    // Check if user already exists
    try {
      const userRecord = await auth.getUserByEmail(email)
      console.log(`⚠️ User already exists with ID: ${userRecord.uid}`)

      // Update existing user with owner role
      await auth.setCustomUserClaims(userRecord.uid, {
        role: 'owner',
        subActive: true
      })

      // Update user document
      await db.collection('users').doc(userRecord.uid).set({
        email: email,
        displayName: displayName,
        role: 'owner',
        subActive: true,
        updatedAt: new Date(),
      }, { merge: true })

      console.log('✅ Updated existing user with owner role')
      return userRecord
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // User doesn't exist, create new one
        const userRecord = await auth.createUser({
          email: email,
          password: password,
          displayName: displayName,
          emailVerified: true, // For development ease
        })

        // Set custom claims for owner role
        await auth.setCustomUserClaims(userRecord.uid, {
          role: 'owner',
          subActive: true
        })

        // Create user document in Firestore
        await db.collection('users').doc(userRecord.uid).set({
          uid: userRecord.uid,
          email: email,
          displayName: displayName,
          role: 'owner',
          subActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        console.log(`✅ Created new user with ID: ${userRecord.uid}`)
        return userRecord
      }
      throw error
    }

  } catch (error) {
    console.error('❌ Error creating user:', error.message)
    console.error('Full error:', error)

    if (error.message.includes('auth/configuration-not-found')) {
      console.log('\n🔧 Troubleshooting steps:')
      console.log('1. Run: gcloud auth application-default login --project=shopmatch-pro')
      console.log('2. Or add service account credentials to .env.local')
      console.log('3. Verify Firebase project permissions')
    }

    throw error
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🎯 ShopMatch Pro - User Creation Script')
    console.log('=====================================')

    // Validate environment
    const projectId = process.env.FIREBASE_PROJECT_ID
    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID is required in .env.local')
    }

    console.log(`📋 Project ID: ${projectId}`)

    // Create test user
    const user = await createTestUser()

    console.log('\n🎉 User creation successful!')
    console.log('==========================')
    console.log(`👤 Email: ${user.email}`)
    console.log(`🆔 UID: ${user.uid}`)
    console.log(`👑 Role: owner`)
    console.log(`💳 Subscription: active`)
    console.log('\n🔐 You can now sign in with:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Password: OwnerPass123!`)

  } catch (error) {
    console.error('\n💥 User creation failed!')
    process.exit(1)
  }
}

// Run the script
main()