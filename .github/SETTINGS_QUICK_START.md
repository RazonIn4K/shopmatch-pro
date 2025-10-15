# GitHub Settings Quick Start (10-Minute Setup)

**Purpose**: Complete the repository guardrails by enabling security features, branch protection, and automated code review.

**Prerequisites**: Admin access to the repository

---

## Step 1: Create Repository Labels (2 min)

Dependabot PRs require these labels to auto-assign.

**Settings → Issues → Labels → New label**

Create these three labels:

| Label Name  | Color    | Description                          |
|-------------|----------|--------------------------------------|
| `automated` | `#0E8A16` | Automated dependency updates         |
| `ci`        | `#0052CC` | Continuous integration & deployment  |
| `security`  | `#D93F0B` | Security-related changes             |

**Verification**: Visit any Dependabot PR → should auto-apply these labels

---

## Step 2: Enable Security Features (3 min)

**Settings → Security → Code security and analysis**

Enable all four features:

### 2.1 Dependabot
- ✅ **Dependabot alerts** - Enabled (notifies about vulnerable dependencies)
- ✅ **Dependabot security updates** - Enabled (auto-creates PRs for security fixes)
- ✅ **Dependabot version updates** - Enabled (managed by `.github/dependabot.yml`)

### 2.2 Code Scanning
- ✅ **CodeQL analysis** - Click "Set up" → "Default" → "Enable CodeQL"
  - Scans for: SQL injection, XSS, command injection, path traversal
  - Runs on: Every push to `main`, every PR, weekly schedule

### 2.3 Secret Scanning
- ✅ **Secret scanning** - Enabled (detects accidentally committed secrets)
- ✅ **Push protection** - Enabled (blocks commits containing secrets)

**Verification**:
- Navigate to **Security → Code scanning** → should see "CodeQL" enabled
- Try committing a fake API key → should be blocked by push protection

---

## Step 3: Enable GitHub Copilot Auto-Review (2 min)

**Settings → Copilot → Code review**

- ✅ **Automatically review code in pull requests** - Enable
- ✅ **When triggered** - Set to "Automatically on new pull requests"
- ✅ **Guidelines** - Pre-configured via `.github/copilot-instructions.md`

**What it does**:
- Auto-reviews PRs against 8 core standards (type safety, security, performance, accessibility)
- Flags common issues (Critical/High/Medium/Low severity)
- Checks: Error handling, input validation, performance patterns, a11y

**Verification**: Create a test PR → Copilot should add review comment within 1-2 minutes

---

## Step 4: Configure Branch Protection Ruleset (3 min)

**Settings → Rules → Rulesets → New ruleset → New branch ruleset**

### 4.1 Ruleset Details
- **Ruleset Name**: `main-branch-protection`
- **Enforcement status**: **Active**
- **Target branches**: `Include default branch` (main)

### 4.2 Branch Protections

**Require a pull request before merging**:
- ✅ Enable
- **Required approvals**: `1`
- ✅ **Dismiss stale pull request approvals when new commits are pushed**
- ✅ **Require review from Code Owners** (enforces `.github/CODEOWNERS`)

**Require status checks to pass**:
- ✅ Enable
- ✅ **Require branches to be up to date before merging**
- **Required status checks** (add these 5):
  1. `build (20.x)` - Production build verification
  2. `First-load JS (Playwright)` - Bundle budget enforcement
  3. `Accessibility Tests` - axe-core WCAG validation
  4. `CodeQL` - Security vulnerability scanning
  5. `validate-branch` - Branch naming convention enforcement

**Require linear history**:
- ✅ Enable (prevents merge commits, keeps git log clean)

**Block force pushes**:
- ✅ Enable

### 4.3 Additional Rules

**Restrict creations**:
- Pattern: `^(feat|fix|perf|sec|docs|test|refactor|ci|build)\/[A-Z]+-\d{3,}-[a-z0-9-]+$`
- Explanation: Enforces `type/ID-slug` branch naming (e.g., `feat/SHOP-001-job-posting`)

**Require commit message format** (optional):
- Pattern: `^(feat|fix|perf|sec|docs|test|refactor|ci|build)(\(.+\))?!?: .{1,100}`
- Explanation: Enforces Conventional Commits format

**Save Ruleset**

**Verification**:
- Try creating branch `bad-branch-name` → should fail validation
- Try creating branch `feat/SHOP-001-test` → should succeed
- Create PR without required checks passing → should block merge

