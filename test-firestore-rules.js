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

function getFirestoreEmulatorHost() {
  const hostPort = process.env.FIRESTORE_EMULATOR_HOST || '';
  const [host, port] = hostPort.split(':');

  return {
    host: host || 'localhost',
    port: Number(port || process.env.FIRESTORE_EMULATOR_PORT || 8085),
  };
}

async function setup() {
  const emulator = getFirestoreEmulatorHost();

  testEnv = await initializeTestEnvironment({
    projectId: 'shopmatch-pro-test',
    firestore: {
      rules: require('fs').readFileSync('firestore.rules', 'utf8'),
      host: emulator.host,
      port: emulator.port
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

// Test 4: Users are self-only readable
async function testUsersSelfOnlyRead() {
  console.log('\n🧪 Test 4: Users are self-only readable');

  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'users', OWNER_UID), { uid: OWNER_UID, role: 'owner', subActive: false });
    await setDoc(doc(db, 'users', SEEKER_UID), { uid: SEEKER_UID, role: 'seeker', subActive: false });
  });

  const seekerDb = testEnv.authenticatedContext(SEEKER_UID, { role: 'seeker' }).firestore();

  try {
    await assertFails(getDoc(doc(seekerDb, 'users', OWNER_UID)));
    console.log('  ✅ PASS: Cannot read another user\'s document');
  } catch (e) {
    console.log('  ❌ FAIL: Read another user\'s document');
    throw e;
  }

  try {
    await assertSucceeds(getDoc(doc(seekerDb, 'users', SEEKER_UID)));
    console.log('  ✅ PASS: Can read own document');
  } catch (e) {
    console.log('  ❌ FAIL: Blocked from own document');
    throw e;
  }
}

// Test 5: Billing/entitlement fields locked from client writes
async function testUsersBillingFieldsLocked() {
  console.log('\n🧪 Test 5: Billing/entitlement fields locked from client writes');

  const NEW_UID = 'newuser-1';
  const newUserDb = testEnv.authenticatedContext(NEW_UID).firestore();

  // Cannot self-grant a subscription at signup
  const badCreate = setDoc(doc(newUserDb, 'users', NEW_UID), {
    uid: NEW_UID,
    role: 'seeker',
    subActive: true,  // Self-granted subscription
  });

  try {
    await assertFails(badCreate);
    console.log('  ✅ PASS: Create with subActive=true blocked');
  } catch (e) {
    console.log('  ❌ FAIL: Create with subActive=true allowed');
    throw e;
  }

  // Normal signup shape succeeds
  const goodCreate = setDoc(doc(newUserDb, 'users', NEW_UID), {
    uid: NEW_UID,
    email: 'new@test.com',
    displayName: 'New User',
    role: 'seeker',
    subActive: false,
  });

  try {
    await assertSucceeds(goodCreate);
    console.log('  ✅ PASS: Normal signup create allowed');
  } catch (e) {
    console.log('  ❌ FAIL: Normal signup create blocked');
    throw e;
  }

  // Cannot flip subscription on update
  try {
    await assertFails(updateDoc(doc(newUserDb, 'users', NEW_UID), { subActive: true }));
    console.log('  ✅ PASS: Update flipping subActive blocked');
  } catch (e) {
    console.log('  ❌ FAIL: Update flipping subActive allowed');
    throw e;
  }

  // Profile-safe update succeeds
  try {
    await assertSucceeds(updateDoc(doc(newUserDb, 'users', NEW_UID), { displayName: 'Renamed' }));
    console.log('  ✅ PASS: Profile-safe update allowed');
  } catch (e) {
    console.log('  ❌ FAIL: Profile-safe update blocked');
    throw e;
  }
}

// Test 6: Applications only for published jobs
async function testApplicationRequiresPublishedJob() {
  console.log('\n🧪 Test 6: Applications only for published jobs');

  const DRAFT_JOB_ID = 'job-draft';
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'jobs', DRAFT_JOB_ID), {
      ownerId: OWNER_UID,
      title: 'Draft Job',
      status: 'draft'
    });
  });

  const seekerDb = testEnv.authenticatedContext(SEEKER_UID, { role: 'seeker' }).firestore();
  const draftApply = setDoc(doc(seekerDb, 'applications', 'app-draft'), {
    jobId: DRAFT_JOB_ID,
    seekerId: SEEKER_UID,
    ownerId: OWNER_UID,  // Canonical, but job is not published
    status: 'pending'
  });

  try {
    await assertFails(draftApply);
    console.log('  ✅ PASS: Application to draft job blocked');
  } catch (e) {
    console.log('  ❌ FAIL: Application to draft job allowed');
    throw e;
  }
}

// Test 7: Seekers cannot review their own applications
async function testSeekerCannotUpdateStatus() {
  console.log('\n🧪 Test 7: Seekers cannot review their own applications');

  const APP7_ID = 'app-007';
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, 'jobs', JOB_ID), {
      ownerId: OWNER_UID,
      title: 'Test Job',
      status: 'published'
    });
    await setDoc(doc(db, 'applications', APP7_ID), {
      jobId: JOB_ID,
      seekerId: SEEKER_UID,
      ownerId: OWNER_UID,
      status: 'pending'
    });
  });

  const seekerDb = testEnv.authenticatedContext(SEEKER_UID, { role: 'seeker' }).firestore();

  try {
    await assertFails(updateDoc(doc(seekerDb, 'applications', APP7_ID), { status: 'accepted' }));
    console.log('  ✅ PASS: Seeker blocked from changing application status');
  } catch (e) {
    console.log('  ❌ FAIL: Seeker changed application status');
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
    await testUsersSelfOnlyRead();
    await testUsersBillingFieldsLocked();
    await testApplicationRequiresPublishedJob();
    await testSeekerCannotUpdateStatus();
    console.log('\n✅ All tests passed!\n');
  } catch (error) {
    console.error('\n❌ Tests failed:', error);
    process.exit(1);
  } finally {
    await teardown();
  }
}

runTests();
