# GitHub Repository Setup Guide

**Purpose**: Complete configuration guide for ShopMatch Pro repository guardrails, security features, and automated quality gates.

**Prerequisites**: Admin access to the repository

**Estimated Time**: 15 minutes

---

## Quick Verification Checklist

Before starting manual setup, verify local configuration is complete:

```bash
# ✅ All files exist
ls -1 .github/CODEOWNERS \
      .github/copilot-instructions.md \
      .github/workflows/ci.yml \
      playwright.config.ts \
      e2e/accessibility.spec.ts \
      scripts/ci/measure-first-load.mjs

# ✅ Dependencies installed
grep -E "@playwright/test|@axe-core/playwright|wait-on" package.json

# ✅ Scripts configured
grep -E "test:e2e|test:a11y" package.json

# ✅ Branch regex works
BR="feat/UI-001-test"; [[ "$BR" =~ ^(feat|fix|perf|sec|docs|test|refactor|ci|build)/[A-Z]+-[0-9]{3,}-[a-z0-9-]+$ ]] && echo "✅ Valid" || echo "❌ Invalid"
```

**Expected Output**: All commands succeed with ✅

---

## Part 1: Repository Labels (2 minutes)

Dependabot PRs require these labels for automatic categorization.

### Step 1.1: Navigate to Labels

1. Go to: `https://github.com/RazonIn4K/shopmatch-pro/labels`
2. Click **"New label"** button (top right)

### Step 1.2: Create Three Labels

Create each label with these exact specifications:

| Label Name  | Color Code | Description                          |
|-------------|------------|--------------------------------------|
| `automated` | `#0E8A16`  | Automated dependency updates         |
| `ci`        | `#0052CC`  | Continuous integration & deployment  |
| `security`  | `#D93F0B`  | Security-related changes             |

**How to create**:
- **Name**: Enter label name (e.g., `automated`)
- **Description**: Copy from table above
- **Color**: Paste hex code (e.g., `#0E8A16`) OR pick from palette
- Click **"Create label"**

### Step 1.3: Verify Labels

