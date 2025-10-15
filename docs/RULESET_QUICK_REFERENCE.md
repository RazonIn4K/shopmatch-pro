# GitHub Ruleset Quick Reference Card

**Use this for copy-paste when creating the ruleset in GitHub GUI**

---

## Basic Settings

```
Ruleset Name: ShopMatch Pro - Main Branch Protection
Enforcement Status: Active
Target Branches: Include by pattern → main
```

---

## Required Status Checks (Add these exact names)

**IMPORTANT**: Job names must match EXACTLY (including capitalization and spacing)

```
1. Validate Branch Name
2. Build and Test
3. Accessibility Testing
4. Measure first-load JS (Playwright)
```

**Note**: When the GUI shows matrix jobs, you may see:
- `Build and Test (18.x)`
- `Build and Test (20.x)`

**Add only**: `Build and Test (20.x)` to reduce duplicate checks

---

## Regex Patterns (Copy-Paste Ready)

### Branch Name Pattern
```regex
^(feat|fix|perf|sec|docs|test|refactor|ci|build)\/[A-Z]+-\d{3,}-[a-z0-9-]+$
```

**Valid Examples**:
- ✓ `feat/UI-001-dashboard-layout`
- ✓ `fix/MP-127-auth-bug`
- ✓ `sec/SEC-015-webhook-validation`

**Invalid Examples**:
- ✗ `feature-branch` (no type/ID format)
- ✗ `feat/bug-1` (ID needs 3+ digits)
- ✗ `FEAT/UI-001-test` (type must be lowercase)

---

### Commit Message Pattern (Conventional Commits)
```regex
^(feat|fix|perf|sec|docs|test|refactor|ci|build)(\(\S+\))?:\s.+$
```

**Valid Examples**:
- ✓ `feat: add CSV export`
- ✓ `fix(auth): resolve redirect loop`
- ✓ `perf: optimize query`

**Invalid Examples**:
- ✗ `Added new feature` (no type prefix)
- ✗ `Fix bug` (no colon after type)
- ✗ `WIP` (not conventional format)

---

### Pull Request Title Pattern
```regex
^\[[A-Z]+-\d{3,}\]\s.+$
```

**Valid Examples**:
- ✓ `[UI-001] Add performance dashboard`
- ✓ `[MP-127] Fix authentication bug (L6)`
- ✓ `[SEC-015] Implement webhook rate limiting`

**Invalid Examples**:
- ✗ `New feature` (no ticket ID)
- ✗ `UI-001: Dashboard` (wrong format - needs brackets)
- ✗ `[ui-001] test` (ID must be uppercase)

---

## Checkboxes to Enable

### Pull Request Settings
- ✅ Require a pull request before merging
- ✅ Required approvals: **1**
- ✅ Dismiss stale pull request approvals
- ✅ Require review from Code Owners
- ✅ Require approval of the most recent reviewable push

### Status Checks
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

### Other Protections
- ✅ Block force pushes
- ✅ Require linear history

### Copilot (if available)
- ✅ Automatically request review from GitHub Copilot

---

## Security Settings (Settings → Security)

### Code Scanning
```
Enable: CodeQL analysis → Default setup
Languages: JavaScript/TypeScript (auto-detected)
Trigger: Push and pull request
```

### Dependabot
```
✅ Enable Dependabot alerts
✅ Enable Dependabot security updates
Note: Version updates configured in .github/dependabot.yml
```

### Secret Scanning
```
✅ Enable Secret scanning
✅ Enable Push protection
```

---

## Verification Commands (Run After Setup)

### Test Invalid Branch Name (Should FAIL)
```bash
git checkout -b invalid-branch-name
git push origin invalid-branch-name
# Create PR → should see validation error
```

### Test Valid Branch Name (Should PASS)
```bash
git checkout -b test/VERIFY-001-guardrails-working
echo "test" > TEST.md
git add TEST.md
git commit -m "test: verify repository guardrails"
git push origin test/VERIFY-001-guardrails-working
# Create PR → should see all checks passing
```

### Verify CODEOWNERS
```bash
# Check file exists and is committed
cat .github/CODEOWNERS

# Check GitHub recognized it
# Navigate to: Settings → Code owners
# Should show: .github/CODEOWNERS with path assignments
```

---

## Common Mistakes to Avoid

1. ❌ **Wrong job names in required checks**
   - Use EXACT names from CI workflow
   - `Build and Test (20.x)` not `build (20.x)`

2. ❌ **Missing regex anchors (^ and $)**
   - Always include ^ at start and $ at end
   - Otherwise pattern matches anywhere in string

3. ❌ **Forgetting to set ruleset to "Active"**
   - Default is "Disabled" - must change to "Active"

4. ❌ **Not waiting for CI to run first**
   - Create at least one PR to populate check names
   - Then add them to ruleset

5. ❌ **Typos in CODEOWNERS file**
   - GitHub username must start with @
   - Path patterns are case-sensitive
   - File must be committed to main branch

---

## Quick Test Procedure

After completing GUI setup, run this 5-minute test:

```bash
# 1. Create valid test branch
git checkout -b feat/TEST-001-verify-guardrails
echo "# Guardrails Test" > GUARDRAILS_TEST.md
git add GUARDRAILS_TEST.md

# 2. Commit with valid message
git commit -m "test: verify all repository guardrails are working"

# 3. Push to remote
git push origin feat/TEST-001-verify-guardrails

# 4. Create PR with valid title
# Title: [TEST-001] Verify repository guardrails

# 5. Verify in PR:
# ✅ validate-branch check appears and passes
# ✅ build, accessibility, first-load checks run
# ✅ Code owner (@RazonIn4K) auto-requested
# ✅ Copilot auto-review triggers (wait 2-3 min)
# ✅ PR template shows DoR/DoD checklists
# ✅ Can't merge until all checks pass

# 6. Test invalid branch name
git checkout -b invalid-name
git push origin invalid-name
# Create PR → should fail validation

# 7. Clean up
git checkout main
git branch -D feat/TEST-001-verify-guardrails invalid-name
```

---

## Support & Troubleshooting

**If checks not appearing**:
1. Wait 1-2 minutes after creating PR
2. Refresh the PR page
3. Check CI workflow triggered (Actions tab)
4. Verify job names match exactly

**If code owners not requested**:
1. Verify CODEOWNERS file committed to main
2. Check Settings → Code owners shows the file
3. Wait 1-2 minutes for GitHub to index
4. Ensure GitHub username is correct: @RazonIn4K

**If Copilot not reviewing**:
1. Check Settings → Copilot → Code review is enabled
2. Verify "Automatic" mode selected
3. Wait 3-5 minutes (async process)
4. Check repository has Copilot access

---

## Next Actions After Verification

1. ✅ Close test PR
2. ✅ Delete test branches
3. ✅ Create first real feature using AI workflow (CLAUDE.md)
4. ✅ Monitor Dependabot PRs (will start appearing within 24 hours)
5. ✅ Review first Copilot comments and adjust if needed

---

**Quick Reference Version**: 1.0
**Last Updated**: 2025-10-15
**Print This Page**: Keep handy during GitHub GUI setup
