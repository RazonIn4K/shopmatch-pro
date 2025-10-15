# GitHub GUI Setup Checklist

**Purpose**: Step-by-step guide to complete GitHub repository configuration through the web interface.

**Estimated Time**: 30-45 minutes total

**Status**: Use this checklist to track your progress through the GUI configuration.

---

## ✅ Setup Checklist Overview

- [ ] **Step 1**: Create Branch Ruleset (15 min) - MOST IMPORTANT
- [ ] **Step 2**: Enable Security Features (10 min)
- [ ] **Step 3**: Enable GitHub Copilot Code Review (5 min)
- [ ] **Step 4**: Verify Configuration (10 min)

---

## Step 1: Create Branch Ruleset (Settings → Rules → Rulesets)

**Current Location**: You are already on the "Create a branch ruleset" page

### A. Basic Configuration

```
Ruleset Name: ShopMatch Pro - Main Branch Protection
Enforcement status: Active (change from "Disabled")
```

### B. Target Branches

```
Click "Add target"
→ Select "Include by pattern"
→ Pattern: main
→ Click outside to save
```

### C. Branch Protections - Enable These Rules

Scroll down and enable the following (check each box):

#### 1. Restrict creations ✅
- **Purpose**: Enforce branch naming convention
- **Pattern**: `^(feat|fix|perf|sec|docs|test|refactor|ci|build)\/[A-Z]+-\d{3,}-[a-z0-9-]+$`
- **Click**: "Restrict creations" checkbox
- **Click**: "Restrict branch names" sub-checkbox
- **Enter pattern** in the text field

**Valid branch names**:
- ✓ `feat/UI-001-dashboard-layout`
- ✓ `fix/MP-127-auth-redirect-bug`
- ✓ `sec/SEC-015-stripe-webhook`

#### 2. Require a pull request before merging ✅
- **Check**: "Require a pull request before merging"
- **Set**: "Required number of approvals before merging" = **1**
- **Check**: "Dismiss stale pull request approvals when new commits are pushed"
- **Check**: "Require review from Code Owners"
- **Check**: "Require approval of the most recent reviewable push"

#### 3. Require status checks to pass ✅
- **Check**: "Require status checks to pass before merging"
- **Check**: "Require branches to be up to date before merging"
- **Click**: "Add checks" button
- **Enter these check names** (one at a time, press Enter after each):
  1. `validate-branch`
  2. `build (20.x)` (exact name including the version)
  3. `accessibility`
  4. `Measure first-load JS (Playwright)` (exact capitalization)

**Note**: These names must match exactly what appears in `.github/workflows/ci.yml`

#### 4. Block force pushes ✅
- **Check**: "Block force pushes"

#### 5. Require linear history ✅
- **Check**: "Require linear history"
- **Purpose**: Prevents merge commits, keeps git history clean

#### 6. Require deployments to succeed ⚠️ SKIP
- **DO NOT check** - We don't have deployment environments configured yet

#### 7. Require signed commits ⚠️ OPTIONAL
- **Check**: Only if you want to require GPG-signed commits
- **Recommended**: Skip for now unless you have GPG keys configured

### D. Metadata Restrictions (NEW - GitHub recently added this)

#### Commit Message Pattern ✅
- **Check**: "Require matching commit message"
- **Pattern**: `^(feat|fix|perf|sec|docs|test|refactor|ci|build)(\(\S+\))?:\s.+$`
- **Purpose**: Enforces Conventional Commits format

**Valid commit messages**:
- ✓ `feat: add CSV export for applications`
- ✓ `fix(auth): resolve redirect loop`
- ✓ `perf: optimize Firestore query`

#### Pull Request Title Pattern ✅
- **Check**: "Require matching pull request title"
- **Pattern**: `^\[[A-Z]+-\d{3,}\]\s.+$`
- **Purpose**: Ensures PR title includes ticket ID

**Valid PR titles**:
- ✓ `[UI-001] Add performance dashboard`
- ✓ `[MP-127] Fix authentication bug`

### E. Additional Settings

#### Code Scanning (if available)
- **Check**: "Require code scanning results" (if GitHub Advanced Security is enabled)
- **Tool**: CodeQL
- **Security alert threshold**: None (block on any alerts)

