# Firestore Index Deployment & Verification

This document provides a comprehensive checklist for deploying and verifying the Firestore composite indexes required for the application's query patterns.

---

## 1. Pre-Deployment Verification

Before deploying, ensure your local environment is correctly configured.

### Step 1.1: Verify Firebase CLI

Ensure you have the Firebase CLI installed and are authenticated.

```bash
# Check CLI version (ensure it's a recent version)
firebase --version

# Re-authenticate to refresh your credentials
firebase login --reauth
```

### Step 1.2: Confirm Repository Configuration

Verify that the Firebase configuration files are pointing to the correct project and index definitions.

```bash
# Confirm the default Firebase project
node -e "console.log(JSON.parse(require('fs').readFileSync('.firebaserc', 'utf8')).projects.default)"
# Expected Output: shopmatch-pro

# Confirm the path to the indexes file
node -e "console.log(JSON.parse(require('fs').readFileSync('firebase.json', 'utf8')).firestore.indexes)"
# Expected Output: firestore.indexes.json
```

---

## 2. Deployment

Deploy only the Firestore indexes to production.

```bash
firebase deploy --only firestore:indexes
```

**Success Criteria**:
- The command completes without errors.
- The Firebase console shows the new indexes being built under **Firestore Database > Indexes**.

---

## 3. Local Development with Emulators

For local testing, use the Firebase Emulator Suite to validate queries without affecting production data.

### Step 3.1: Start the Emulators

```bash
# Start Firestore and Auth emulators, plus the UI
firebase emulators:start --only firestore,auth
```

### Emulator Endpoints:
- **Firestore Emulator**: `localhost:8080`
- **Auth Emulator**: `localhost:9099`
- **Emulator UI**: `http://localhost:4000`

### When to Use Emulators:
- **Local Development**: Test new features and queries against a local database.
- **CI/CD Pipelines**: Run automated tests in a clean, isolated environment.
- **Index Validation**: Verify that new composite indexes resolve queries correctly before deploying them.