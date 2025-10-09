#!/usr/bin/env node

/**
 * Environment Variables Validation Script for ShopMatch Pro
 *
 * This script performs comprehensive validation of all required environment variables
 * before application startup. It ensures proper configuration of Firebase, Stripe,
 * and application settings to prevent runtime errors and security issues.
 *
 * Purpose:
 * - Pre-deployment configuration validation
 * - Development environment setup verification
 * - Production deployment safety checks
 * - Documentation of required environment variables
 *
 * Usage:
 *   node scripts/validate-env.js
 *   npm run validate-env
 *
 * Exit Codes:
 * - 0: All validations pass
 * - 1: Missing required variables or configuration errors
 *
 * Security Features:
 * - Validates variable presence without exposing values
 * - Checks for common configuration mistakes
 * - Provides actionable error messages with setup instructions
 * - Warns about potentially incorrect placeholder values
 */

const requiredEnvVars = {
  // Firebase Client Configuration (Browser-safe variables)
  'NEXT_PUBLIC_FIREBASE_API_KEY': 'Firebase API Key (Public)',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': 'Firebase Authentication Domain (Public)',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': 'Firebase Project Identifier (Public)',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': 'Firebase Storage Bucket (Public)',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': 'Firebase Cloud Messaging Sender ID (Public)',
  'NEXT_PUBLIC_FIREBASE_APP_ID': 'Firebase Application ID (Public)',

  // Firebase Admin Configuration (Server-side only)
  'FIREBASE_PROJECT_ID': 'Firebase Project ID (Admin)',
  'FIREBASE_CLIENT_EMAIL': 'Firebase Service Account Email',
  'FIREBASE_PRIVATE_KEY': 'Firebase Service Account Private Key',

  // Stripe Payment Configuration
  'STRIPE_SECRET_KEY': 'Stripe Secret API Key',
  'STRIPE_WEBHOOK_SECRET': 'Stripe Webhook Signature Secret',
  'STRIPE_PRICE_ID_PRO': 'Stripe Pro Subscription Price ID',

  // Application Configuration
  'NEXT_PUBLIC_APP_URL': 'Application Base URL',
}

const warnings = []
const errors = []

console.log('🔍 Validating environment variables...\n')

// Check for missing required variables
Object.entries(requiredEnvVars).forEach(([key, description]) => {
  if (!process.env[key]) {
    errors.push(`❌ Missing required environment variable: ${key} (${description})`)
  } else if (process.env[key] === `your_${key.toLowerCase()}_here` || process.env[key].includes('your_')) {
    warnings.push(`⚠️  Placeholder value detected for: ${key} (${description})`)
  }
})

// Validate Firebase configuration format
if (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && !process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN.includes('.firebaseapp.com')) {
  warnings.push('⚠️  Firebase Auth Domain should end with .firebaseapp.com')
}

if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL === 'http://localhost:3000' && process.env.NODE_ENV === 'production') {
  errors.push('❌ NEXT_PUBLIC_APP_URL is set to localhost in production environment')
}

// Display results
console.log('📋 Validation Results:\n')

if (errors.length > 0) {
  console.log('❌ ERRORS (must fix before running):')
  errors.forEach(error => console.log(`   ${error}`))
  console.log('')
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS (should review):')
  warnings.forEach(warning => console.log(`   ${warning}`))
  console.log('')
}

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ All environment variables are properly configured!')
} else if (errors.length === 0) {
  console.log('✅ All required environment variables are present, but please review warnings above.')
}

// Exit with error code if there are missing required variables
if (errors.length > 0) {
  console.log('\n💡 To fix:')
  console.log('   1. Copy .env.local.template to .env.local')
  console.log('   2. Fill in all required values from your Firebase and Stripe dashboards')
  console.log('   3. Run this script again: node scripts/validate-env.js')
  process.exit(1)
}

console.log('\n🎉 Environment validation complete!')