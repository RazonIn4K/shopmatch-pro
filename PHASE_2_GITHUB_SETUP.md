# Phase 2: GitHub Settings Configuration (15 Minutes)

**Status**: Ready to execute
**Prerequisites**: ✅ CODEOWNERS committed (commit `1ded310`)
**URL Base**: https://github.com/RazonIn4K/shopmatch-pro

---

## Step 1: Create Repository Labels (2 min)

**URL**: https://github.com/RazonIn4K/shopmatch-pro/labels

Click **"New label"** three times and create:

| Label Name  | Color Code | Description                          |
|-------------|------------|--------------------------------------|
| `automated` | `#0E8A16`  | Automated dependency updates         |
| `ci`        | `#0052CC`  | Continuous integration & deployment  |
| `security`  | `#D93F0B`  | Security-related changes             |

**How to enter color**:
- Click color picker
- Paste hex code (e.g., `#0E8A16`)
- OR select from palette

**Verification**: Visit /labels → all 3 labels visible

---

## Step 2: Enable Security Features (4 min)

**URL**: https://github.com/RazonIn4K/shopmatch-pro/settings/security_analysis

### 2.1 Dependabot (Top Section)

**Dependabot alerts**:
- ✅ Click **"Enable"** if not already on
- Shows vulnerable dependencies in Security tab

**Dependabot security updates**:
- ✅ Click **"Enable"**
- Auto-creates PRs for security vulnerabilities
- Uses labels: `security`, `automated`

**Dependabot version updates**:
- Should show: **"Enabled via configuration file"**
- Managed by `.github/dependabot.yml` (already committed)
- No action needed

### 2.2 Code Scanning (Middle Section)

**CodeQL analysis**:
1. Find "Code scanning" section
2. Click **"Set up"** → **"Default"**
3. Configuration modal appears:
   - **Languages**: JavaScript/TypeScript (auto-detected)
   - **Query suites**: Default
   - **Events**: Push, Pull Request, Schedule
4. Click **"Enable CodeQL"**
5. **WAIT**: Initial scan takes ~5 minutes (check Actions tab)

**What CodeQL detects**:
- SQL injection, XSS, command injection
- Path traversal, insecure randomness
- Hard-coded credentials, weak crypto

### 2.3 Secret Scanning (Bottom Section)

**Secret scanning**:
- ✅ Click **"Enable"**
- Scans commits for 200+ secret patterns

**Push protection**:
- ✅ Click **"Enable"**
- **Blocks git push** if secrets detected

**Verification**: All 4 features show green "Enabled" status

---

## Step 3: Enable Copilot Auto-Review (2 min)

**URL**: https://github.com/RazonIn4K/shopmatch-pro/settings/copilot

### 3.1 Enable Feature

**Automatically review code in pull requests**:
- Toggle to **ON** (blue)

**When triggered**:
- Select **"Automatically on new pull requests"**
- Alternative: "On request" (requires `/copilot review` comment)

**Review guidelines**:
- Should show: **"Using `.github/copilot-instructions.md`"**
- File already committed (commit `e852e2f`)

### 3.2 What Copilot Reviews

Your `.github/copilot-instructions.md` enforces 8 standards:
1. Type Safety (no `any` types)
2. Security (input validation, XSS/SQLi prevention)
3. Performance (bundle budgets, lazy loading)
4. Accessibility (ARIA, keyboard nav)
5. Error Handling (try/catch, user-facing errors)
6. Code Quality (DRY, single responsibility)
7. Testing (unit/component/E2E coverage)
8. Documentation (JSDoc, inline comments)

**Verification**: Create test PR → Copilot comment appears within 2 min

---

## Step 4: Create Branch Protection Ruleset (7 min - ENHANCED)

**URL**: https://github.com/RazonIn4K/shopmatch-pro/settings/rules

### 4.1 Create New Ruleset

1. Click **"New ruleset"** (top right)
2. Select **"New branch ruleset"**

### 4.2 Ruleset Details

**Ruleset name**: `main-branch-protection`

**Enforcement status**: **Active** ⚠️ (enforces immediately)

**Bypass list** (optional):
- Leave empty OR add your username for emergency access
- All bypasses are logged

**Target branches**:
- ✅ **Include default branch** (automatically targets `main`)

### 4.3 Branch Protections (11 settings total)

#### ✅ Require Pull Request Before Merging
- [x] **Enable**
- **Required approvals**: `1`
- [x] **⭐ Require branches to be up to date before merging** (NEW)
- [x] **⭐ Dismiss stale pull request approvals when new commits are pushed** (NEW)
- [x] **Require review from Code Owners** (enforces `.github/CODEOWNERS`)
- [x] **Require approval of the most recent reviewable push**

