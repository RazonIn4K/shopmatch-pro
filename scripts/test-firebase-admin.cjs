#!/usr/bin/env node

/**
 * Test Firebase Admin SDK initialization
 * Helps diagnose Firebase configuration issues
 */

/* eslint-disable @typescript-eslint/no-require-imports */

require('dotenv').config({ path: '.env.local' })

const { initializeApp, cert } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

console.log('🔧 Testing Firebase Admin SDK Configuration\n')

// Check environment variables
console.log('1️⃣ Checking environment variables...')
console.log(`   FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}`)
console.log(`   FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing'}`)
console.log(`   FIREBASE_PRIVATE_KEY: ${process.env.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Missing'}`)

if (!process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PROJECT_ID) {
  console.error('\n❌ Missing required Firebase environment variables')
  process.exit(1)
}

// Test private key format
console.log('\n2️⃣ Testing private key format...')
const privateKey = process.env.FIREBASE_PRIVATE_KEY
console.log(`   Starts with BEGIN: ${privateKey.startsWith('"-----BEGIN') || privateKey.startsWith('-----BEGIN') ? '✅' : '❌'}`)
console.log(`   Contains newlines: ${privateKey.includes('\\n') ? '✅ (escaped)' : privateKey.includes('\n') ? '✅ (actual)' : '❌'}`)
console.log(`   Ends with END: ${privateKey.endsWith('-----\n"') || privateKey.endsWith('-----"') || privateKey.endsWith('-----') ? '✅' : '❌'}`)

// Test Firebase Admin initialization
console.log('\n3️⃣ Attempting Firebase Admin initialization...')
try {
  const app = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    projectId: process.env.FIREBASE_PROJECT_ID,
  })

  console.log('   ✅ Firebase Admin initialized successfully!')

  // Test Auth
  console.log('\n4️⃣ Testing Firebase Auth...')
  getAuth(app)
  console.log('   ✅ Firebase Auth initialized')

  // Test Firestore
  console.log('\n5️⃣ Testing Firestore connection...')
  const db = getFirestore(app)
  console.log('   ⏳ Attempting to read from Firestore...')

  // Try a simple read operation
  console.log('   ⏳ Attempting async Firestore test...')
  const testFirestore = async () => {
    const testRef = db.collection('_test_connection')
    try {
      await testRef.limit(1).get()
      console.log('   ✅ Firestore connection successful!')
      console.log('\n🎉 ALL TESTS PASSED! Firebase is properly configured.')
    } catch (error) {
      if (error.code === 7 && error.message.includes('SERVICE_DISABLED')) {
        console.log('   ⚠️  Firestore API is DISABLED in Firebase Console')
        console.log('\n📋 ACTION REQUIRED:')
        console.log('   1. Visit: https://console.cloud.google.com/apis/api/firestore.googleapis.com')
        console.log('   2. Select project: shopmatch-pro')
        console.log('   3. Click "Enable API"')
        console.log('   4. Wait 1-2 minutes for propagation')
        console.log('   5. Run this test again')
      } else {
        console.error('   ❌ Firestore error:', error.message)
        throw error
      }
    }
  }

  testFirestore().catch(console.error)

} catch (error) {
  console.error('\n❌ Firebase initialization failed:')
  console.error(`   Error: ${error.message}`)

  if (error.message.includes('Invalid PEM') || error.message.includes('private key')) {
    console.error('\n🔧 PRIVATE KEY ISSUE DETECTED!')
    console.error('   Your FIREBASE_PRIVATE_KEY may have formatting issues.')
    console.error('\n   Expected format in .env.local:')
    console.error('   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIE...\\n-----END PRIVATE KEY-----\\n"')
    console.error('\n   Make sure:')
    console.error('   1. The key is wrapped in double quotes')
    console.error('   2. Newlines are represented as \\n (backslash-n)')
    console.error('   3. The entire key is on one line')
  }

  process.exit(1)
}
