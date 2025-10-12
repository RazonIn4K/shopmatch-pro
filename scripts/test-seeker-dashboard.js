#!/usr/bin/env node

/**
 * Test script to verify seeker dashboard functionality
 * 
 * This script tests the seeker applications API endpoint to ensure
 * the Firestore index issue has been resolved.
 */

const { initializeApp, cert } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function testSeekerDashboard() {
  console.log('🧪 Testing Seeker Dashboard Functionality...\n')

  try {
    // Initialize Firebase Admin
    const app = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_PROJECT_ID,
    })

    const auth = getAuth(app)
    const db = getFirestore(app)

    // Test 1: Create a test seeker user
    console.log('1️⃣ Creating test seeker user...')
    const testSeekerEmail = `test-seeker-${Date.now()}@example.com`
    const seekerUser = await auth.createUser({
      email: testSeekerEmail,
      password: 'testpassword123',
      displayName: 'Test Seeker',
    })

    // Set custom claims
    await auth.setCustomUserClaims(seekerUser.uid, {
      role: 'seeker',
      subActive: true,
    })

    console.log(`✅ Created seeker user: ${seekerUser.uid}`)

    // Test 2: Create a test owner user
    console.log('\n2️⃣ Creating test owner user...')
    const testOwnerEmail = `test-owner-${Date.now()}@example.com`
    const ownerUser = await auth.createUser({
      email: testOwnerEmail,
      password: 'testpassword123',
      displayName: 'Test Owner',
    })

    await auth.setCustomUserClaims(ownerUser.uid, {
      role: 'owner',
      subActive: true,
    })

    console.log(`✅ Created owner user: ${ownerUser.uid}`)

    // Test 3: Create a test job
    console.log('\n3️⃣ Creating test job...')
    const jobData = {
      title: 'Test Developer Position',
      description: 'A test job for seeker dashboard testing',
      company: 'Test Company',
      location: 'Test City, Test State',
      type: 'full-time',
      remote: false,
      experience: 'mid',
      salary: '$80,000 - $100,000',
      ownerId: ownerUser.uid,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const jobRef = await db.collection('jobs').add(jobData)
    console.log(`✅ Created test job: ${jobRef.id}`)

    // Test 4: Create a test application
    console.log('\n4️⃣ Creating test application...')
    const applicationData = {
      jobId: jobRef.id,
      seekerId: seekerUser.uid,
      ownerId: ownerUser.uid,
      coverLetter: 'This is a test application for dashboard testing.',
      jobTitle: jobData.title,
      company: jobData.company,
      jobType: jobData.type,
      seekerName: 'Test Seeker',
      seekerEmail: testSeekerEmail,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const applicationRef = await db.collection('applications').add(applicationData)
    console.log(`✅ Created test application: ${applicationRef.id}`)

    // Test 5: Test the seeker applications query (this is the critical test)
    console.log('\n5️⃣ Testing seeker applications query...')
    try {
      const applicationsRef = db.collection('applications')
      const query = applicationsRef
        .where('seekerId', '==', seekerUser.uid)
        .orderBy('createdAt', 'desc')

      const snapshot = await query.get()
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))

      console.log(`✅ Query successful! Found ${applications.length} application(s)`)
      console.log(`   Application ID: ${applications[0]?.id}`)
      console.log(`   Status: ${applications[0]?.status}`)
      console.log(`   Job Title: ${applications[0]?.jobTitle}`)

    } catch (queryError) {
      console.error('❌ Seeker applications query failed:')
      console.error(`   Error: ${queryError.message}`)
      
      if (queryError.message.includes('FAILED_PRECONDITION')) {
        console.error('\n🔧 Index Issue Detected!')
        console.error('   The query requires a composite index.')
        console.error('   Please create the following index in Firebase Console:')
        console.error('   Collection: applications')
        console.error('   Fields: seekerId (Ascending), createdAt (Descending)')
        console.error('\n   Or click the link provided in the error message to auto-create it.')
      }
      
      throw queryError
    }

    // Test 6: Test the owner applications query
    console.log('\n6️⃣ Testing owner applications query...')
    try {
      const applicationsRef = db.collection('applications')
      const query = applicationsRef
        .where('ownerId', '==', ownerUser.uid)
        .orderBy('createdAt', 'desc')

      const snapshot = await query.get()
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))

      console.log(`✅ Owner query successful! Found ${applications.length} application(s)`)
    } catch (queryError) {
      console.error('❌ Owner applications query failed:')
      console.error(`   Error: ${queryError.message}`)
      throw queryError
    }

    // Test 7: Cleanup test data
    console.log('\n7️⃣ Cleaning up test data...')
    await db.collection('applications').doc(applicationRef.id).delete()
    await db.collection('jobs').doc(jobRef.id).delete()
    await auth.deleteUser(seekerUser.uid)
    await auth.deleteUser(ownerUser.uid)
    console.log('✅ Test data cleaned up')

    console.log('\n🎉 All tests passed! Seeker dashboard should work correctly.')
    console.log('\n📋 Next steps:')
    console.log('   1. Start the dev server: npm run dev')
    console.log('   2. Navigate to /dashboard/seeker')
    console.log('   3. Log in with a seeker account')
    console.log('   4. Verify applications load without errors')

  } catch (error) {
    console.error('\n❌ Test failed:')
    console.error(`   Error: ${error.message}`)
    
    if (error.message.includes('PERMISSION_DENIED')) {
      console.error('\n🔧 Firebase Configuration Issue!')
      console.error('   Please check your Firebase configuration:')
      console.error('   1. Ensure Firestore API is enabled')
      console.error('   2. Verify service account credentials in .env.local')
      console.error('   3. Check Firebase project ID matches')
    }
    
    process.exit(1)
  }
}

// Run the test
testSeekerDashboard()