#### Copilot Auto-Review
- **Check**: "Automatically request review from GitHub Copilot"
- **Purpose**: Triggers automatic AI code review on every PR

### F. Save Ruleset

- **Scroll to bottom**
- **Click**: "Create" button
- **Verify**: Ruleset appears in the list with "Active" status

---

## Step 2: Enable Security Features (Settings → Security)

**Navigation**: Click "Security" in left sidebar (under "Code and automation")

### A. Code Scanning (CodeQL)

```
Location: Settings → Security → Code security and analysis → Code scanning

1. Find "Code scanning" section
2. Click "Set up" button next to "CodeQL analysis"
3. Select "Default" (recommended)
4. Configuration:
   - Languages: JavaScript/TypeScript (auto-detected)
   - Query suite: Default
   - Events: Push and pull request
5. Click "Enable CodeQL"
6. Verify: Status changes to "Enabled"
```

**What it does**:
- Scans code on every push and PR
- Detects 300+ types of security vulnerabilities
- Automatically creates alerts in Security tab
- Can block PRs if critical issues found (configured in ruleset)

### B. Dependabot Alerts & Updates

```
Location: Settings → Security → Code security and analysis → Dependabot

1. Find "Dependabot alerts" section
2. Click "Enable" button
3. Find "Dependabot security updates" section
4. Click "Enable" button
5. Verify: Both show "Enabled" status

Note: Dependabot version updates are already configured via .github/dependabot.yml
```

**What it does**:
- **Alerts**: Notifies when dependencies have known vulnerabilities
- **Security Updates**: Automatically creates PRs to patch vulnerable dependencies
- **Version Updates**: Creates PRs for routine updates (configured in `.github/dependabot.yml`)

### C. Secret Scanning with Push Protection

```
Location: Settings → Security → Code security and analysis → Secret scanning

1. Find "Secret scanning" section
2. Click "Enable" button
3. Find "Push protection" section (appears after enabling secret scanning)
4. Click "Enable" button
5. Verify: Both show "Enabled" status
```

**What it does**:
- Scans commits for exposed secrets (API keys, tokens, private keys)
- **Push Protection**: Blocks pushes containing secrets
- Developer must remove secret or request bypass (logged for audit)

**What gets detected**:
- Stripe API keys
- Firebase service account keys
- GitHub tokens
- AWS credentials
- Private SSH keys
- Database connection strings

---

## Step 3: Enable GitHub Copilot Code Review (Settings → Copilot)

**Navigation**: Click "Copilot" in left sidebar (if available)

```
Location: Settings → Copilot → Code review

1. Find "Code review" section
2. Toggle "Enable GitHub Copilot code review" to ON
3. Select mode: "Automatic" (reviews all PRs automatically)
4. Verify: Status shows "Enabled"
5. Custom instructions file: Automatically uses .github/copilot-instructions.md
```

**What it does**:
- Automatically reviews every PR using AI
- Follows guidelines in `.github/copilot-instructions.md`
- Comments on PRs with suggestions, issues, and improvements
- 8 review standards: type safety, security, performance, accessibility, etc.

**If Copilot option not visible**:
- Your repository might not have GitHub Copilot access
- Check with your GitHub organization admin
- Or: This feature may require GitHub Team/Enterprise plan

---

## Step 4: Verify Configuration (10 min)

### A. Check Branch Protection Status

```
Navigate to: Settings → Rules → Rulesets

Verify:
✅ "ShopMatch Pro - Main Branch Protection" ruleset exists
✅ Status is "Active" (not "Disabled")
✅ Target branches: main
✅ Number of rules: 7-10 (depending on what you enabled)
```

### B. Check Security Features Status

```
Navigate to: Settings → Security → Code security and analysis

Verify:
✅ Code scanning: Enabled with CodeQL
✅ Dependabot alerts: Enabled
✅ Dependabot security updates: Enabled
✅ Secret scanning: Enabled
✅ Push protection: Enabled
```

### C. Check Code Owners File

```
Navigate to: Settings → Code owners

Verify:
✅ CODEOWNERS file is recognized
✅ Shows: ".github/CODEOWNERS"
✅ Code owners listed for each path pattern
```

