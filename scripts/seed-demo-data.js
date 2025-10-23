#!/usr/bin/env node

/**
 * Seed Demo Data Script for ShopMatch Pro
 *
 * Creates sample jobs and applications for demo purposes
 * 
 * Usage: node scripts/seed-demo-data.js
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
  if (getApps().length > 0) {
    return getApps()[0]
  }

  const projectId = process.env.FIREBASE_PROJECT_ID
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID environment variable is required')
  }

  console.log(`🔥 Initializing Firebase Admin for project: ${projectId}`)

  try {
    const app = initializeApp({ projectId: projectId })
    console.log('✅ Using Application Default Credentials')
    return app
  } catch {
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (!clientEmail || !privateKey) {
      throw new Error('Neither ADC nor service account credentials available')
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
 * Sample job data
 */
function getSampleJobs(ownerUid) {
  const now = new Date()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  return [
    {
      title: 'Senior React Developer',
      company: 'TechCorp Solutions',
      type: 'full-time',
      location: 'San Francisco, CA',
      remote: true,
      salary: '$120,000 - $180,000',
      experience: 'senior',
      description: 'Join our team building cutting-edge web applications with React, TypeScript, and Node.js. We\'re looking for an experienced developer who can lead technical initiatives and mentor junior developers.',
      requirements: ['5+ years of React experience', 'Strong TypeScript skills', 'Experience with Node.js and GraphQL', 'Leadership abilities'],
      status: 'published',
      ownerId: ownerUid,
      viewCount: 45,
      applicationCount: 8,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      expiresAt: expiresAt,
    },
    {
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      type: 'full-time',
      location: 'Remote',
      remote: true,
      salary: '$90,000 - $140,000',
      experience: 'mid',
      description: 'Fast-growing startup seeking a versatile full stack engineer to help build our SaaS platform. You\'ll work across the entire stack with modern technologies.',
      requirements: ['3+ years full stack development', 'React and Node.js', 'PostgreSQL or similar', 'Cloud deployment experience'],
      status: 'published',
      ownerId: ownerUid,
      viewCount: 67,
      applicationCount: 12,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      expiresAt: expiresAt,
    },
    {
      title: 'Frontend Developer',
      company: 'Design Studio Pro',
      type: 'contract',
      location: 'New York, NY',
      remote: false,
      salary: '$80 - $120/hour',
      experience: 'mid',
      description: 'Creative agency looking for a talented frontend developer to join us for a 6-month contract. Work on exciting projects for major brands.',
      requirements: ['Strong HTML/CSS/JavaScript', 'React or Vue.js', 'Eye for design', 'Animation experience a plus'],
      status: 'published',
      ownerId: ownerUid,
      viewCount: 34,
      applicationCount: 5,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      expiresAt: expiresAt,
    },
    {
      title: 'Junior Web Developer',
      company: 'Learning Labs',
      type: 'full-time',
      location: 'Austin, TX',
      remote: true,
      salary: '$55,000 - $75,000',
      experience: 'entry',
      description: 'Great opportunity for recent graduates or bootcamp graduates to start their career. We provide mentorship and training in modern web development.',
      requirements: ['Basic JavaScript knowledge', 'HTML/CSS fundamentals', 'Eagerness to learn', 'Portfolio of projects'],
      status: 'published',
      ownerId: ownerUid,
      viewCount: 89,
      applicationCount: 23,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      expiresAt: expiresAt,
    },
    {
      title: 'DevOps Engineer',
      company: 'Cloud Services Inc',
      type: 'full-time',
      location: 'Seattle, WA',
      remote: true,
      salary: '$110,000 - $160,000',
      experience: 'senior',
      description: 'Infrastructure team is expanding! Help us build and maintain our cloud infrastructure on AWS. Experience with Kubernetes and CI/CD pipelines essential.',
      requirements: ['AWS or GCP experience', 'Kubernetes administration', 'Terraform or similar IaC', 'CI/CD pipeline design'],
      status: 'published',
      ownerId: ownerUid,
      viewCount: 56,
      applicationCount: 14,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      expiresAt: expiresAt,
    },
    {
      title: 'UI/UX Designer & Developer',
      company: 'Creative Digital',
      type: 'part-time',
      location: 'Los Angeles, CA',
      remote: true,
      salary: '$40 - $60/hour',
      experience: 'mid',
      description: 'Hybrid role combining design and frontend development. Perfect for someone who loves both crafting beautiful interfaces and building them.',
      requirements: ['Figma/Sketch proficiency', 'HTML/CSS expertise', 'JavaScript basics', 'Design portfolio'],
      status: 'published',
      ownerId: ownerUid,
      viewCount: 42,
      applicationCount: 7,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      expiresAt: expiresAt,
    },
  ]
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🎯 ShopMatch Pro - Demo Data Seeding Script')
    console.log('==========================================')

    // Initialize Firebase
    const app = initializeFirebaseAdmin()
    const auth = getAuth(app)
    const db = getFirestore(app)

    // Get owner user
    console.log('\n📋 Looking up demo owner account...')
    let ownerRecord
    try {
      ownerRecord = await auth.getUserByEmail('owner@test.com')
      console.log(`✅ Found owner: ${ownerRecord.uid}`)
    } catch (error) {
      console.error('❌ Demo owner account not found!')
      console.error('   Please run: npm run create-demo-users')
      console.error('   Details:', error instanceof Error ? error.message : error)
      process.exit(1)
    }

    // Check if jobs already exist
    console.log('\n📝 Checking existing jobs...')
    const existingJobs = await db.collection('jobs')
      .where('ownerId', '==', ownerRecord.uid)
      .get()

    if (existingJobs.size > 0) {
      console.log(`⚠️  Found ${existingJobs.size} existing jobs for this owner`)
      console.log('   Delete them first? (y/N)')
      
      // For automation, we'll clear them automatically
      console.log('   Clearing existing demo jobs...')
      const batch = db.batch()
      existingJobs.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
      await batch.commit()
      console.log('   ✅ Cleared existing jobs')
    }

    // Create sample jobs
    console.log('\n🏢 Creating sample jobs...')
    const sampleJobs = getSampleJobs(ownerRecord.uid)
    const jobIds = []

    for (const jobData of sampleJobs) {
      const docRef = await db.collection('jobs').add(jobData)
      jobIds.push(docRef.id)
      console.log(`   ✅ Created: ${jobData.title} (${docRef.id})`)
    }

    // Get seeker user (optional - for applications)
    console.log('\n👤 Looking up demo seeker account...')
    let seekerRecord
    try {
      seekerRecord = await auth.getUserByEmail('seeker@test.com')
      console.log(`✅ Found seeker: ${seekerRecord.uid}`)

      // Create sample applications
      console.log('\n📨 Creating sample applications...')
      
      // Apply to first 3 jobs
      for (let i = 0; i < Math.min(3, jobIds.length); i++) {
        const applicationData = {
          jobId: jobIds[i],
          seekerId: seekerRecord.uid,
          status: i === 0 ? 'pending' : i === 1 ? 'reviewing' : 'accepted',
          coverLetter: 'I am very interested in this position and believe my skills would be a great match for your team.',
          resume: 'https://example.com/resume.pdf',
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await db.collection('applications').add(applicationData)
        console.log(`   ✅ Applied to job ${i + 1} (status: ${applicationData.status})`)
      }
    } catch (error) {
      console.log('⚠️  Seeker account not found - skipping applications')
      console.log('   Run: npm run create-demo-users to create seeker account')
      console.log('   Details:', error instanceof Error ? error.message : error)
    }

    console.log('\n🎉 Demo data seeded successfully!')
    console.log('===============================')
    console.log(`📊 Created ${sampleJobs.length} sample jobs`)
    if (seekerRecord) {
      console.log(`📨 Created 3 sample applications`)
    }
    console.log('\n✨ Demo is ready!')
    console.log('Visit: https://shopmatch-pro.vercel.app/jobs')

  } catch (error) {
    console.error('\n💥 Seeding failed!')
    console.error('Error:', error.message)
    process.exit(1)
  }
}

main()
