#!/usr/bin/env node

/**
 * End-to-End Verification Script for ShopMatch Pro MVP
 *
 * This script verifies the complete workflow:
 * 1. Create seeker and owner users
 * 2. Create a job posting
 * 3. Submit an application
 * 4. Test both dashboard views
 * 5. Update application status
 * 6. Verify data consistency
 */

/* eslint-disable @typescript-eslint/no-require-imports */

const { initializeApp, cert } = require('firebase-admin/app')
const { getAuth } = require('firebase-admin/auth')
const { getFirestore } = require('firebase-admin/firestore')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

async function verifyEndToEnd() {
  console.log('🚀 End-to-End Verification for ShopMatch Pro MVP\n')

  let testData = {
    seekerUser: null,
    ownerUser: null,
    jobRef: null,
    applicationRef: null,
  }

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

    // Step 1: Create test users
    console.log('👥 Step 1: Creating test users...')
    
    const testSeekerEmail = `test-seeker-${Date.now()}@example.com`
    const seekerUser = await auth.createUser({
      email: testSeekerEmail,
      password: 'testpassword123',
      displayName: 'Test Seeker',
    })
    await auth.setCustomUserClaims(seekerUser.uid, {
      role: 'seeker',
      subActive: true,
    })
    testData.seekerUser = seekerUser
    console.log(`   ✅ Created seeker: ${seekerUser.uid}`)

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
    testData.ownerUser = ownerUser
    console.log(`   ✅ Created owner: ${ownerUser.uid}`)

    // Step 2: Create a job posting
    console.log('\n💼 Step 2: Creating job posting...')
    const jobData = {
      title: 'Senior Full Stack Developer',
      description: 'We are looking for an experienced full stack developer to join our team. You will work on exciting projects using modern technologies.',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'full-time',
      remote: true,
      experience: 'senior',
      salary: '$120,000 - $150,000',
      requirements: [
        '5+ years of full stack development experience',
        'Proficiency in React, Node.js, and TypeScript',
        'Experience with cloud platforms (AWS/GCP)',
        'Strong problem-solving skills',
      ],
      benefits: [
        'Competitive salary and equity',
        'Comprehensive health insurance',
        'Flexible work arrangements',
        'Professional development budget',
      ],
      ownerId: ownerUser.uid,
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const jobRef = await db.collection('jobs').add(jobData)
    testData.jobRef = jobRef
    console.log(`   ✅ Created job: ${jobRef.id}`)
    console.log(`   📋 Job title: ${jobData.title}`)
    console.log(`   🏢 Company: ${jobData.company}`)

    // Step 3: Submit job application
    console.log('\n📝 Step 3: Submitting job application...')
    const applicationData = {
      jobId: jobRef.id,
      seekerId: seekerUser.uid,
      ownerId: ownerUser.uid,
      coverLetter: `Dear Hiring Manager,

I am excited to apply for the Senior Full Stack Developer position at ${jobData.company}. With my extensive experience in modern web technologies and passion for building scalable applications, I believe I would be a great fit for your team.

My background includes:
- 6+ years of full stack development experience
- Expertise in React, Node.js, and TypeScript
- Experience with cloud platforms including AWS and GCP
- Strong track record of delivering high-quality software solutions

I am particularly drawn to this role because of the opportunity to work on exciting projects and contribute to innovative solutions. I am confident that my technical skills and collaborative approach would make me a valuable addition to your team.

Thank you for considering my application. I look forward to discussing how I can contribute to your team's success.

Best regards,
Test Seeker`,
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
    testData.applicationRef = applicationRef
    console.log(`   ✅ Created application: ${applicationRef.id}`)
    console.log(`   📄 Cover letter length: ${applicationData.coverLetter.length} characters`)

    // Step 4: Test seeker dashboard query
    console.log('\n👤 Step 4: Testing seeker dashboard...')
    try {
      const seekerQuery = db.collection('applications')
        .where('seekerId', '==', seekerUser.uid)
        .orderBy('createdAt', 'desc')

      const seekerSnapshot = await seekerQuery.get()
      const seekerApplications = seekerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))

      console.log(`   ✅ Seeker query successful! Found ${seekerApplications.length} application(s)`)
      console.log(`   📊 Application status: ${seekerApplications[0]?.status}`)
      console.log(`   🎯 Job title: ${seekerApplications[0]?.jobTitle}`)
    } catch (seekerError) {
      console.error('   ❌ Seeker dashboard query failed:')
      console.error(`      Error: ${seekerError.message}`)
      
      if (seekerError.message.includes('FAILED_PRECONDITION')) {
        console.error('\n   🔧 FIREBASE INDEX REQUIRED!')
        console.error('      Please create the composite index for seeker applications.')
        console.error('      Click this link to auto-create:')
        console.error(`      ${seekerError.message.match(/https:\/\/[^\s]+/)?.[0] || 'Check Firebase Console'}`)
        console.error('\n      Or manually create:')
        console.error('      Collection: applications')
        console.error('      Fields: seekerId (Ascending), createdAt (Descending)')
      }
      throw seekerError
    }

    // Step 5: Test owner dashboard query
    console.log('\n👔 Step 5: Testing owner dashboard...')
    try {
      const ownerQuery = db.collection('applications')
        .where('ownerId', '==', ownerUser.uid)
        .orderBy('createdAt', 'desc')

      const ownerSnapshot = await ownerQuery.get()
      const ownerApplications = ownerSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))

      console.log(`   ✅ Owner query successful! Found ${ownerApplications.length} application(s)`)
      console.log(`   📊 Application status: ${ownerApplications[0]?.status}`)
      console.log(`   👤 Applicant: ${ownerApplications[0]?.seekerName}`)
    } catch (ownerError) {
      console.error('   ❌ Owner dashboard query failed:')
      console.error(`      Error: ${ownerError.message}`)
      throw ownerError
    }

    // Step 6: Update application status (simulate owner review)
    console.log('\n📋 Step 6: Updating application status...')
    const updatedApplicationData = {
      status: 'reviewed',
      notes: 'Application reviewed. Candidate shows strong technical skills and relevant experience. Scheduling interview.',
      reviewedAt: new Date(),
      updatedAt: new Date(),
    }

    await applicationRef.update(updatedApplicationData)
    console.log(`   ✅ Updated application status to: ${updatedApplicationData.status}`)
    console.log(`   📝 Added review notes: ${updatedApplicationData.notes.length} characters`)

    // Step 7: Verify data consistency
    console.log('\n🔄 Step 7: Verifying data consistency...')
    
    // Check seeker view
    const seekerQuery2 = db.collection('applications')
      .where('seekerId', '==', seekerUser.uid)
      .orderBy('createdAt', 'desc')
    const seekerSnapshot2 = await seekerQuery2.get()
    const seekerApplications2 = seekerSnapshot2.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Check owner view
    const ownerQuery2 = db.collection('applications')
      .where('ownerId', '==', ownerUser.uid)
      .orderBy('createdAt', 'desc')
    const ownerSnapshot2 = await ownerQuery2.get()
    const ownerApplications2 = ownerSnapshot2.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Verify both views show the same application with updated status
    const seekerApp = seekerApplications2[0]
    const ownerApp = ownerApplications2[0]

    if (seekerApp?.id === ownerApp?.id && 
        seekerApp?.status === 'reviewed' && 
        ownerApp?.status === 'reviewed') {
      console.log('   ✅ Data consistency verified!')
      console.log(`   📊 Both views show status: ${seekerApp.status}`)
      console.log(`   📝 Notes present: ${seekerApp.notes ? 'Yes' : 'No'}`)
    } else {
      console.error('   ❌ Data consistency issue detected!')
      console.error(`      Seeker view status: ${seekerApp?.status}`)
      console.error(`      Owner view status: ${ownerApp?.status}`)
      throw new Error('Data consistency verification failed')
    }

    // Step 8: Test final status update (accepted)
    console.log('\n🎉 Step 8: Final status update (accepted)...')
    const finalUpdateData = {
      status: 'accepted',
      notes: `${seekerApp.notes}\n\nUPDATE: Interview completed successfully. Candidate accepted for the position. Welcome to the team!`,
      updatedAt: new Date(),
    }

    await applicationRef.update(finalUpdateData)
    console.log(`   ✅ Final status update: ${finalUpdateData.status}`)
    console.log(`   🎊 Application accepted!`)

    // Final verification
    const finalQuery = db.collection('applications')
      .where('seekerId', '==', seekerUser.uid)
      .orderBy('createdAt', 'desc')
    const finalSnapshot = await finalQuery.get()
    const finalApplications = finalSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))

    console.log(`\n🏁 Final Status: ${finalApplications[0]?.status}`)
    console.log(`📈 Total applications: ${finalApplications.length}`)

    console.log('\n🎉 END-TO-END VERIFICATION COMPLETE!')
    console.log('\n✅ All workflow steps verified:')
    console.log('   ✓ User creation (seeker & owner)')
    console.log('   ✓ Job posting creation')
    console.log('   ✓ Application submission')
    console.log('   ✓ Seeker dashboard query')
    console.log('   ✓ Owner dashboard query')
    console.log('   ✓ Application status updates')
    console.log('   ✓ Data consistency verification')
    console.log('   ✓ Complete workflow from pending → reviewed → accepted')

    console.log('\n📋 Next Steps:')
    console.log('   1. If you saw any index errors, create the required Firestore indexes')
    console.log('   2. Start the dev server: npm run dev')
    console.log('   3. Test the web interface with the created test users')
    console.log('   4. Verify all dashboards load correctly')

  } catch (error) {
    console.error('\n❌ End-to-end verification failed:')
    console.error(`   Error: ${error.message}`)
    
    if (error.message.includes('PERMISSION_DENIED')) {
      console.error('\n🔧 Firebase Configuration Issue!')
      console.error('   Please check your Firebase configuration:')
      console.error('   1. Ensure Firestore API is enabled')
      console.error('   2. Verify service account credentials in .env.local')
      console.error('   3. Check Firebase project ID matches')
    }
    
    process.exit(1)
  } finally {
    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...')
    try {
      const auth = getAuth()
      const db = getFirestore()
      
      if (testData.applicationRef) {
        await db.collection('applications').doc(testData.applicationRef.id).delete()
        console.log('   ✅ Deleted test application')
      }
      
      if (testData.jobRef) {
        await db.collection('jobs').doc(testData.jobRef.id).delete()
        console.log('   ✅ Deleted test job')
      }
      
      if (testData.seekerUser) {
        await auth.deleteUser(testData.seekerUser.uid)
        console.log('   ✅ Deleted test seeker user')
      }
      
      if (testData.ownerUser) {
        await auth.deleteUser(testData.ownerUser.uid)
        console.log('   ✅ Deleted test owner user')
      }
      
      console.log('   🧹 Cleanup complete')
    } catch (cleanupError) {
      console.error('   ⚠️ Cleanup warning:', cleanupError.message)
    }
  }
}

// Run the verification
verifyEndToEnd()
