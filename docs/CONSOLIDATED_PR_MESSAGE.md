## PR Description (for GitHub)

This PR resolves critical security gaps and enhances the development environment. It introduces necessary Firestore composite indexes, hardens security rules, and configures the Firebase Emulator Suite for robust local testing. This consolidates the work from PR #26 and PR #27.

---

## Commit Message (for `git commit`)

feat(firebase): Add indexes and configure emulators

This commit introduces critical infrastructure for Firestore and improves the local development workflow.

### 1. Add Firestore Composite Indexes

Introduces `firestore.indexes.json` to define the five composite indexes required for the application's query patterns across the `jobs` and `applications` collections. This resolves Firestore errors related to queries that require a composite index.

### 2. Harden Firestore Security Rules

The security rule for reading `applications` has been hardened. Instead of trusting a denormalized `ownerId` on the application document, the rule now performs a `get()` to the canonical `jobs` document to verify ownership. This prevents potential data inconsistencies from causing a security bypass and makes the job document the single source of truth for ownership.

### 3. Configure Firebase Emulators

Updates `firebase.json` to include a comprehensive emulator configuration for Auth, Firestore, and the Emulator UI. This enables developers to run a complete, isolated backend environment locally for development, testing, and validation before deploying changes.

### 4. Add Project Configuration

Adds `.firebaserc` to alias the project to `shopmatch-pro`, simplifying CLI commands and preventing accidental deployment to the wrong environment.

### 5. Add Verification Documentation

A new guide, `docs/SECURITY_FIXES_SUMMARY.md`, provides a step-by-step checklist for verifying and deploying the new Firestore indexes, ensuring a safe and repeatable process.

---

## Next Steps (Post-Commit)

After amending the commit on your feature branch, you can force-push to update the pull request.

```bash
# Stage all the new and modified files
git add .firebaserc firebase.json firestore.indexes.json firestore.rules docs/SECURITY_FIXES_SUMMARY.md docs/CONSOLIDATED_PR_MESSAGE.md

# Amend the previous commit with these changes
git commit --amend

# Push the updated commit to the remote branch
git push --force-with-lease
```