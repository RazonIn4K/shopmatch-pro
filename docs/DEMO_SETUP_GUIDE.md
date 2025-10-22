# Demo Setup Guide

This guide will help you set up a fully functional demo for https://shopmatch-pro.vercel.app/

## Quick Start (5 minutes)

```bash
# 1. Create demo user accounts
npm run create-demo-users

# 2. Seed sample job data
npm run seed-demo-data

# 3. Verify everything works
BASE_URL=https://shopmatch-pro.vercel.app npm run test:e2e
```

## Prerequisites

Before running the setup scripts, ensure you have:

1. **Firebase Admin Credentials**
   - `FIREBASE_PROJECT_ID` in `.env.local`
   - `FIREBASE_CLIENT_EMAIL` in `.env.local`
   - `FIREBASE_PRIVATE_KEY` in `.env.local`

2. **Authentication Set Up**
   - Either: Run `gcloud auth application-default login`
   - Or: Have service account credentials configured

3. **Vercel Environment Variables** (for production)
   - Same Firebase Admin credentials must be set in Vercel dashboard
   - Go to: Project Settings → Environment Variables

## Step-by-Step Setup

### Step 1: Create Demo User Accounts

This creates the two demo accounts advertised on the homepage:

```bash
npm run create-demo-users
```

**What this does:**
- Creates `owner@test.com` with password `testtest123` (Employer role)
- Creates `seeker@test.com` with password `testtest123` (Job Seeker role)
- Sets both accounts as active with subscription status
- Adds user documents to Firestore

**Expected output:**
```
🎯 ShopMatch Pro - Demo Users Creation Script
============================================
📋 Project ID: shopmatch-pro

👤 Processing user: owner@test.com
   ✅ Created new user with ID: abc123...
   ✅ Set role: owner
   ✅ Updated Firestore document

👤 Processing user: seeker@test.com
   ✅ Created new user with ID: xyz789...
   ✅ Set role: seeker
   ✅ Updated Firestore document

🎉 All demo users created/updated successfully!
```

### Step 2: Seed Demo Data

This populates the database with sample jobs and applications:

```bash
npm run seed-demo-data
```

**What this does:**
- Creates 6 sample jobs (various types, locations, experience levels)
- Creates 3 sample job applications from the seeker account
- Sets realistic view and application counts
- All jobs are published and ready to browse

**Expected output:**
```
🎯 ShopMatch Pro - Demo Data Seeding Script
==========================================
📋 Looking up demo owner account...
✅ Found owner: abc123...

🏢 Creating sample jobs...
   ✅ Created: Senior React Developer (job1)
   ✅ Created: Full Stack Engineer (job2)
   ✅ Created: Frontend Developer (job3)
   ✅ Created: Junior Web Developer (job4)
   ✅ Created: DevOps Engineer (job5)
   ✅ Created: UI/UX Designer & Developer (job6)

👤 Looking up demo seeker account...
✅ Found seeker: xyz789...

📨 Creating sample applications...
   ✅ Applied to job 1 (status: pending)
   ✅ Applied to job 2 (status: reviewing)
   ✅ Applied to job 3 (status: accepted)

🎉 Demo data seeded successfully!
📊 Created 6 sample jobs
📨 Created 3 sample applications
```

### Step 3: Verify Setup

Run the E2E test suite to verify everything works:

```bash
# Test against production
BASE_URL=https://shopmatch-pro.vercel.app npm run test:e2e

# Or test specific flows
BASE_URL=https://shopmatch-pro.vercel.app npx playwright test demo-flows.spec.ts
```

**All tests should pass:**
```
✅ Login with employer credentials
✅ Login with job seeker credentials  
✅ Browse jobs page displays jobs
✅ Can view job details
✅ Dashboard loads for both roles
✅ Accessibility checks pass
```

## Troubleshooting

### Issue: "FIREBASE_PROJECT_ID is required"

**Solution:** Create `.env.local` file with Firebase credentials:

```bash
# Copy template
cp .env.local.template .env.local

# Edit and add your Firebase credentials
```

### Issue: "Neither ADC nor service account credentials available"

**Solution:** Run gcloud authentication:

```bash
gcloud auth application-default login --project=shopmatch-pro
```

Or add service account credentials to `.env.local`:
```
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@shopmatch-pro.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### Issue: "Demo owner account not found"

**Solution:** Run the user creation script first:

```bash
npm run create-demo-users
```

### Issue: Jobs API returns 500 error

**Cause:** Firebase Admin credentials not set on Vercel

**Solution:**
1. Go to Vercel Dashboard → shopmatch-pro → Settings → Environment Variables
2. Add these variables (get from Firebase Console → Project Settings → Service Accounts):
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
3. Redeploy the application

### Issue: Login fails with "invalid-credential"

**Cause:** Demo users don't exist in Firebase

**Solution:** Run setup script:
```bash
npm run create-demo-users
```

## Verifying on Production

After setup, manually test these flows on https://shopmatch-pro.vercel.app/:

### Test Employer Account
1. Go to https://shopmatch-pro.vercel.app/login
2. Login with `owner@test.com` / `testtest123`
3. Should redirect to dashboard
4. Should see posted jobs
5. Click on a job to view applications

### Test Job Seeker Account
1. Logout (if logged in)
2. Login with `seeker@test.com` / `testtest123`
3. Should redirect to dashboard
4. Should see applied jobs
5. Go to Browse Jobs
6. Should see 6 sample jobs
7. Click on a job to view details

### Test Public Browsing
1. Logout (if logged in)
2. Go to https://shopmatch-pro.vercel.app/jobs
3. Should see 6 sample jobs (no login required)
4. Click on a job to view details

## Resetting Demo Data

To reset the demo to a clean state:

```bash
# Clear existing data and recreate
npm run seed-demo-data

# This automatically clears old jobs and creates fresh ones
```

## Maintenance

### Weekly Checks
- Run E2E tests: `BASE_URL=https://shopmatch-pro.vercel.app npm run test:e2e`
- Verify demo credentials still work
- Check that jobs are visible

### Monthly Tasks
- Refresh demo data: `npm run seed-demo-data`
- Update job expiration dates if needed
- Clear excess applications

### When Deploying Changes
1. Run local tests: `npm run test:e2e`
2. Deploy to Vercel
3. Run production tests: `BASE_URL=https://shopmatch-pro.vercel.app npm run test:e2e`
4. Manually verify key flows

## Scripts Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `npm run create-demo-users` | Create/update demo accounts | Initial setup, after credential issues |
| `npm run seed-demo-data` | Populate sample jobs | Initial setup, monthly refresh |
| `npm run test:e2e` | Run all E2E tests | After changes, verification |
| `npm run test:e2e:headed` | Debug tests in browser | Troubleshooting |
| `BASE_URL=X npm run test:e2e` | Test specific environment | Production verification |

## Next Steps

After setup is complete:

1. ✅ Verify all tests pass
2. ✅ Test manual user flows on production
3. ✅ Add demo health check monitoring
4. ✅ Document for stakeholders
5. ✅ Set up automated weekly verification

## Support

If you encounter issues:

1. Check logs: `scripts/*.js` output
2. Review Firebase Console for user/data state
3. Check Vercel logs for API errors
4. Run diagnostics: `npx playwright test demo-diagnostics.spec.ts`
5. Review detailed report: `docs/DEMO_ISSUES_REPORT.md`
