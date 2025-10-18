/**
 * Firestore Rules Test - Canonical Ownership Model
 * 
 * Tests the security model where jobs/{jobId} is the single source of truth
 * for ownership verification in applications.
 */

const { initializeTestEnvironment, assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { setDoc, getDoc, updateDoc, deleteDoc, doc } = require('firebase/firestore');

// Test data
const OWNER_UID = 'owner-123';
const SEEKER_UID = 'seeker-456';
const JOB_ID = 'job-001';
const APP_ID = 'app-001';

let testEnv;

async function setup() {
  testEnv = await initializeTestEnvironment({
    projectId: 'shopmatch-pro-test',
    firestore: {
      rules: require('fs').readFileSync('firestore.rules', 'utf8'),
      host: 'localhost',
      port: 8080
    }
  });
}

async function teardown() {
  await testEnv.cleanup();
}

// Test 1: Canonical ownership verification on read
async function testCanonicalReadVerification() {
  console.log('\n🧪 Test 1: Canonical ownership verification on read');
  
  // Setup: Create job owned by owner-123
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'jobs', JOB_ID), {
      ownerId: OWNER_UID,
      title: 'Test Job',
      status: 'published'
    });
    
    // Create application with WRONG ownerId (spoofed)
    await setDoc(doc(db, 'applications', APP_ID), {
      jobId: JOB_ID,
      seekerId: SEEKER_UID,
      ownerId: 'attacker-999',  // Spoofed ownerId
      status: 'pending'
    });
  });
  
  // Test: Attacker cannot read application even with spoofed ownerId
  const attackerDb = testEnv.authenticatedContext('attacker-999').firestore();
  const attackerRead = getDoc(doc(attackerDb, 'applications', APP_ID));
  
  try {
    await assertFails(attackerRead);
    console.log('  ✅ PASS: Attacker blocked despite spoofed ownerId');
  } catch (e) {
    console.log('  ❌ FAIL: Attacker gained access via spoofed ownerId');
    throw e;
  }
  
  // Test: Real owner can read (verified via canonical jobs doc)
  const ownerDb = testEnv.authenticatedContext(OWNER_UID, { role: 'owner' }).firestore();
  const ownerRead = getDoc(doc(ownerDb, 'applications', APP_ID));
  
  try {
    await assertSucceeds(ownerRead);
    console.log('  ✅ PASS: Real owner can read (canonical verification)');
  } catch (e) {
    console.log('  ❌ FAIL: Real owner blocked');
    throw e;
  }
}

// Test 2: Force canonical ownerId on create
async function testCanonicalCreateValidation() {
  console.log('\n🧪 Test 2: Force canonical ownerId on create');
  
  // Setup: Create job
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'jobs', JOB_ID), {
      ownerId: OWNER_UID,
      title: 'Test Job',
      status: 'published'
    });
    await setDoc(doc(db, 'users', SEEKER_UID), { role: 'seeker' });
  });
  
  // Test: Seeker tries to create application with WRONG ownerId
  const seekerDb = testEnv.authenticatedContext(SEEKER_UID, { role: 'seeker' }).firestore();
  const badCreate = setDoc(doc(seekerDb, 'applications', 'app-002'), {
    jobId: JOB_ID,
    seekerId: SEEKER_UID,
    ownerId: 'attacker-999',  // Wrong ownerId
    status: 'pending'
  });
  
  try {
    await assertFails(badCreate);
    console.log('  ✅ PASS: Creation blocked with wrong ownerId');
  } catch (e) {
    console.log('  ❌ FAIL: Creation allowed with wrong ownerId');
    throw e;
  }
  
  // Test: Seeker creates application with CORRECT canonical ownerId
  const goodCreate = setDoc(doc(seekerDb, 'applications', 'app-003'), {
    jobId: JOB_ID,
    seekerId: SEEKER_UID,
    ownerId: OWNER_UID,  // Correct canonical ownerId
    status: 'pending'
  });
  
  try {
    await assertSucceeds(goodCreate);
    console.log('  ✅ PASS: Creation allowed with canonical ownerId');
  } catch (e) {
    console.log('  ❌ FAIL: Creation blocked with correct ownerId');
    throw e;
  }
}

// Test 3: Lock immutable fields on update
async function testImmutableFieldLocking() {
  console.log('\n🧪 Test 3: Lock immutable fields on update');
  
  // Setup
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'jobs', JOB_ID), {
      ownerId: OWNER_UID,
      title: 'Test Job',
      status: 'published'
    });
    await setDoc(doc(db, 'applications', APP_ID), {
      jobId: JOB_ID,
      seekerId: SEEKER_UID,
      ownerId: OWNER_UID,
      status: 'pending'
    });
  });
  
  // Test: Owner tries to change ownerId (should fail)
  const ownerDb = testEnv.authenticatedContext(OWNER_UID, { role: 'owner' }).firestore();
  const tamperOwnerId = updateDoc(doc(ownerDb, 'applications', APP_ID), {
    jobId: JOB_ID,
    seekerId: SEEKER_UID,
    ownerId: 'attacker-999',  // Try to change ownerId
    status: 'reviewed'
  });
  
  try {
    await assertFails(tamperOwnerId);
    console.log('  ✅ PASS: ownerId change blocked');
  } catch (e) {
    console.log('  ❌ FAIL: ownerId change allowed');
    throw e;
  }
  
  // Test: Owner updates status only (should succeed)
  const legitUpdate = updateDoc(doc(ownerDb, 'applications', APP_ID), {
    jobId: JOB_ID,
    seekerId: SEEKER_UID,
    ownerId: OWNER_UID,  // Keep same
    status: 'reviewed'
  });
  
  try {
    await assertSucceeds(legitUpdate);
    console.log('  ✅ PASS: Status update allowed with locked fields');
  } catch (e) {
    console.log('  ❌ FAIL: Legitimate update blocked');
    throw e;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Firestore Rules Tests - Canonical Ownership Model\n');
  
  try {
    await setup();
    await testCanonicalReadVerification();
    await testCanonicalCreateValidation();
    await testImmutableFieldLocking();
    console.log('\n✅ All tests passed!\n');
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  } finally {
    await teardown();
  }
}

runTests();