#### ✅ Require Status Checks to Pass
- [x] **Enable**
- [x] **Require branches to be up to date before merging** (duplicate, already checked above)
- **Add required status checks** (click "Add checks"):

  **IMPORTANT**: Add these 4 checks NOW (5th added in Phase 7 after CodeQL scan completes)

  | Check Name                  | Why Required                         |
  |-----------------------------|--------------------------------------|
  | `build (20.x)`              | Production build must succeed        |
  | `validate-branch`           | Branch naming convention enforced    |
  | `First-load JS (Playwright)`| Bundle budget ≤ 300 KB              |
  | `Accessibility Tests`       | Zero WCAG violations                 |

  **Note**: If checks don't appear in dropdown:
  1. They must run at least once
  2. Create a test PR to trigger them
  3. Return here after checks complete

  **CodeQL will be added in Phase 7** (after initial scan completes)

#### ✅ Block Force Pushes
- [x] **Enable**
- Prevents `git push --force` to `main`

#### ✅ Require Linear History
- [x] **Enable**
- Prevents merge commits (rebase or squash only)

#### ⬜ Require Deployments to Succeed
- [ ] **Disable** (no deployment required for merge yet)

#### ⬜ Require Signed Commits
- [ ] **Disable** (optional security enhancement)

### 4.4 Additional Rules

#### ✅ Restrict Creations (Branch Naming)
- [x] **Enable**
- **Restrict creation of matching refs**: Click "Add restriction"
- **Pattern**:
  ```regex
  ^(feat|fix|perf|sec|docs|test|refactor|ci|build)/[A-Z]+-\d{3,}-[a-z0-9-]+$
  ```
- **Match type**: Regular expression

**Valid Examples**:
- ✅ `feat/UI-001-dashboard-layout`
- ✅ `fix/AUTH-127-login-redirect`
- ✅ `sec/SEC-015-stripe-webhook`

**Invalid Examples**:
- ❌ `feature/dashboard` (wrong type)
- ❌ `feat/ui-1-test` (ID not uppercase)
- ❌ `feat/UI-1-test` (ID < 3 digits)

#### ⬜ Restrict Updates
- [ ] **Disable** (covered by "Block force pushes")

#### ⬜ Restrict Deletions
- [ ] **Disable** (allow branch deletion after merge)

### 4.5 Metadata Restrictions (Optional)

**Require commit messages to match a pattern**:
- [ ] **Skip for now** (can add later if desired)
- Example pattern: `^(feat|fix|perf|sec|docs|test|refactor|ci|build)(\(.+\))?!?: .{1,100}`

### 4.6 Save Ruleset

1. Scroll to bottom
2. Click **"Create"** (green button)
3. Ruleset activates immediately

**Verification**:
- Settings → Rules → See `main-branch-protection` with "Active" status
- Try creating invalid branch: `git checkout -b bad-name` → push should fail

---

## Checkpoint After Phase 2

Verify all settings are active:

**Labels**:
- [ ] Visit /labels → see `automated`, `ci`, `security`

**Security**:
- [ ] Visit Security tab → see 4 features enabled:
  - Dependabot alerts
  - Code scanning (CodeQL)
  - Secret scanning
  - Security policy (SECURITY.md)

**Copilot**:
- [ ] Settings → Copilot → "Automatically review" shows ON

**Branch Protection**:
- [ ] Settings → Rules → `main-branch-protection` shows "Active"
- [ ] Required checks: 4 of 5 configured (CodeQL pending Phase 7)
- [ ] Protections enabled:
  - Require PR (1 approval)
  - Require review from Code Owners
  - Require branches up to date ⭐
  - Dismiss stale approvals ⭐
  - Block force pushes
  - Require linear history
  - Branch naming restriction

**CodeQL Scan**:
- [ ] Actions tab → CodeQL workflow running or completed
- [ ] Security → Code scanning → CodeQL results visible

**Estimated Time**: 15 minutes
**Blocking Issue**: If CodeQL scan hasn't completed, proceed to Phase 3 and return for Phase 7

---

## Troubleshooting

### "Can't find required status checks in dropdown"

**Cause**: Checks haven't run yet on any PR

**Fix**:
1. Proceed to Phase 3 (merge Dependabot PRs)
2. Those PRs will trigger all checks
3. Return here to add checks to ruleset

### "CodeQL setup button not appearing"

**Cause**: CodeQL may already be enabled OR repo doesn't qualify

**Fix**:
1. Check Actions tab for existing CodeQL workflow
2. If present, it's already enabled → skip to Phase 3

### "CODEOWNERS not detected"

**Cause**: File not in correct location or syntax error

**Fix**:
1. Verify file location: `.github/CODEOWNERS` (committed in Phase 0)
2. Check syntax: each line `<path> <@username>`
3. Refresh page (may take 1-2 min to detect)

---

## Next Step

After completing Phase 2 → Proceed to **Phase 3: PR Triage**

Use command:
```bash
gh pr list --state open
```

Then follow [PR_ACTION_PLAN.md](./PR_ACTION_PLAN.md) Phase 3 instructions.