**If CODEOWNERS not showing**:
1. Verify file exists: `.github/CODEOWNERS`
2. Check file is committed to `main` branch
3. Wait 1-2 minutes for GitHub to index it
4. Refresh the page

### D. Test Branch Validation

Create a test branch with invalid name to verify validation works:

```bash
# This should FAIL when you try to create a PR
git checkout -b test-invalid-name
echo "test" > TEST.md
git add TEST.md
git commit -m "test: verify branch validation"
git push origin test-invalid-name

# Open PR - should see error: "Branch name does not match required format"
```

Create a test branch with valid name:

```bash
# This should PASS
git checkout -b test/VERIFY-001-guardrails-working
git push origin test/VERIFY-001-guardrails-working

# Open PR - should see:
# ✅ validate-branch check passes
# ✅ Code owners automatically requested
# ✅ Copilot auto-review triggers (within 2-3 min)
# ✅ Required checks list populated
```

---

## Troubleshooting Common Issues

### Issue: Required checks not appearing

**Symptoms**: Ruleset created but required checks show as "Expected" and never run

**Solution**:
1. Verify job names in `.github/workflows/ci.yml` match exactly
2. Check workflow triggers on `pull_request` events
3. Wait for one PR to trigger CI, then checks will appear in ruleset
4. Edit ruleset and re-add the check names if needed

### Issue: Branch name validation not working

**Symptoms**: Invalid branch names are not blocked

**Solution**:
1. Verify regex pattern in ruleset matches: `^(feat|fix|perf|sec|docs|test|refactor|ci|build)\/[A-Z]+-\d{3,}-[a-z0-9-]+$`
2. Check "Restrict creations" is enabled
3. Check "Restrict branch names" sub-option is checked
4. Wait 1-2 minutes for ruleset to take effect

### Issue: Code owners not auto-requested

**Symptoms**: PR created but code owner not requested for review

**Solution**:
1. Verify `.github/CODEOWNERS` file exists and is committed
2. Check "Require review from Code Owners" is enabled in ruleset
3. Verify file paths in PR match patterns in CODEOWNERS
4. Check GitHub username in CODEOWNERS is correct: `@RazonIn4K`

### Issue: Copilot review not running

**Symptoms**: Copilot doesn't comment on PR

**Solution**:
1. Verify Copilot is enabled in Settings → Copilot
2. Check `.github/copilot-instructions.md` file exists
3. Ensure "Automatic" mode is selected
4. Wait 2-5 minutes (Copilot reviews are asynchronous)
5. Check repository has access to GitHub Copilot

### Issue: Secret scanning blocking valid test data

**Symptoms**: Push blocked for mock keys or test credentials

**Solution**:
1. Verify it's actually test data (NEVER bypass real secrets!)
2. Use bypass procedure: GitHub will ask for a reason, it will be logged
3. Consider using environment variables instead of hardcoding
4. Use clearly marked mock formats: `sk_test_MOCK_KEY_EXAMPLE`

---

## Post-Setup Verification Checklist

Use this final checklist to confirm everything is working:

### Branch Protection
- [ ] Ruleset active for `main` branch
- [ ] Branch naming regex enforced (tested with invalid name)
- [ ] Commit message regex enforced (tested with invalid format)
- [ ] PR title regex enforced (tested with invalid format)
- [ ] Required checks configured (4-5 checks listed)
- [ ] Code owner approval required
- [ ] Copilot auto-review enabled
- [ ] Force push blocked
- [ ] Linear history required

### Security
- [ ] CodeQL scanning enabled
- [ ] CodeQL scans triggered on PR
- [ ] Dependabot alerts enabled
- [ ] Dependabot security updates enabled
- [ ] Dependabot version updates working (check for PRs)
- [ ] Secret scanning enabled
- [ ] Push protection enabled
- [ ] Secret scanning tested (no false positives blocking)

### Code Owners
- [ ] CODEOWNERS file recognized (Settings → Code owners)
- [ ] Code owners auto-requested on PR
- [ ] Critical paths covered (Stripe, Firebase, API, CI)

### Copilot
- [ ] Copilot code review enabled
- [ ] Automatic mode selected
- [ ] Custom instructions file loaded
- [ ] Copilot commented on test PR (wait 2-5 min)