---

## Step 5: Verify CODEOWNERS Integration (1 min)

**Settings → Code security and analysis → Code owners**

You should see:
- ✅ **CODEOWNERS file detected** - `.github/CODEOWNERS`
- List of code owner rules (Stripe, Firebase, API routes, CI, etc.)

**How it works**:
- When PR touches files in CODEOWNERS, GitHub auto-requests review from designated owner
- If "Require review from Code Owners" is enabled in ruleset, merge is blocked until owner approves

**Verification**:
- Create PR touching `src/lib/stripe/` → should auto-request review from yourself
- Merge button should be disabled until code owner approves

---

## Verification Checklist

After completing all steps, verify:

- [ ] **Labels exist**: `automated`, `ci`, `security` visible in Settings → Issues → Labels
- [ ] **Security enabled**: Visit Security tab → see CodeQL, Dependabot, Secret Scanning active
- [ ] **Copilot auto-review**: Create test PR → Copilot comment appears within 2 min
- [ ] **Branch protection active**:
  - [ ] Invalid branch name blocked
  - [ ] PR requires 1 approval
  - [ ] PR requires all 5 status checks to pass
  - [ ] Code owner approval required for protected paths
- [ ] **CODEOWNERS working**: PR touching Stripe/Firebase auto-requests review

---

## Next Steps

1. **Update CI workflow** - Ensure `.github/workflows/ci.yml` includes:
   - `npm run build` (for "build (20.x)" check)
   - `npm run test:a11y` (for "Accessibility Tests" check)
   - First-load JS measurement job (already present)
   - Branch name validation (already present)

2. **Test end-to-end**:
   - Create branch: `feat/SHOP-999-test-guardrails`
   - Make trivial change (edit README.md)
   - Create PR
   - Verify: Copilot review + 5 required checks + code owner request

3. **Merge Dependabot PRs**:
   - Once labels are created, Dependabot PRs should auto-apply them
   - Merge **#6** (actions/checkout@v5) after checks pass
   - Merge **#7** (actions/setup-node@v6) after checks pass

4. **Document exceptions**:
   - Add bypass rules to ruleset if needed (e.g., Dependabot can bypass approvals)
   - Document in [docs/REPOSITORY_GUARDRAILS.md](../docs/REPOSITORY_GUARDRAILS.md)

---

## Troubleshooting

### "Required status checks not available"
**Cause**: Checks must run at least once before they can be required.

**Fix**:
1. Create a test PR to trigger all checks
2. Wait for checks to complete
3. Return to Rulesets → Edit → Add checks (they should now appear in dropdown)

### "CODEOWNERS not triggering review requests"
**Cause**: "Require review from Code Owners" not enabled in ruleset.

**Fix**:
1. Settings → Rules → Rulesets → Edit `main-branch-protection`
2. Scroll to "Require a pull request before merging"
3. Enable "Require review from Code Owners"

### "Copilot not reviewing PRs"
**Cause**: Copilot code review not enabled or no `.github/copilot-instructions.md` file.

**Fix**:
1. Verify `.github/copilot-instructions.md` exists on `main` branch
2. Settings → Copilot → Code review → Enable "Automatically review code"
3. Create new PR (not existing ones) to trigger review

### "CodeQL not running"
**Cause**: CodeQL setup incomplete or languages not detected.

**Fix**:
1. Security → Code scanning → CodeQL → "Set up"
2. Choose "Default" configuration (auto-detects TypeScript/JavaScript)
3. Wait 2-3 minutes for initial scan
4. Check Actions tab for CodeQL workflow runs

---

## References

- [docs/REPOSITORY_GUARDRAILS.md](../docs/REPOSITORY_GUARDRAILS.md) - Complete setup guide with screenshots
- [docs/GITHUB_GUI_SETUP_CHECKLIST.md](../docs/GITHUB_GUI_SETUP_CHECKLIST.md) - Step-by-step GUI instructions
- [docs/RULESET_QUICK_REFERENCE.md](../docs/RULESET_QUICK_REFERENCE.md) - Branch protection patterns
- [.github/CODEOWNERS](./.github/CODEOWNERS) - Code ownership matrix
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) - Copilot review standards

---

**Estimated Time**: 10 minutes for initial setup, 5 minutes for verification

**Questions?** Refer to [docs/REPOSITORY_GUARDRAILS.md](../docs/REPOSITORY_GUARDRAILS.md) for detailed explanations and troubleshooting.
