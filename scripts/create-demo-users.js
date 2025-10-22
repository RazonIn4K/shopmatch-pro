#!/usr/bin/env node

/**
 * Demo Users Creation Script for ShopMatch Pro
 *
 * Creates the demo users advertised on the homepage:
 * - owner@test.com / testtest123 (Employer Account)
 * - seeker@test.com / testtest123 (Job Seeker Account)
 *
 * Usage: node scripts/create-demo-users.js
 *
 * Requirements:
 * - Firebase project must be accessible
 * - Proper authentication (gcloud CLI or service account)
 * - Environment variables must be configured
 */

/* eslint-disable @typescript-eslint/no-require-imports */
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
  } catch {
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
 * Create or update a demo user
 */
async function createDemoUser(auth, db, email, password, displayName, role) {
  console.log(`\n👤 Processing user: ${email}`)

  try {
    // Check if user already exists
    let userRecord
    try {
      userRecord = await auth.getUserByEmail(email)
      console.log(`   ⚠️ User already exists with ID: ${userRecord.uid}`)

      // Update password
      await auth.updateUser(userRecord.uid, {
        password: password,
        displayName: displayName,
        emailVerified: true,
      })

      console.log('   ✅ Updated password and profile')
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // User doesn't exist, create new one
        userRecord = await auth.createUser({
          email: email,
          password: password,
          displayName: displayName,
          emailVerified: true,
        })

        console.log(`   ✅ Created new user with ID: ${userRecord.uid}`)
      } else {
        throw error
      }
    }

    // Set custom claims
    await auth.setCustomUserClaims(userRecord.uid, {
      role: role,
      subActive: true
    })

    console.log(`   ✅ Set role: ${role}`)

    // Create/update user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: email,
      displayName: displayName,
      role: role,
      subActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true })

    console.log('   ✅ Updated Firestore document')

    return userRecord
  } catch (error) {
    console.error(`   ❌ Error processing user ${email}:`, error.message)
    throw error
  }
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('🎯 ShopMatch Pro - Demo Users Creation Script')
    console.log('============================================')

    // Validate environment
    const projectId = process.env.FIREBASE_PROJECT_ID
    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID is required in .env.local')
    }

    console.log(`📋 Project ID: ${projectId}`)

    // Initialize Firebase Admin
    const app = initializeFirebaseAdmin()
    const auth = getAuth(app)
    const db = getFirestore(app)

    // Demo credentials from homepage
    const DEMO_PASSWORD = 'testtest123'
    
    const demoUsers = [
      {
        email: 'owner@test.com',
        password: DEMO_PASSWORD,
        displayName: 'Demo Employer',
        role: 'owner'
      },
      {
        email: 'seeker@test.com',
        password: DEMO_PASSWORD,
        displayName: 'Demo Job Seeker',
        role: 'seeker'
      }
    ]

    // Create all demo users
    for (const userData of demoUsers) {
      await createDemoUser(
        auth,
        db,
        userData.email,
        userData.password,
        userData.displayName,
        userData.role
      )
    }

    console.log('\n🎉 All demo users created/updated successfully!')
    console.log('=============================================')
    console.log('\n📝 Demo Credentials:')
    console.log('\n👔 Employer Account:')
    console.log('   Email: owner@test.com')
    console.log('   Password: testtest123')
    console.log('   Role: owner')
    console.log('\n👤 Job Seeker Account:')
    console.log('   Email: seeker@test.com')
    console.log('   Password: testtest123')
    console.log('   Role: seeker')
    console.log('\n✨ These credentials match the homepage at https://shopmatch-pro.vercel.app/')
    console.log('\n🧪 Run E2E tests with: npm run test:e2e')

  } catch (error) {
    console.error('\n💥 Demo users creation failed!')
    console.error('Error:', error.message)
    
    if (error.message.includes('FIREBASE_PROJECT_ID')) {
      console.log('\n🔧 Setup steps:')
      console.log('1. Copy .env.local.template to .env.local')
      console.log('2. Fill in Firebase credentials')
      console.log('3. Run: gcloud auth application-default login --project=shopmatch-pro')
    }
    
    process.exit(1)
  }
}

// Run the script
main()