### End-to-End Test
- [ ] Created test PR with valid branch name
- [ ] All required checks appeared and ran
- [ ] Code owner auto-requested
- [ ] Copilot reviewed within 5 minutes
- [ ] PR template showed DoR/DoD checklist
- [ ] Evidence sections present in template

---

## Next Steps After Setup

Once all items above are checked:

1. **Create Your First Real Feature PR**
   - Use a real ticket ID (e.g., `feat/UI-001-csv-export`)
   - Follow SHOOT→SKIN workflow from CLAUDE.md
   - Use AI persona prompts for planning
   - Link evidence artifacts in PR

2. **Monitor Dependabot PRs**
   - Review first batch of dependency update PRs
   - Merge security updates immediately
   - Batch version updates weekly

3. **Review First Copilot Comments**
   - Check if Copilot's suggestions are helpful
   - Adjust `.github/copilot-instructions.md` if needed
   - Share feedback with team

4. **Create GitHub Projects Board**
   - Use CLI: `gh project create --owner @me --title "ShopMatch Pro - Roadmap"`
   - Add Layer field: `gh project field-create ...`
   - Bulk-add issues from roadmap

---

## Reference: Exact Configuration Values

### Branch Naming Regex
```regex
^(feat|fix|perf|sec|docs|test|refactor|ci|build)\/[A-Z]+-\d{3,}-[a-z0-9-]+$
```

### Commit Message Regex
```regex
^(feat|fix|perf|sec|docs|test|refactor|ci|build)(\(\S+\))?:\s.+$
```

### PR Title Regex
```regex
^\[[A-Z]+-\d{3,}\]\s.+$
```

### Required CI Check Names (must match exactly)
1. `validate-branch`
2. `build (20.x)`
3. `accessibility`
4. `Measure first-load JS (Playwright)`

### Code Owner Paths (from .github/CODEOWNERS)
- `/src/app/api/stripe/**` → @RazonIn4K
- `/firestore.rules` → @RazonIn4K
- `/src/lib/firebase/**` → @RazonIn4K
- `/src/app/api/**` → @RazonIn4K
- `/.github/workflows/**` → @RazonIn4K
- `/docs/OBSERVABILITY.md` → @RazonIn4K

---

## Support Resources

- **GitHub Rulesets**: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets
- **CodeQL Setup**: https://docs.github.com/en/code-security/code-scanning/enabling-code-scanning/configuring-default-setup-for-code-scanning
- **Dependabot**: https://docs.github.com/en/code-security/dependabot
- **Secret Scanning**: https://docs.github.com/en/code-security/secret-scanning
- **Code Owners**: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners
- **Copilot Review**: https://docs.github.com/en/copilot/using-github-copilot/code-review

---

**Last Updated**: 2025-10-15
**Estimated Total Time**: 30-45 minutes
**Difficulty**: Moderate (requires careful attention to regex patterns and check names)
**Prerequisites**: Repository admin access, GitHub Copilot access (optional)

---

## Quick Start Checklist (Copy This)

```
[ ] 1. Create ruleset (15 min)
    [ ] Name: ShopMatch Pro - Main Branch Protection
    [ ] Status: Active
    [ ] Target: main
    [ ] Branch pattern: ^(feat|fix|perf|sec|docs|test|refactor|ci|build)\/[A-Z]+-\d{3,}-[a-z0-9-]+$
    [ ] Require PR + 1 approval + code owners
    [ ] Required checks: validate-branch, build (20.x), accessibility, Measure first-load JS
    [ ] Commit pattern: ^(feat|fix|...)(\(\S+\))?:\s.+$
    [ ] PR title pattern: ^\[[A-Z]+-\d{3,}\]\s.+$
    [ ] Block force push + require linear history

[ ] 2. Enable security (10 min)
    [ ] CodeQL Default setup
    [ ] Dependabot alerts
    [ ] Dependabot security updates
    [ ] Secret scanning
    [ ] Push protection

[ ] 3. Enable Copilot (5 min)
    [ ] Code review: Automatic mode

[ ] 4. Test (10 min)
    [ ] Create test PR with valid branch name
    [ ] Verify all checks run
    [ ] Verify code owner requested
    [ ] Verify Copilot reviews
```

Copy this checklist and check off items as you complete them!
