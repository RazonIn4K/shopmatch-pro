# Phase 3: Pull Request Triage (10 Minutes)

**Status**: Ready after Phase 2 complete
**Prerequisites**: ✅ Labels created, ✅ Branch validation updated (commit `d7130a6`)
**Current State**: 8 open PRs (3 Dependabot, 5 manual)

---

## Overview

**What to do**:
1. Merge 3 Dependabot PRs (dependency updates)
2. Close 5 manual PRs (superseded by main branch commits)

**Why this is safe**:
- Dependabot PRs: Auto-generated, small scope, CI-tested
- Manual PRs: Content already integrated into `main` via commits `091ae30`, `3b1cf8c`, `e852e2f`, `d7130a6`

---

## Step 1: Check Dependabot PR Status (2 min)

### 1.1 Verify CI Re-Runs Triggered

After merging commit `d7130a6` (Dependabot branch exemption), GitHub should automatically re-run CI on all open PRs.

**Check status**:
```bash
gh pr checks 6 --watch
gh pr checks 7 --watch
gh pr checks 8 --watch
```

**Expected Output**:
```
✓ validate-branch      # Now SUCCESS (was FAILURE)
✓ build (18.x)
✓ build (20.x)
✓ accessibility        # May be SKIPPED (runs after build)
```

**If still FAILURE**: CI may not have auto-re-run yet. Force re-run:
```bash
# Close and reopen to trigger CI (last resort)
gh pr close 6 && gh pr reopen 6
gh pr close 7 && gh pr reopen 7
gh pr close 8 && gh pr reopen 8
```

### 1.2 Wait for Checks to Pass

**Timing**: 3-5 minutes for all checks to complete

**Monitor in browser**:
- Visit: https://github.com/RazonIn4K/shopmatch-pro/pulls
- Each PR should show green checkmark when ready

**Check-by-check status**:
- `validate-branch`: ✅ SUCCESS (skipped for `dependabot/*` branches)
- `build (18.x)`: ✅ SUCCESS
- `build (20.x)`: ✅ SUCCESS
- `Accessibility Tests`: ✅ SUCCESS or SKIPPED (needs build to pass first)

**Note**: FOSSA "Dependency Quality" may show ERROR (non-blocking third-party service)

---

## Step 2: Merge Dependabot PRs (3 min)

### 2.1 PR #6: actions/checkout@v5

**What it does**: Updates GitHub Actions checkout action to v5 (Node 24 support)

**Command**:
```bash
gh pr merge 6 --squash --delete-branch --body "Updates actions/checkout to v5 for Node 24 compatibility. Auto-merged Dependabot update."
```

**Verification**:
```bash
# Check merge succeeded
gh pr view 6 --json state,mergedAt
# Expected: {"state":"MERGED","mergedAt":"2025-10-15T..."}
```

### 2.2 PR #7: actions/setup-node@v6

**What it does**: Updates GitHub Actions setup-node action to v6

**Command**:
```bash
gh pr merge 7 --squash --delete-branch --body "Updates actions/setup-node to v6. Auto-merged Dependabot update."
```

### 2.3 PR #8: @stripe/stripe-js@8.1.0

**What it does**: Updates Stripe client SDK from 8.0.0 to 8.1.0

**Command**:
```bash
gh pr merge 8 --squash --delete-branch --body "Updates @stripe/stripe-js to 8.1.0 (patch release with bug fixes). Auto-merged Dependabot update."
```

**Why --squash**:
- Keeps commit history clean (1 commit per dependency update)
- Dependabot PRs typically have 1 commit anyway
- Maintains linear history (required by branch protection)

**Verification**:
```bash
# All PRs merged
gh pr list --state merged --limit 5

# Local main is behind
git pull origin main

# package.json updated
grep "@stripe/stripe-js" package.json
# Expected: "@stripe/stripe-js": "^8.1.0"
```

---

## Step 3: Close Manual PRs (5 min)