1. Visit any Dependabot PR (e.g., #6 or #7)
2. Labels should auto-apply on next Dependabot run
3. If not: Edit `.github/dependabot.yml` and trigger new PR

**Result**: Three labels visible in repository labels page

---

## Part 2: Security Features (4 minutes)

Enable GitHub's built-in security scanning and dependency management.

### Step 2.1: Navigate to Security Settings

1. Go to: `https://github.com/RazonIn4K/shopmatch-pro/settings/security_analysis`
2. You should see four security features

### Step 2.2: Enable Dependabot

**Dependabot alerts**:
- ✅ Click **"Enable"** if not already enabled
- Shows vulnerable dependencies in Security tab

**Dependabot security updates**:
- ✅ Click **"Enable"**
- Auto-creates PRs for security vulnerabilities
- Uses labels: `security`, `automated`

**Dependabot version updates**:
- ✅ Should show "Enabled via configuration file"
- Managed by `.github/dependabot.yml` (already committed)
- Creates PRs for: npm (daily), GitHub Actions (weekly)

### Step 2.3: Enable Code Scanning (CodeQL)

1. Scroll to **"Code scanning"** section
2. Click **"Set up"** → **"Default"**
3. Configuration:
   - **Languages detected**: JavaScript/TypeScript (auto-detected)
   - **Query suites**: Default (recommended)
   - **Events**: Push, Pull Request, Schedule (weekly)
4. Click **"Enable CodeQL"**

**What CodeQL detects**:
- SQL injection, XSS, command injection
- Path traversal, insecure randomness
- Hard-coded credentials, weak crypto
- 300+ security and code quality patterns

**Result**: CodeQL workflow appears in Actions tab within 2-3 minutes

### Step 2.4: Enable Secret Scanning

**Secret scanning**:
- ✅ Click **"Enable"**
- Scans commits for 200+ secret patterns (API keys, tokens, passwords)
- Alerts appear in Security → Secret scanning

**Push protection**:
- ✅ Click **"Enable"**
- **Blocks git push** if secrets detected
- Prevents accidental credential commits

**Test push protection** (optional):
```bash
# This should be blocked
echo "STRIPE_SECRET_KEY=sk_live_51A1B2C3D4E5" > test-secret.txt
git add test-secret.txt
git commit -m "test: Secret detection"
git push
# Expected: Push rejected with secret detected warning
```

### Step 2.5: Verify Security Setup

1. Visit **Security** tab in repository
2. Should see four sections:
   - ✅ **Dependabot alerts** (enabled)
   - ✅ **Code scanning** (CodeQL running or completed)
   - ✅ **Secret scanning** (enabled)
   - ✅ **Security policy** (SECURITY.md present)

**Result**: All four security features active and visible

---

## Part 3: GitHub Copilot Code Review (2 minutes)

Configure Copilot to automatically review all pull requests using your custom guidelines.

### Step 3.1: Navigate to Copilot Settings

1. Go to: `https://github.com/RazonIn4K/shopmatch-pro/settings/copilot`
2. Scroll to **"Code review"** section

### Step 3.2: Enable Auto-Review

**Automatically review code in pull requests**:
- ✅ Toggle **ON**

**When triggered**:
- Select **"Automatically on new pull requests"**
- Alternative: "On request" (requires `/copilot review` comment)

**Review guidelines**:
- Should show: "Using `.github/copilot-instructions.md`"
- File committed in earlier step (contains 8 review standards)

### Step 3.3: Copilot Review Standards

Your `.github/copilot-instructions.md` enforces these checks:

1. **Type Safety** - Strict TypeScript, no `any` types
2. **Security** - Input validation, SQL injection prevention, XSS protection
3. **Performance** - Bundle budgets, code splitting, lazy loading
4. **Accessibility** - ARIA labels, keyboard nav, semantic HTML
5. **Error Handling** - Try/catch, user-facing errors, logging
6. **Code Quality** - DRY, single responsibility, clear naming
7. **Testing** - Unit/component/E2E coverage, edge cases
8. **Documentation** - JSDoc for public APIs, inline comments for complex logic

### Step 3.4: Test Copilot Review

1. Create test branch: `git checkout -b feat/TEST-001-copilot-test`
2. Make trivial change: `echo "# Test" >> README.md`
3. Commit and push: `git add README.md && git commit -m "test: Copilot review" && git push origin feat/TEST-001-copilot-test`
4. Create PR on GitHub
5. Wait 1-2 minutes
6. **Expected**: Copilot adds review comment with checklist

**Result**: Copilot auto-review configured and verified

---

## Part 4: Branch Protection Ruleset (7 minutes)

Create comprehensive branch protection with required status checks, code owner reviews, and naming conventions.

### Step 4.1: Navigate to Rulesets

1. Go to: `https://github.com/RazonIn4K/shopmatch-pro/settings/rules`
2. Click **"New ruleset"** → **"New branch ruleset"**

### Step 4.2: Ruleset Basics

**Ruleset name**: `main-branch-protection`

**Enforcement status**: **Active** (enforces rules immediately)

**Bypass list** (optional):
- Add your username if you need emergency merge capability
- Bypass actions are logged for audit

**Target branches**:
- ✅ **Include default branch** (automatically targets `main`)
- Or manually add: **Include by pattern** → `main`

### Step 4.3: Branch Protections

Enable these protections in order:

#### A) Require Pull Request Before Merging
- ✅ **Enable**
- **Required approvals**: `1`
- ✅ **Dismiss stale pull request approvals when new commits are pushed**
- ✅ **Require review from Code Owners** (enforces `.github/CODEOWNERS`)
- ✅ **Require approval of the most recent reviewable push**

#### B) Require Status Checks to Pass
- ✅ **Enable**
- ✅ **Require branches to be up to date before merging**
- **Add required status checks** (click "Add checks"):

  | Check Name                  | Description                              |
  |-----------------------------|------------------------------------------|
  | `build (20.x)`              | Production build on Node 20              |
  | `validate-branch`           | Branch naming convention enforcement     |
  | `First-load JS (Playwright)`| Bundle budget ≤ 300 KB enforcement       |
  | `Accessibility Tests`       | axe-core WCAG violation detection        |
  | `CodeQL`                    | Security vulnerability scanning          |

**Note**: Checks must run at least once before appearing in dropdown. If missing:
1. Create a test PR to trigger all checks
2. Wait for checks to complete
3. Return to edit ruleset and add checks

#### C) Block Force Pushes
- ✅ **Enable**
- Prevents `git push --force` to `main`
- Protects commit history integrity

#### D) Require Linear History
- ✅ **Enable**
- Prevents merge commits (rebase or squash only)
- Keeps git log clean and auditable

#### E) Require Deployments to Succeed
- ⬜ **Disable** (no deployment required for merge)
- Enable later if you add deployment previews

#### F) Require Signed Commits
- ⬜ **Disable** (optional security enhancement)
- Enable if your team uses GPG signing

### Step 4.4: Additional Rules

#### Restrict Creations (Branch Naming Convention)
- ✅ **Enable**
- **Restrict creation of matching refs**: Add pattern
- **Pattern**: `^(feat|fix|perf|sec|docs|test|refactor|ci|build)/[A-Z]+-\d{3,}-[a-z0-9-]+$`
- **Match type**: Regular expression (regex)

**Valid Examples**:
- ✅ `feat/UI-001-dashboard-layout`
- ✅ `fix/AUTH-127-login-redirect`
- ✅ `sec/SEC-015-stripe-webhook`

**Invalid Examples**:
- ❌ `feature/dashboard` (wrong type)
- ❌ `feat/ui-1-test` (ID not uppercase)
- ❌ `feat/UI-1-test` (ID < 3 digits)

#### Restrict Updates (Prevent Force Push)
- Already covered by "Block force pushes" above

#### Restrict Deletions
- ⬜ **Disable** (allow branch deletion after merge)

#### Require Workflows to Pass Before Merging
- ⬜ **Disable** (covered by status checks)

### Step 4.5: Commit Message Rules (Optional)

**Require commit messages to match a pattern**:
- ✅ **Enable** (optional, enforces Conventional Commits)
- **Pattern**: `^(feat|fix|perf|sec|docs|test|refactor|ci|build)(\(.+\))?!?: .{1,100}`

**Valid Examples**:
- ✅ `feat: Add job posting dashboard`
- ✅ `fix(auth): Resolve login redirect loop`
- ✅ `perf!: Breaking bundle optimization`

**Invalid Examples**:
- ❌ `Added dashboard` (no type prefix)
- ❌ `feat Add dashboard` (missing colon)

### Step 4.6: Metadata Restrictions (Optional)

**Require a pull request before merging**:
- **Require approval from specific actors**: Add your username or team

**Require review from Code Owners**:
- Already enabled in Step 4.3A

**Automatically request reviews from Code Owners**:
- ✅ **Enable** (auto-assigns reviewers based on `.github/CODEOWNERS`)

### Step 4.7: Save Ruleset

1. Review all settings
2. Click **"Create"** at bottom
3. Ruleset immediately goes into effect

**Result**: `main` branch fully protected with 5 required checks

---

## Part 5: Verify CODEOWNERS Integration (1 minute)

### Step 5.1: Check CODEOWNERS File

1. Visit: `.github/CODEOWNERS` in repository
2. Should contain ownership rules for:
   - Stripe integration (`src/lib/stripe/`)
   - Firebase Admin (`src/lib/firebase/admin.ts`)
   - Firestore rules (`firestore.rules`)
   - API routes (`src/app/api/`)
   - CI workflows (`.github/workflows/`)
   - Security docs (`docs/SECURITY.md`, `docs/FIRESTORE_RULES_SPEC.md`)
   - Analytics (`docs/ANALYTICS_SCHEMA.md`)

### Step 5.2: Verify Auto-Request

1. Create test PR touching protected file:
   ```bash
   git checkout -b feat/TEST-002-codeowners
   echo "# Test" >> src/lib/stripe/config.ts
   git add src/lib/stripe/config.ts
   git commit -m "test: Verify CODEOWNERS"
   git push origin feat/TEST-002-codeowners
   ```
2. Create PR on GitHub
3. **Expected**: You (code owner) auto-requested as reviewer

**Result**: CODEOWNERS working and enforced

---

## Part 6: Final Verification (2 minutes)

### Step 6.1: Comprehensive Smoke Test

Create a test PR that triggers all guardrails:

```bash
# 1. Create valid branch (tests branch naming)
git checkout -b feat/VERIFY-999-complete-setup

# 2. Make change to protected file (tests CODEOWNERS)
echo "// Test comment" >> src/lib/stripe/config.ts

# 3. Commit with valid message (tests commit format)
git add src/lib/stripe/config.ts
git commit -m "test: Verify complete repository setup"

# 4. Push to remote
git push origin feat/VERIFY-999-complete-setup

# 5. Create PR on GitHub
```

### Step 6.2: Expected PR Behavior

When PR is created, verify:

- ✅ **Branch name accepted** (feat/VERIFY-999-complete-setup)
- ✅ **CODEOWNERS triggered** (you auto-requested as reviewer)
- ✅ **Copilot review** (comment appears within 2 min)
- ✅ **5 CI checks run**:
  1. `validate-branch` ✅ (branch name valid)
  2. `build (20.x)` ✅ (production build succeeds)
  3. `First-load JS (Playwright)` ✅ (≤ 300 KB)
  4. `Accessibility Tests` ✅ (no WCAG violations)
  5. `CodeQL` ✅ (no security issues)
- ✅ **Merge blocked** (until 1 approval + all checks green)

### Step 6.3: Test Enforcement

Try invalid operations (should fail):

1. **Invalid branch name**:
   ```bash
   git checkout -b bad-branch-name
   git push origin bad-branch-name
   # Expected: Blocked by branch creation restriction
   ```

2. **Force push to main**:
   ```bash
   git checkout main
   git commit --allow-empty -m "test"
   git push --force origin main
   # Expected: Blocked by force push protection
   ```

3. **Merge without approval**:
   - Go to test PR
   - Click "Merge pull request" (without approval)
   - **Expected**: Merge button disabled with error message

### Step 6.4: Cleanup Test PRs

After verification succeeds:

```bash
# Delete test branches
git checkout main
git branch -D feat/TEST-001-copilot-test feat/TEST-002-codeowners feat/VERIFY-999-complete-setup
git push origin --delete feat/TEST-001-copilot-test feat/TEST-002-codeowners feat/VERIFY-999-complete-setup

# Close test PRs on GitHub (or merge if you want commit history)
```

**Result**: All guardrails verified and working

---

## Summary: What's Now Enforced

| Protection                  | Enforcement Mechanism              | Bypass Allowed? |
|-----------------------------|-------------------------------------|-----------------|
| **Branch naming**           | Ruleset creation restriction        | No              |
| **Commit format**           | Ruleset commit message pattern      | No              |
| **PR required**             | Ruleset branch protection           | Admin only      |
| **Code owner review**       | Ruleset + CODEOWNERS file           | Admin only      |
| **1 approval minimum**      | Ruleset approval requirement        | Admin only      |
| **5 CI checks pass**        | Ruleset status check requirement    | No              |
| **Copilot review**          | Auto-triggered on new PRs           | Optional        |
| **Bundle budget ≤ 300 KB**  | CI check (First-load JS)            | No              |
| **Accessibility (WCAG)**    | CI check (axe-core)                 | No              |
| **Security (CodeQL)**       | CI check + Security tab alerts      | No              |
| **Secret detection**        | Push protection (blocks commits)    | Bypassable*     |
| **Dependency alerts**       | Dependabot alerts + auto-PRs        | N/A             |

*Secret push protection can be bypassed by contributor, but bypass is logged.

---

## Troubleshooting

### "Required status checks not available in dropdown"

**Cause**: Checks haven't run yet, so GitHub doesn't know they exist.

**Fix**:
1. Create a test PR to trigger all checks
2. Wait for all 5 checks to complete (3-5 minutes)
3. Edit ruleset → Add checks (should now appear in dropdown)

### "CODEOWNERS not triggering review requests"

**Cause**: "Require review from Code Owners" not enabled OR file syntax error.

**Fix**:
1. Verify `.github/CODEOWNERS` syntax:
   ```bash
   # Each line: <pattern> <owner>
   src/lib/stripe/ @RazonIn4K
   ```
2. Edit ruleset → Enable "Require review from Code Owners"
3. Test with PR touching protected path

### "Copilot review not appearing"

**Cause**: Feature not enabled OR `.github/copilot-instructions.md` missing.

**Fix**:
1. Verify file exists: `ls .github/copilot-instructions.md`
2. Settings → Copilot → Code review → Enable "Automatically on new PRs"
3. Create **new PR** (Copilot doesn't review existing PRs retroactively)

### "CodeQL not running"

**Cause**: Setup incomplete OR no code changes triggering workflow.

**Fix**:
1. Security → Code scanning → Set up → Default
2. Wait 2-3 minutes for initial scan
3. Check Actions tab for "CodeQL" workflow
4. Create PR with code change to trigger

### "Branch name validation not blocking invalid names"

**Cause**: Ruleset not active OR pattern incorrect.

**Fix**:
1. Settings → Rules → Rulesets → Verify `main-branch-protection` is **Active**
2. Check pattern: `^(feat|fix|perf|sec|docs|test|refactor|ci|build)/[A-Z]+-\d{3,}-[a-z0-9-]+$`
3. Test locally: `[[ "feat/UI-001-test" =~ <pattern> ]] && echo OK`

### "CI checks failing in all PRs"

**Cause**: Environment variables missing OR build configuration issue.

**Fix**:
1. Check `.github/workflows/ci.yml` has mock env vars for CI
2. Run locally: `npm ci && npm run build && npm run lint`
3. Check Actions tab → Failed job → View logs
4. Common issues:
   - Missing `wait-on` dependency (fixed in latest package.json)
   - Playwright browsers not installed (CI installs via `--with-deps`)
   - Firebase Admin fallback not working (check `FIREBASE_PRIVATE_KEY` format)

---

## Maintenance Schedule

| Task                        | Frequency    | Action                                      |
|-----------------------------|--------------|---------------------------------------------|
| **Review Dependabot PRs**   | Weekly       | Approve/merge security + version updates    |
| **Check CodeQL alerts**     | Weekly       | Security tab → Fix critical/high issues     |
| **Update Copilot guidelines** | Quarterly  | Edit `.github/copilot-instructions.md`      |
| **Review CODEOWNERS**       | Quarterly    | Update ownership as team/codebase grows     |
| **Audit bypass logs**       | Monthly      | Settings → Rules → Bypass log               |
| **Test secret scanning**    | Quarterly    | Try pushing fake secret, verify blocked     |

---

## Next Steps

1. **Merge pending Dependabot PRs**:
   - Visit open PRs (likely #6, #7)
   - Verify labels applied (`automated`, `ci`)
   - Approve → Merge when checks pass

2. **Enable auto-merge for Dependabot** (optional):
   - Settings → Actions → General → Allow GitHub Actions to create and approve PRs
   - Dependabot PRs will auto-merge when checks pass

3. **Create GitHub Project Board** (optional):
   - Projects → New project → Board
   - Automate: Issues labeled `bug` → To Do column
   - Track roadmap progress visually

4. **Configure deployment** (when ready):
   - Add Vercel deployment via GitHub integration
   - Add "Deployment succeeded" as 6th required check
   - Update ruleset to require deployment success

---

## Related Documentation

- [.github/SETTINGS_QUICK_START.md](./.github/SETTINGS_QUICK_START.md) - 10-minute quick reference
- [docs/REPOSITORY_GUARDRAILS.md](./REPOSITORY_GUARDRAILS.md) - Complete technical guide
- [docs/AI_TOOLING_SETUP.md](./AI_TOOLING_SETUP.md) - AI tool integration (Claude, Copilot, CI)
- [docs/TESTING.md](./TESTING.md) - Testing strategy and commands
- [docs/SECURITY.md](./SECURITY.md) - Security policies and threat model
- [.github/CODEOWNERS](./.github/CODEOWNERS) - Code ownership matrix
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Copilot review standards

---

**Setup Complete!** Your repository now has:

✅ Automated code review (Copilot)
✅ Security scanning (CodeQL, Dependabot, Secret Scanning)
✅ Quality gates (bundle budget, accessibility, type safety)
✅ Branch protection (naming, approvals, status checks)
✅ Code ownership enforcement
✅ Evidence-based workflow (CI artifacts, test reports)

**Total Setup Time**: ~15 minutes
**Ongoing Maintenance**: ~30 minutes/week (reviewing Dependabot PRs, triaging CodeQL alerts)
