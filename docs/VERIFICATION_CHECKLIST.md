# Verification Checklist

Complete testing procedures to verify all ShopMatch Pro features, integrations, and quality gates are functioning correctly.

## Table of Contents

- [Pre-Verification Setup](#pre-verification-setup)
- [Local Development Environment](#local-development-environment)
- [GitHub Repository Configuration](#github-repository-configuration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Firebase Integration](#firebase-integration)
- [Stripe Integration](#stripe-integration)
- [Authentication Flow](#authentication-flow)
- [Subscription Flow](#subscription-flow)
- [Quality Gates](#quality-gates)
- [Documentation Completeness](#documentation-completeness)
- [Security Controls](#security-controls)
- [Post-Deployment](#post-deployment)

## Pre-Verification Setup

Before running verification procedures, ensure:

- [ ] `.env.local` exists with real credentials (copy from `.env.local.template`)
- [ ] `.env.test` exists for E2E testing (copy from `.env.test.example`)
- [ ] Dependencies installed: `npm ci`
- [ ] Environment validated: `npm run validate-env` (exits with 0)
- [ ] Git working directory clean: `git status` shows no uncommitted changes

**Time Estimate**: 5 minutes

## Local Development Environment

### Build & Start Server

**Purpose**: Verify application builds and runs without errors.

**Steps**:
```bash
# 1. Build production bundle
npm run build

# Expected output:
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# ✓ Collecting page data
# ✓ Generating static pages (X/X)
# ✓ Finalizing page optimization

# 2. Start production server
npm start

# Expected output:
# ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

**Verification**:
- [ ] Build completes without errors
- [ ] No TypeScript type errors
- [ ] Server starts successfully on port 3000
- [ ] Console shows no runtime errors
- [ ] Visit `http://localhost:3000` loads homepage

**Time Estimate**: 3 minutes

### Linting & Type Checking

**Purpose**: Verify code quality standards.

**Steps**:
```bash
# 1. Run ESLint
npm run lint

# Expected output:
# ✓ No ESLint warnings or errors

# 2. Type check with TypeScript
npx tsc --noEmit

# Expected output:
# (no output = success)
```

**Verification**:
- [ ] ESLint passes with 0 warnings/errors
- [ ] TypeScript compilation succeeds
- [ ] No type errors in console

**Time Estimate**: 2 minutes

### Hot Reload Development Mode

**Purpose**: Verify development server with fast refresh.

**Steps**:
```bash
# 1. Start dev server with Turbopack
npm run dev

# Expected output:
# ready - started server on 0.0.0.0:3000
# Using experimental Turbopack

# 2. Edit a file (e.g., src/app/page.tsx)
# 3. Save changes
```

**Verification**:
- [ ] Dev server starts successfully
- [ ] Browser auto-refreshes on file changes
- [ ] No errors in console after hot reload
- [ ] Changes appear in browser within 2 seconds

**Time Estimate**: 2 minutes

## GitHub Repository Configuration

### Branch Protection Ruleset

**Purpose**: Verify branch naming and commit message enforcement.

**Prerequisites**: Ruleset must be created via GitHub web UI (see [GITHUB_GUI_SETUP_CHECKLIST.md](./GITHUB_GUI_SETUP_CHECKLIST.md))

**Steps**:

**Test 1: Valid Branch Name**
```bash
# 1. Create a valid branch
git checkout -b feat/UI-001-test-branch-validation

# 2. Make a dummy commit
echo "test" > test.txt
git add test.txt
git commit -m "feat(test): test branch validation"

# 3. Push to remote
git push origin feat/UI-001-test-branch-validation

# 4. Create PR via GitHub web UI or CLI
gh pr create --title "[UI-001] Test branch validation" --body "Test PR"
```

**Verification**:
- [ ] Branch push succeeds (not blocked by ruleset)
- [ ] PR creation succeeds
- [ ] CI job `validate-branch` passes with green checkmark
- [ ] No ruleset violations shown in PR

**Test 2: Invalid Branch Name (Should Fail)**
```bash
# 1. Create an invalid branch
git checkout main
git checkout -b feature-123  # Missing type prefix and ID format

# 2. Make a dummy commit
echo "test2" > test2.txt
git add test2.txt
git commit -m "feat(test): test invalid branch"

# 3. Try to push
git push origin feature-123

# 4. Try to create PR
gh pr create --title "Test invalid branch" --body "Test PR"
```

**Verification**:
- [ ] If ruleset configured: Push is blocked OR PR shows ruleset violation
- [ ] CI job `validate-branch` fails with red X
- [ ] Error message explains required format
- [ ] Error message shows valid examples

**Cleanup**:
```bash
git checkout main
git branch -D feat/UI-001-test-branch-validation feature-123
git push origin --delete feat/UI-001-test-branch-validation feature-123 || true
rm -f test.txt test2.txt
```

**Time Estimate**: 5 minutes

### CODEOWNERS

**Purpose**: Verify automatic review requests for critical paths.

**Prerequisites**: `.github/CODEOWNERS` file exists

**Steps**:

**Test 1: Verify CODEOWNERS File Loads**
```bash
# 1. Check CODEOWNERS syntax via API
gh api repos/:owner/:repo/codeowners/errors

# Expected output:
# {"errors":[]} (empty array = no errors)
```

**Verification**:
- [ ] Command returns empty errors array
- [ ] File is recognized by GitHub

**Test 2: Verify Review Requests (Manual)**
1. Create a PR that modifies a CODEOWNERS path (e.g., `.github/workflows/ci.yml`)
2. Check PR page for automatic review request

**Verification**:
- [ ] PR shows "@RazonIn4K" in "Reviewers" section (auto-requested)
- [ ] Hover over reviewer shows "Automatically assigned"

**Time Estimate**: 3 minutes

### Dependabot

**Purpose**: Verify automated dependency updates are enabled.

**Prerequisites**: Dependabot must be enabled via GitHub Settings → Security

**Steps**:

**Via Web UI**:
1. Go to repository → **Insights** → **Dependency graph** → **Dependabot**
2. Check for recent Dependabot PRs or scan results

**Via CLI**:
```bash
# Check Dependabot configuration
cat .github/dependabot.yml | grep "package-ecosystem"

# Expected output:
# - package-ecosystem: "npm"
# - package-ecosystem: "github-actions"
```

**Verification**:
- [ ] `.github/dependabot.yml` exists and is valid YAML
- [ ] Dependabot is enabled in GitHub Settings → Security
- [ ] At least one Dependabot PR exists (or scan has run)
- [ ] Dependabot alerts tab shows no critical vulnerabilities

**Time Estimate**: 2 minutes

### GitHub Copilot Instructions

**Purpose**: Verify AI code review is configured.

**Steps**:
```bash
# 1. Check file exists
cat .github/copilot-instructions.md | head -20

# Expected output:
# # GitHub Copilot Code Review Instructions
# ...
```

**Verification**:
- [ ] `.github/copilot-instructions.md` exists
- [ ] File contains review standards and checklist
- [ ] Copilot is enabled in GitHub Settings → Copilot

**Note**: Automatic PR review requires Copilot Enterprise. Verify in a test PR if available.

**Time Estimate**: 2 minutes

## CI/CD Pipeline

### Trigger CI on Push

**Purpose**: Verify all CI jobs run and pass.

**Steps**:
```bash
# 1. Create a test branch
git checkout -b test/CI-001-pipeline-verification

# 2. Make a trivial change
echo "# CI Test" >> README.md
git add README.md
git commit -m "test(ci): verify pipeline execution"

# 3. Push to remote
git push origin test/CI-001-pipeline-verification

# 4. Create PR
gh pr create --title "[CI-001] Verify pipeline" --body "Testing CI execution"

# 5. Watch CI run
gh pr checks --watch
```

**Verification**:
- [ ] CI job `validate-branch` starts and passes
- [ ] CI job `Build and Test (18.x)` starts and passes
- [ ] CI job `Build and Test (20.x)` starts and passes
- [ ] CI job `Accessibility Testing` starts and passes
- [ ] Step `Measure first-load JS (Playwright)` passes with "✅ PASSED" in logs
- [ ] All jobs complete in under 10 minutes
- [ ] Artifacts uploaded: `first-load-report`, `build-output`, `accessibility-results`

**Check Artifacts**:
```bash
# Download first-load report artifact
gh run download --name first-load-report

# View report
cat first-load-report.json | jq '.summary'

# Expected output:
# {
#   "resourceCount": X,
#   "totalKB": Y,
#   "budgetKB": 300
# }
```

**Verification**:
- [ ] `first-load-report.json` exists
- [ ] `totalKB` is ≤ 300
- [ ] `budgetExceeded` is `false`

**Cleanup**:
```bash
git checkout main
git branch -D test/CI-001-pipeline-verification
gh pr close "https://github.com/.../pull/XXX" --delete-branch
```

**Time Estimate**: 10 minutes

### Bundle Size Budget

**Purpose**: Verify first-load JS budget enforcement.

**Steps**:

**Test 1: Measure Current Bundle**
```bash
# 1. Start server
npm start &
SERVER_PID=$!

# 2. Wait for server
npx wait-on http://localhost:3000

# 3. Run measurement
FIRST_LOAD_BUDGET_KB=300 node scripts/ci/measure-first-load.mjs

# Expected output:
# 📈 First-Load JS Summary:
#    Total: XXX KB (Y resources)
#    Budget: 300 KB
#    Status: ✅ PASSED

# 4. Stop server
kill $SERVER_PID
```

**Verification**:
- [ ] Script exits with code 0 (success)
- [ ] Total KB is ≤ 300
- [ ] Report saved to `first-load-report.json`
- [ ] Report includes resource breakdown

**Test 2: Simulate Budget Failure**
```bash
# 1. Start server
npm start &
SERVER_PID=$!

# 2. Run with low budget (should fail)
FIRST_LOAD_BUDGET_KB=50 node scripts/ci/measure-first-load.mjs

# Expected output:
# ❌ Budget exceeded by XXX KB!
# 💡 Recommendations:
#    - Use dynamic imports for large components
#    ...

# 3. Stop server
kill $SERVER_PID
```

**Verification**:
- [ ] Script exits with code 1 (failure)
- [ ] Error message shows excess KB
- [ ] Recommendations displayed
- [ ] Largest resource identified

**Time Estimate**: 5 minutes

### Accessibility Testing

**Purpose**: Verify axe-core detects violations.

**Steps**:

**Test 1: Run Accessibility Tests**
```bash
# 1. Install Playwright browsers (if not already installed)
npx playwright install --with-deps chromium

# 2. Build application
npm run build

# 3. Start server
npm start &
SERVER_PID=$!

# 4. Wait for server
npx wait-on http://localhost:3000

# 5. Run accessibility tests
npx playwright test e2e/accessibility.spec.ts

# Expected output:
# Running 3 tests using 1 worker
#   ✓ homepage accessibility (Xms)
#   ✓ dashboard accessibility (unauthenticated) (Xms)
#   ✓ subscribe page accessibility (Xms)
# 3 passed (Xs)

# 6. Stop server
kill $SERVER_PID
```

**Verification**:
- [ ] All 3 tests pass
- [ ] No accessibility violations logged
- [ ] Report generated in `playwright-report/`

**Test 2: Verify Violation Detection**

Temporarily introduce an accessibility violation to verify detection:

```bash
# 1. Edit src/app/page.tsx
# Add a button without accessible name: <button>Click</button>

# 2. Build and start
npm run build && npm start &
SERVER_PID=$!

# 3. Run tests (should fail)
npx playwright test e2e/accessibility.spec.ts

# Expected output:
# ✗ homepage accessibility
#   Error: expect(received).toEqual(expected)
#   Accessibility violations found:
#   - button-name: Buttons must have discernible text

# 4. Revert changes
git checkout src/app/page.tsx

# 5. Stop server
kill $SERVER_PID
```

**Verification**:
- [ ] Test fails when violation introduced
- [ ] Violation details logged to console
- [ ] Impact level and affected elements shown

**Time Estimate**: 5 minutes

## Firebase Integration

### Authentication

**Purpose**: Verify Firebase Auth is configured correctly.

**Steps**:

**Test 1: Client SDK Initialization**
```bash
# 1. Start dev server
npm run dev

# 2. Open browser DevTools → Console
# 3. Navigate to http://localhost:3000
# 4. Check for Firebase initialization logs
```

**Verification**:
- [ ] No Firebase initialization errors in console
- [ ] Auth state listener activates (check `AuthContext` logs if enabled)
- [ ] Firebase config object contains valid values

**Test 2: Sign Up Flow**
1. Navigate to `http://localhost:3000/signup`
2. Fill in form with test email/password
3. Select role (owner or seeker)
4. Submit form

**Verification**:
- [ ] Form submits without errors
- [ ] User redirected to dashboard
- [ ] User document created in Firestore `users` collection
- [ ] User document contains `role`, `email`, `createdAt` fields
- [ ] Auth state updates in `AuthContext`

**Test 3: Sign In Flow**
1. Sign out if logged in
2. Navigate to `http://localhost:3000/login`
3. Enter test user credentials
4. Submit form

**Verification**:
- [ ] Form submits without errors
- [ ] User redirected to dashboard
- [ ] Auth state loads user data from Firestore
- [ ] `currentUser` in `AuthContext` includes Firestore fields

**Test 4: Google OAuth Flow**
1. Click "Sign in with Google" button
2. Complete OAuth flow in popup
3. Verify redirect back to application

**Verification**:
- [ ] OAuth popup opens
- [ ] Google login flow completes
- [ ] User redirected to dashboard
- [ ] User document created/updated in Firestore
- [ ] Profile photo displayed (if available)

**Test 5: Password Reset Flow**
1. Navigate to password reset page
2. Enter test email
3. Submit form
4. Check email inbox

**Verification**:
- [ ] Form submits without errors
- [ ] Success message displayed
- [ ] Password reset email received
- [ ] Email link redirects to Firebase Auth hosted UI
- [ ] Password can be reset successfully

**Time Estimate**: 10 minutes

### Firestore

**Purpose**: Verify Firestore security rules and data access.

**Steps**:

**Test 1: User Document Read (Own)**
1. Sign in as test user
2. Open browser DevTools → Network
3. Navigate to dashboard
4. Check for Firestore requests

**Verification**:
- [ ] Firestore request to `users/{userId}` succeeds (200)
- [ ] User document data displayed in UI
- [ ] Security rules allow read of own document

**Test 2: User Document Write (Own)**
1. Update user profile (if feature exists) OR use console:
```javascript
// In browser console
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

const userId = 'YOUR_USER_ID'
await updateDoc(doc(db, 'users', userId), { testField: 'test' })
```

**Verification**:
- [ ] Update succeeds without permission error
- [ ] Document updated in Firestore console

**Test 3: User Document Read (Other - Should Fail)**
```javascript
// In browser console (as User A)
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/client'

// Try to read User B's document
const otherUserId = 'OTHER_USER_ID'
try {
  await getDoc(doc(db, 'users', otherUserId))
} catch (error) {
  console.error('Expected error:', error.code) // Should be 'permission-denied'
}
```

**Verification**:
- [ ] Read fails with `permission-denied` error
- [ ] Security rules correctly block access to other user documents

**Time Estimate**: 5 minutes

### Admin SDK

**Purpose**: Verify Firebase Admin SDK for server-side operations.

**Steps**:

**Test 1: Create User Script**
```bash
# 1. Run create-user script
npm run create-user

# Follow prompts:
# - Email: test-admin@example.com
# - Password: TestPassword123!
# - Role: owner

# Expected output:
# ✅ User created successfully!
# UID: xxx
# Email: test-admin@example.com
# Role: owner
```

**Verification**:
- [ ] Script completes without errors
- [ ] User appears in Firebase Console → Authentication
- [ ] User document exists in Firestore `users` collection
- [ ] Document contains `role`, `email`, `createdAt`

**Test 2: Health Check API**
```bash
# 1. Start server
npm start &
SERVER_PID=$!

# 2. Call health endpoint
curl http://localhost:3000/api/health

# Expected output:
# {"status":"healthy","timestamp":"2025-10-15T..."}

# 3. Stop server
kill $SERVER_PID
```

**Verification**:
- [ ] Endpoint returns 200 status
- [ ] Response is valid JSON
- [ ] No Firebase initialization errors in server logs

**Time Estimate**: 3 minutes

## Stripe Integration

### Checkout Flow

**Purpose**: Verify Stripe Checkout session creation.

**Prerequisites**: Signed in as test user

**Steps**:

**Test 1: Create Checkout Session**
1. Navigate to `http://localhost:3000/subscribe`
2. Click "Subscribe" button for Pro plan
3. Wait for redirect to Stripe Checkout

**Verification**:
- [ ] API request to `/api/stripe/checkout` succeeds (200)
- [ ] Response contains `url` field
- [ ] Browser redirects to Stripe hosted checkout (checkout.stripe.com)
- [ ] Checkout page displays correct product/price
- [ ] `client_reference_id` matches Firebase UID (check Stripe Dashboard)

**Test 2: Complete Checkout (Test Mode)**
1. On Stripe Checkout page, use test card: `4242 4242 4242 4242`
2. Expiry: Any future date (e.g., `12/34`)
3. CVC: Any 3 digits (e.g., `123`)
4. Submit payment

**Verification**:
- [ ] Payment succeeds
- [ ] Redirected back to application (success page)
- [ ] Success message displayed

**Time Estimate**: 5 minutes

### Webhook Processing

**Purpose**: Verify webhook signature verification and subscription sync.

**Prerequisites**:
- Local server running
- ngrok forwarding to localhost:3000 (for local testing)
- Stripe webhook endpoint configured with ngrok URL

**Steps**:

**Test 1: Trigger Webhook (via Stripe Dashboard)**
1. Go to Stripe Dashboard → Webhooks
2. Select your webhook endpoint
3. Click "Send test webhook"
4. Choose `checkout.session.completed` event
5. Send

**Verification**:
- [ ] Server logs show webhook received
- [ ] Signature verification succeeds
- [ ] Event type logged: `checkout.session.completed`
- [ ] No errors in server response (200 status)

**Test 2: Verify Subscription Sync**

After completing checkout in previous test:

1. Check Firebase Auth custom claims:
```bash
# Use Firebase CLI or Admin SDK
firebase auth:export users.json --project YOUR_PROJECT_ID
cat users.json | jq '.users[] | select(.email=="TEST_EMAIL") | .customClaims'

# Expected output:
# {"role":"owner","subActive":true}
```

2. Check Firestore user document:
```javascript
// In Firebase Console → Firestore
// Navigate to users/{userId}
// Verify fields:
{
  stripeCustomerId: "cus_...",
  stripeSubscriptionId: "sub_...",
  subscriptionStatus: "active",
  subscriptionEndDate: <Timestamp>
}
```

**Verification**:
- [ ] Custom claims updated: `subActive: true`
- [ ] Firestore `users` document updated with Stripe IDs
- [ ] `subscriptionStatus` is `"active"`
- [ ] `subscriptionEndDate` is in the future

**Test 3: Webhook Signature Validation**

Simulate an invalid webhook signature:

```bash
# Send POST request without valid signature
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid" \
  -d '{"type":"checkout.session.completed"}'

# Expected response:
# {"error":"Webhook signature verification failed"}
```

**Verification**:
- [ ] Request returns 400 status
- [ ] Error message indicates signature verification failed
- [ ] Server logs show verification error
- [ ] No subscription sync occurs

**Time Estimate**: 10 minutes

### Customer Portal

**Purpose**: Verify customer portal session creation.

**Prerequisites**: User with active subscription

**Steps**:

**Test 1: Generate Portal Session**
```bash
# 1. Get auth token (sign in via UI first)
# In browser console:
const token = await firebase.auth().currentUser.getIdToken()
console.log(token)

# 2. Call portal API
curl -X POST http://localhost:3000/api/stripe/portal \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Expected response:
# {"url":"https://billing.stripe.com/session/..."}
```

**Verification**:
- [ ] Request returns 200 status
- [ ] Response contains `url` field
- [ ] URL starts with `https://billing.stripe.com/`

**Test 2: Access Portal**
1. Navigate to URL from previous step
2. Verify portal loads with user's subscription

**Verification**:
- [ ] Portal displays current subscription
- [ ] User can view invoices
- [ ] User can update payment method
- [ ] User can cancel subscription

**Time Estimate**: 5 minutes

## Authentication Flow

### Complete User Journey

**Purpose**: End-to-end test of authentication and authorization.

**Scenario**: New user signs up → subscribes → accesses protected features

**Steps**:

1. **Sign Up**
   - Navigate to `/signup`
   - Create account with new email
   - Select role: owner
   - Verify redirect to dashboard

2. **Verify Free Tier Access**
   - Check `subActive` custom claim (should be `false`)
   - Attempt to access subscription-gated feature
   - Verify "Upgrade required" message displayed

3. **Subscribe**
   - Navigate to `/subscribe`
   - Complete Stripe Checkout with test card
   - Wait for webhook processing (5-10 seconds)
   - Verify redirect back to application

4. **Verify Premium Access**
   - Refresh page to reload custom claims
   - Check `subActive` custom claim (should be `true`)
   - Access subscription-gated feature
   - Verify feature now accessible

5. **Sign Out & Sign In**
   - Sign out
   - Sign in with same credentials
   - Verify subscription status persists
   - Verify access still granted

**Verification**:
- [ ] All steps complete without errors
- [ ] Custom claims update within 10 seconds of subscription
- [ ] Subscription status persists across sessions
- [ ] Access control works correctly (free vs. premium)

**Time Estimate**: 15 minutes

## Subscription Flow

### Subscription Lifecycle

**Purpose**: Test complete subscription lifecycle from creation to cancellation.

**Steps**:

1. **Create Subscription** (from previous test)
   - Complete checkout
   - Verify `subActive: true`
   - Verify Firestore `subscriptionStatus: "active"`

2. **Access Customer Portal**
   - Navigate to portal via `/api/stripe/portal`
   - Click "Cancel subscription"
   - Choose "Cancel immediately" (for testing)
   - Confirm cancellation

3. **Verify Webhook Processing**
   - Wait for `customer.subscription.deleted` webhook
   - Check server logs for webhook receipt
   - Verify custom claims updated: `subActive: false`
   - Verify Firestore `subscriptionStatus: "canceled"`

4. **Verify Access Revoked**
   - Refresh application page
   - Attempt to access premium feature
   - Verify "Upgrade required" message displayed

5. **Resubscribe**
   - Navigate to `/subscribe` again
   - Complete checkout with test card
   - Verify access restored

**Verification**:
- [ ] Cancellation webhook received and processed
- [ ] Custom claims updated to `subActive: false`
- [ ] Firestore document updated to `canceled`
- [ ] Access control blocks premium features
- [ ] Resubscription restores access
- [ ] All state transitions occur within 10 seconds

**Time Estimate**: 10 minutes

## Quality Gates

### Pre-Merge Checklist

**Purpose**: Verify all quality gates pass before merging PR.

**Steps**:

Create a test PR and verify all checks pass:

```bash
# 1. Create feature branch
git checkout -b test/QA-001-quality-gates

# 2. Make changes (e.g., add a component)
mkdir -p src/components/test
cat > src/components/test/TestComponent.tsx << 'EOF'
export default function TestComponent() {
  return <div>Test Component</div>
}
EOF

# 3. Commit changes
git add .
git commit -m "test(qa): verify quality gates"

# 4. Push and create PR
git push origin test/QA-001-quality-gates
gh pr create --title "[QA-001] Verify quality gates" --body "Testing all quality gates"
```

**Verification Checklist** (from PR template):

**Automated Quality Gates**:
- [ ] CI: All checks passing (build, lint, type check)
- [ ] First-load JS: ≤ 300 KB (verify artifact)
- [ ] Accessibility: Zero violations (verify artifact)
- [ ] CodeQL: No security issues (if enabled)

**Code Quality**:
- [ ] Tests written for new functionality
- [ ] TypeScript strict mode compliant
- [ ] Error handling implemented
- [ ] Input validation present

**Security**:
- [ ] Authentication checks in place
- [ ] Authorization verified
- [ ] No secrets in code
- [ ] Rate limiting considered

**Performance**:
- [ ] Code splitting used for large components
- [ ] Images optimized
- [ ] No unnecessary re-renders

**Observability**:
- [ ] Analytics events added (if applicable)
- [ ] Error logging present
- [ ] Performance markers added

**Documentation**:
- [ ] Code comments for complex logic
- [ ] README updated (if needed)
- [ ] ADR created (if architectural decision)

**Review Process**:
- [ ] GitHub Copilot review passed (if enabled)
- [ ] Code owners review requested (if applicable)
- [ ] All review comments addressed

**Cleanup**:
```bash
gh pr close --delete-branch
git checkout main
```

**Time Estimate**: 15 minutes

## Documentation Completeness

### Core Documentation

**Purpose**: Verify all required documentation exists and is up-to-date.

**Checklist**:

**Root Level**:
- [ ] `README.md` — Project overview, setup, tech stack
- [ ] `CLAUDE.md` — AI development guide, persona prompts
- [ ] `CONTRIBUTING.md` — Contribution guidelines, workflow
- [ ] `THIRD_PARTY_LICENSES.md` — Dependency licenses

**docs/ Directory**:
- [ ] `docs/ARCHITECTURE.md` — System design, tech choices
- [ ] `docs/SECURITY.md` — Security policies, threat model
- [ ] `docs/TESTING.md` — Test strategy, budgets
- [ ] `docs/DEPLOYMENT.md` — Deployment procedures
- [ ] `docs/OBSERVABILITY.md` — Logging, monitoring, analytics
- [ ] `docs/ENVIRONMENT_VARIABLES.md` — Env var reference (this doc)
- [ ] `docs/VERIFICATION_CHECKLIST.md` — Testing procedures (this doc)
- [ ] `docs/REPOSITORY_GUARDRAILS.md` — GitHub config guide
- [ ] `docs/AI_TOOLING_SETUP.md` — AI tool integration
- [ ] `docs/README.md` — Documentation index

**docs/adr/ (Architecture Decision Records)**:
- [ ] `docs/adr/0001-payments-stripe.md` — Stripe vs. alternatives
- [ ] `docs/adr/0002-auth-firestore.md` — Firebase Auth + Firestore
- [ ] `docs/adr/0003-hosting-vercel.md` — Vercel hosting decision

**docs/runbooks/**:
- [ ] `docs/runbooks/STRIPE_WEBHOOK_RUNBOOK.md` — Webhook troubleshooting
- [ ] `docs/INCIDENT_RESPONSE.md` — Incident procedures

**GitHub Templates**:
- [ ] `.github/ISSUE_TEMPLATE/bug_report.md` — Bug report template
- [ ] `.github/ISSUE_TEMPLATE/feature_request.md` — Feature request template
- [ ] `.github/pull_request_template.md` — PR template with DoR/DoD
- [ ] `.github/CODEOWNERS` — Code ownership matrix
- [ ] `.github/dependabot.yml` — Dependabot config
- [ ] `.github/copilot-instructions.md` — Copilot review guidelines
- [ ] `.github/workflows/ci.yml` — CI pipeline

**Configuration Files**:
- [ ] `.env.local.template` — Local development template
- [ ] `.env.test.example` — Testing environment template
- [ ] `tsconfig.json` — TypeScript configuration
- [ ] `next.config.ts` — Next.js configuration
- [ ] `firestore.rules` — Firestore security rules
- [ ] `lighthouse-budgets.json` — Performance budgets
- [ ] `lighthouserc.json` — Lighthouse CI config
- [ ] `playwright.config.ts` — Playwright configuration

**Time Estimate**: 10 minutes

### Documentation Quality

**Purpose**: Verify documentation is accurate and helpful.

**Checklist**:

- [ ] All internal links resolve correctly (no 404s)
- [ ] Code examples are syntactically correct
- [ ] Environment variable references match actual var names
- [ ] Command examples run without errors
- [ ] File paths are accurate (no references to moved/deleted files)
- [ ] No placeholder text like "TODO" or "FIXME" in production docs
- [ ] Markdown renders correctly (check headings, lists, code blocks)
- [ ] Tables are properly formatted
- [ ] ADRs follow consistent format (Context, Decision, Consequences)

**Automated Validation**:
```bash
# Check for broken internal links
grep -r "\[.*\](.*.md)" docs/ --include="*.md" | \
  sed 's/.*(\(.*\.md\)).*/\1/' | \
  while read file; do
    [ -f "$file" ] || echo "Broken link: $file"
  done

# Check for TODO/FIXME in docs
grep -r "TODO\|FIXME" docs/ --include="*.md"

# Expected: No output (no TODOs in production docs)
```

**Time Estimate**: 5 minutes

## Security Controls

### Firestore Security Rules

**Purpose**: Verify security rules prevent unauthorized access.

**Steps**:

**Test 1: User Document Access Control**

Already tested in [Firebase Integration → Firestore](#firestore) section.

**Test 2: Deploy and Test Rules**
```bash
# 1. Deploy rules to Firebase
firebase deploy --only firestore:rules --project YOUR_PROJECT_ID

# 2. Use Firestore Emulator for local testing (recommended)
firebase emulators:start --only firestore

# 3. Run rules unit tests (if created)
firebase emulators:exec --only firestore "npm run test:rules"
```

**Verification**:
- [ ] Rules deploy successfully
- [ ] Emulator starts without errors
- [ ] Rules unit tests pass (if they exist)

**Time Estimate**: 5 minutes

### Stripe Webhook Signature Verification

**Purpose**: Verify webhook handler rejects invalid signatures.

Already tested in [Stripe Integration → Webhook Processing](#webhook-processing) section.

**Verification**:
- [ ] Invalid signatures return 400 error
- [ ] No subscription sync occurs without valid signature
- [ ] Server logs show verification errors

**Time Estimate**: Included in Stripe Integration section

### Environment Variable Security

**Purpose**: Verify secrets are not exposed.

**Checklist**:

- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.test` is in `.gitignore`
- [ ] No `FIREBASE_PRIVATE_KEY` in git history
- [ ] No `STRIPE_SECRET_KEY` in git history
- [ ] `NEXT_PUBLIC_*` variables do not contain secrets
- [ ] Service account JSON files not committed

**Automated Check**:
```bash
# Check git history for secrets (WARNING: slow on large repos)
git log -p | grep -i "private_key\|secret_key" | grep -v "BEGIN PRIVATE KEY"

# Expected: No matches (or only references in docs/examples)

# Check for committed .env files
git ls-files | grep "\.env\.local$"

# Expected: No output (file not tracked)
```

**Verification**:
- [ ] No secrets found in git history
- [ ] `.env.local` not tracked by git
- [ ] `validate-env` script passes without exposing secrets

**Time Estimate**: 5 minutes

## Post-Deployment

### Production Smoke Tests

**Purpose**: Verify deployment succeeded and core features work in production.

**Prerequisites**: Application deployed to production environment

**Steps**:

**Test 1: Health Check**
```bash
curl https://YOUR_PRODUCTION_DOMAIN/api/health

# Expected output:
# {"status":"healthy","timestamp":"..."}
```

**Verification**:
- [ ] Endpoint returns 200 status
- [ ] Response is valid JSON
- [ ] No server errors in logs

**Test 2: Homepage Loads**

Visit `https://YOUR_PRODUCTION_DOMAIN` in browser.

**Verification**:
- [ ] Page loads without errors
- [ ] No console errors in DevTools
- [ ] Firebase SDK initializes
- [ ] Analytics tracking fires (if configured)

**Test 3: Authentication Flow**

1. Sign up with real email
2. Verify email (if required)
3. Sign in
4. Verify redirect to dashboard

**Verification**:
- [ ] Sign up succeeds
- [ ] User document created in production Firestore
- [ ] Sign in succeeds
- [ ] Dashboard loads with user data

**Test 4: Subscription Flow**

1. Navigate to `/subscribe`
2. Complete checkout with TEST card (if using Stripe test mode) OR real card
3. Verify webhook received (check logs)
4. Verify subscription active

**Verification**:
- [ ] Checkout completes
- [ ] Webhook processed successfully
- [ ] User granted access to premium features

**Test 5: Performance**

```bash
# Run Lighthouse audit
npx lighthouse https://YOUR_PRODUCTION_DOMAIN \
  --output html \
  --output-path ./lighthouse-report.html \
  --chrome-flags="--headless"

# Open report
open lighthouse-report.html  # macOS
# xdg-open lighthouse-report.html  # Linux
```

**Verification**:
- [ ] Performance score ≥ 80
- [ ] Accessibility score ≥ 90
- [ ] First Contentful Paint ≤ 2s
- [ ] Total Blocking Time ≤ 300ms
- [ ] First Load JS ≤ 300 KB (check in Network tab)

**Time Estimate**: 20 minutes

### Monitoring Setup

**Purpose**: Verify observability tools are configured.

**Checklist**:

- [ ] Error tracking enabled (Sentry, LogRocket, etc.)
- [ ] Analytics configured (Google Analytics, Plausible, etc.)
- [ ] Server logs accessible (Vercel logs, CloudWatch, etc.)
- [ ] Firestore indexes created for production queries
- [ ] Stripe webhooks configured with production URL
- [ ] Firebase security rules deployed to production
- [ ] Environment variables set in hosting platform

**Verification**:
```bash
# Check Firestore indexes
firebase firestore:indexes --project YOUR_PROJECT_ID

# Expected output: List of indexes (or "No indexes")

# Check Stripe webhooks
stripe webhooks list

# Expected output: Production webhook endpoint listed
```

**Time Estimate**: 10 minutes

## Summary

### Total Time Estimate

**Full verification run**: ~2.5 hours

**Quick smoke test** (minimal verification):
- Build & start: 5 min
- CI pipeline: 10 min
- Auth flow: 10 min
- Subscription flow: 10 min
- **Total**: ~35 minutes

### Verification Matrix

| Category | Tests | Must Pass | Time |
|----------|-------|-----------|------|
| Local Environment | 3 | All | 7 min |
| GitHub Configuration | 4 | All | 12 min |
| CI/CD Pipeline | 3 | All | 20 min |
| Firebase | 3 | All | 18 min |
| Stripe | 3 | All | 20 min |
| Authentication | 1 | All | 15 min |
| Subscription | 1 | All | 10 min |
| Quality Gates | 1 | All | 15 min |
| Documentation | 2 | All | 15 min |
| Security | 3 | All | 15 min |
| Post-Deployment | 2 | All | 30 min |

### Continuous Verification

**Daily** (automated via CI):
- Linting & type checking
- Build success
- Bundle size budget
- Accessibility tests

**Weekly** (manual):
- Firestore security rules audit
- Dependency vulnerability scan
- Documentation accuracy review

**Monthly** (manual):
- Full verification checklist
- Performance audit
- Security best practices review
- Backup & disaster recovery test

## Troubleshooting

If any verification step fails, refer to:
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) — Environment configuration issues
- [REPOSITORY_GUARDRAILS.md](./REPOSITORY_GUARDRAILS.md) — GitHub configuration issues
- [docs/runbooks/STRIPE_WEBHOOK_RUNBOOK.md](./runbooks/STRIPE_WEBHOOK_RUNBOOK.md) — Stripe webhook issues
- [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) — Production incident procedures

## Related Documentation

- [TESTING.md](./TESTING.md) — Test strategy and philosophy
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Deployment procedures
- [CLAUDE.md](../CLAUDE.md) — Development workflow
- [ARCHITECTURE.md](./ARCHITECTURE.md) — System design