All manual PRs (#1-5) are superseded by work already merged to `main`.

### 3.1 PR #1: FOSSA License Scan Report

**Status**: External contributor (fossabot)
**Content**: Adds FOSSA badge and license compliance scanning

**Decision**: Close (prefer GitHub native Dependabot + CodeQL)

**Command**:
```bash
gh pr close 1 --comment "Thank you for the contribution! Closing in favor of GitHub's native security features:
- Dependabot (dependency alerts + security updates)
- CodeQL (security vulnerability scanning)
- Secret Scanning (credential detection)

FOSSA provides valuable license compliance tracking, but for this project we'll rely on GitHub's integrated tools. We can re-evaluate FOSSA if license compliance becomes a priority.

Appreciate the automated setup!"
```

### 3.2 PR #2: Branch/Commit/PR Conventions

**Branch**: `docs/CONTRIB-001-branch-convs`
**Content**: Establishes branch naming and PR conventions

**Why Superseded**: Content integrated in commits:
- `091ae30`: CODEOWNERS, Copilot instructions, PR template
- `3b1cf8c`: Environment docs, verification checklists
- `e852e2f`: GitHub setup guide, Copilot integration

**Command**:
```bash
gh pr close 2 --comment "✅ Superseded by commits 091ae30, 3b1cf8c, and e852e2f.

**What's now in main**:
- Branch naming conventions: docs/CONTRIBUTING.md + CI validation (.github/workflows/ci.yml)
- PR template: .github/pull_request_template.md with DoR/DoD checklist
- Code review standards: .github/copilot-instructions.md

All content from this PR has been integrated. Thank you for the initial work!"
```

### 3.3 PR #3: Branch Name Validation (CI)

**Branch**: `ci/CONTRIB-001-branch-validation`
**Content**: Adds GitHub Actions workflow to validate branch naming

**Why Superseded**: Validation already active via commits:
- `091ae30`: Initial CI workflow with branch validation job
- `d7130a6`: Enhanced validation with Dependabot exemption

**Command**:
```bash
gh pr close 3 --comment "✅ Superseded by commits 091ae30 and d7130a6.

**Current state**:
- Branch validation active in .github/workflows/ci.yml
- Regex enforces type/ID-slug format (e.g., feat/UI-001-description)
- Dependabot branches automatically exempted
- Running on all PRs to main branch

Branch protection ruleset (main-branch-protection) now requires this check to pass. Closing as complete."
```

### 3.4 PR #4: Document AI Review Workflow

**Branch**: `docs/CONTRIB-001-ai-review-doc`
**Content**: Documents AI-powered review workflow (Codex, Copilot, Jules, Stitch)

**Why Superseded**: Documentation complete in:
- `e852e2f`: docs/AI_TOOLING_SETUP.md (500+ lines)
- `e852e2f`: docs/GITHUB_SETUP_GUIDE.md (600+ lines)

**Command**:
```bash
gh pr close 4 --comment "✅ Documentation complete in commit e852e2f.

**Files added**:
- docs/AI_TOOLING_SETUP.md: Complete AI tool integration guide (Claude, Copilot, CI gates)
- docs/GITHUB_SETUP_GUIDE.md: Step-by-step repository setup with troubleshooting
- .github/SETTINGS_QUICK_START.md: 10-minute quick reference

Workflow is fully documented with:
- AI persona prompts (PM, Tech Lead, QA, Security, Pair Programmer, Researcher)
- SHOOT→SKIN methodology (System, Hooks, Observability, Operations, Tests → Synthesis, Knowledge, Insights, Notes)
- Quality gates and evidence requirements

Closing as complete."
```

### 3.5 PR #5: GitHub Copilot Custom Instructions

**Branch**: `docs/CONTRIB-002-copilot-guide`
**Content**: Adds Copilot custom instructions for code review

**Why Superseded**: Copilot instructions committed in:
- `e852e2f`: .github/copilot-instructions.md (233 lines with 8 review standards)

**Command**:
```bash
gh pr close 5 --comment "✅ Copilot instructions committed in e852e2f.

**What's in main**:
- .github/copilot-instructions.md: 8 review standards (type safety, security, performance, accessibility, error handling, code quality, testing, documentation)
- Copilot auto-review enabled in repository settings
- Integration documented in docs/GITHUB_SETUP_GUIDE.md

Closing as complete. Copilot will now automatically review all new PRs using these guidelines."
```

---

## Step 4: Verify Clean State (1 min)

**Check open PRs**:
```bash
gh pr list --state open
```

**Expected Output**:
```
no pull requests match your search
```

**Check main branch**:
```bash
git checkout main
git pull origin main
git log --oneline -5
```

**Expected Output** (recent commits):
```
1ded310 chore: Add firestore.indexes.json to CODEOWNERS
d7130a6 ci: Allow Dependabot branches to bypass naming convention
e852e2f docs: Add comprehensive GitHub setup guide and environment template
3e711b3 ci: Simplify accessibility job to use committed test files
9ed0791 test: Add Playwright E2E baseline with accessibility testing
```

---

## Checkpoint After Phase 3

**PR Status**:
- [ ] 3 Dependabot PRs merged (actions/checkout@v5, actions/setup-node@v6, @stripe/stripe-js@8.1.0)
- [ ] 5 manual PRs closed with explanatory comments
- [ ] 0 open PRs remaining
- [ ] `main` branch includes all 3 dependency updates

**Repository State**:
- [ ] package.json updated with new dependency versions
- [ ] Local main branch synced with origin/main
- [ ] CI passing on latest main commit

**Evidence**:
```bash
# Verify dependency versions
grep -E "actions/(checkout|setup-node)@" .github/workflows/ci.yml
# Expected: checkout@v5, setup-node@v6

grep "@stripe/stripe-js" package.json
# Expected: "^8.1.0"
```

---

## Troubleshooting

### "Dependabot PR still failing validate-branch"

**Cause**: CI didn't auto-re-run after `d7130a6` merge

**Fix**:
```bash
# Force re-run by closing and reopening
gh pr close 6 && gh pr reopen 6
```

### "Can't merge PR - checks required but not present"

**Cause**: Branch protection ruleset requires checks that haven't run yet

**Fix**:
1. Temporarily disable ruleset enforcement:
   - Settings → Rules → Edit `main-branch-protection`
   - Change enforcement to "Disabled" or "Evaluate"
2. Merge PRs
3. Re-enable enforcement

**Better approach**: Wait 5 minutes for checks to complete

### "gh pr merge fails with 'not mergeable'"

**Cause**: PR has conflicts OR checks haven't passed

**Fix**:
```bash
# Check PR status
gh pr view 6 --json mergeable,statusCheckRollup

# If conflicts: rebase
gh pr checkout 6
git rebase main
git push --force-with-lease

# If checks failing: wait or debug
gh pr checks 6
```

---

## Next Step

After completing Phase 3 → Proceed to **Phase 5: Local Verification**

**Skip Phase 4** (.env.test already exists from earlier work)

Commands for Phase 5:
```bash
npm run lint
npx tsc --noEmit
npm run build
npm start &
npx wait-on http://localhost:3000
FIRST_LOAD_BUDGET_KB=300 node scripts/ci/measure-first-load.mjs
npm run test:a11y
kill %1
```
