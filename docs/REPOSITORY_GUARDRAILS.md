# Repository Guardrails & Configuration Guide

**Purpose**: This document provides step-by-step instructions for configuring GitHub repository settings to enforce quality gates, security controls, and branch protection rules for ShopMatch Pro.

**Target Audience**: Repository administrators, DevOps engineers, project maintainers

**Last Updated**: 2025-10-15

---

## Table of Contents

1. [Branch Protection & Rulesets](#1-branch-protection--rulesets)
2. [Security Features](#2-security-features)
3. [Code Owners](#3-code-owners)
4. [GitHub Copilot Configuration](#4-github-copilot-configuration)
5. [Dependabot Configuration](#5-dependabot-configuration)
6. [Verification Checklist](#6-verification-checklist)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Branch Protection & Rulesets

### Overview
Rulesets enforce quality standards by requiring status checks, code reviews, and naming conventions before code can be merged into protected branches.

### Implementation Steps

#### A. Create Main Branch Ruleset

**Navigation**: `Settings` → `Rules` → `Rulesets` → `New ruleset`

**Configuration**:

```yaml
Name: "Main Branch Protection"
Enforcement status: Active
Target branches: Include: main

Rules to enable:
  ✅ Require a pull request before merging
    - Require approvals: 1
    - Dismiss stale reviews: Yes
    - Require review from Code Owners: Yes

  ✅ Require status checks to pass
    Required checks:
      - validate-branch (Validate Branch Name)
      - build (Build and Test) - Node 20.x
      - accessibility (Accessibility Testing)
      - First-load JS budget (Playwright)
    Require branches to be up to date: Yes

  ✅ Require conversation resolution before merging

  ✅ Block force pushes

  ✅ Require linear history

  ✅ Automatically request Copilot code review
```

**Docs**: [GitHub - Managing rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)

#### B. Add Branch Naming Rule

**Configuration**:

```yaml
Branch name pattern:
  Type: Require matching ref name
  Pattern: ^(feat|fix|perf|sec|docs|test|refactor|ci|build)\/[A-Z]+-[0-9]{3,}-[a-z0-9-]+$

Examples (valid):
  ✓ feat/UI-001-dashboard-layout
  ✓ fix/MP-127-auth-redirect-bug
  ✓ perf/PERF-042-bundle-optimization
  ✓ sec/SEC-015-stripe-webhook-validation

Examples (invalid):
  ✗ feature-branch
  ✗ MP-123-my-feature
  ✗ fix/bug-1
```

**Docs**: [GitHub - Branch name patterns](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets#restrict-creations)

#### C. Add Commit Message Rule

**Configuration**:

```yaml
Commit message pattern:
  Type: Require matching commit message
  Pattern: ^(feat|fix|perf|sec|docs|test|refactor|ci|build)(\(\S+\))?:\s.+$

Examples (valid):
  ✓ feat: add CSV export for applications
  ✓ fix(auth): resolve redirect loop on logout
  ✓ perf: optimize Firestore query with composite index
  ✓ sec(stripe): add rate limiting to webhook endpoint

Examples (invalid):
  ✗ Added new feature
  ✗ Bug fix
  ✗ WIP: testing stuff
```

**Format**: Follows [Conventional Commits](https://www.conventionalcommits.org/) standard

#### D. Add PR Title Rule

**Configuration**:

```yaml
PR title pattern:
  Type: Require matching pull request title
  Pattern: ^\[[A-Z]+-[0-9]{3,}\]\s.+$

Examples (valid):
  ✓ [UI-001] Add performance dashboard with Core Web Vitals
  ✓ [MP-127] Fix authentication redirect loop (L6)
  ✓ [SEC-015] Implement Stripe webhook rate limiting (L5/L6)

Examples (invalid):
  ✗ New feature
  ✗ Fix bug
  ✗ UI-001: Dashboard
```

**Docs**: [GitHub - Metadata restrictions](https://docs.github.com/en/enterprise-server@3.15/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository)

---

## 2. Security Features

### A. Enable CodeQL Code Scanning

**Purpose**: Automated security vulnerability detection

**Navigation**: `Settings` → `Security` → `Code security and analysis` → `Code scanning`

**Steps**:
1. Click **Set up** next to "Code scanning"
2. Select **Default** setup (recommended)
3. Languages: `JavaScript/TypeScript`
4. Query suite: `Default`
5. Click **Enable CodeQL**

**What it does**:
- Scans code on every push and PR
- Detects security vulnerabilities (SQL injection, XSS, auth issues)
- Creates alerts in Security tab
- Blocks merges if critical issues found (when configured in branch protection)

**Docs**: [GitHub - CodeQL](https://docs.github.com/en/code-security/code-scanning/enabling-code-scanning/configuring-default-setup-for-code-scanning)

### B. Enable Dependabot Alerts & Updates

**Purpose**: Automated dependency vulnerability detection and patching

**Navigation**: `Settings` → `Security` → `Code security and analysis`

**Steps**:
1. **Dependabot alerts** → Enable
   - Alerts you when dependencies have known vulnerabilities

2. **Dependabot security updates** → Enable
   - Automatically creates PRs to update vulnerable dependencies

3. **Dependabot version updates** → Already configured via `.github/dependabot.yml`
   - Creates PRs for routine dependency updates
   - Grouped by type (production, dev tools, types)
   - Follows Conventional Commits format

**Configuration File**: `.github/dependabot.yml` (already created)

**Docs**: [GitHub - Dependabot](https://docs.github.com/en/code-security/supply-chain-security/keeping-your-dependencies-updated-automatically/about-dependabot-version-updates)

### C. Enable Secret Scanning with Push Protection

**Purpose**: Prevent secrets (API keys, tokens) from being committed

**Navigation**: `Settings` → `Security` → `Code security and analysis` → `Secret scanning`

**Steps**:
1. **Secret scanning** → Enable
   - Scans repository for exposed secrets

2. **Push protection** → Enable
   - Blocks pushes containing secrets
   - Developer must remove secret or request bypass (logged)

**What gets scanned**:
- API keys (Stripe, Firebase, etc.)
- Private keys and certificates
- OAuth tokens
- Database connection strings

**Bypass procedure** (for false positives):
1. Secret scanning blocks push
2. Developer verifies it's safe (e.g., mock test key)
3. Developer bypasses with reason (logged for audit)
4. Security team reviews bypass logs weekly

**Docs**: [GitHub - Secret scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)

---

## 3. Code Owners

### Overview
CODEOWNERS file automatically requests reviews from designated owners when specific paths are modified.

### Configuration File

**Location**: `.github/CODEOWNERS` (already created)

**Key Paths**:
- Stripe integration: `@RazonIn4K`
- Firebase Auth & Firestore: `@RazonIn4K`
- API routes: `@RazonIn4K`
- CI/CD workflows: `@RazonIn4K`
- Security docs: `@RazonIn4K`

### Enable Code Owner Reviews

**Navigation**: `Settings` → `Branches` → `Branch protection rules` or `Rulesets`

**Configuration**:
- ✅ Require review from Code Owners (enabled in ruleset)

**What it does**:
- Automatically requests review from code owners
- PR cannot be merged until code owner approves
- Ensures critical paths always get expert review

**Docs**: [GitHub - Code Owners](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners)

---

## 4. GitHub Copilot Configuration

### A. Enable Copilot Code Review

**Purpose**: Automated PR reviews using AI

**Navigation**: `Settings` → `Copilot` → `Code review`

**Steps**:
1. Enable **GitHub Copilot code review**
2. Select **Automatic** mode (reviews all PRs automatically)
3. Copilot will use `.github/copilot-instructions.md` for review guidelines

**Configuration File**: `.github/copilot-instructions.md` (already created)

**Review Guidelines Include**:
- 8 core review standards (type safety, security, performance, accessibility, etc.)
- 10-point review checklist
- Common issues to flag (Critical/High/Medium/Low priority)
- Links to key documentation

**Docs**: [GitHub - Copilot Code Review](https://docs.github.com/en/copilot/using-github-copilot/code-review/configuring-automatic-code-review-by-copilot)

### B. Configure Copilot Custom Instructions

**Location**: `.github/copilot-instructions.md` (already created)

**Role**: Staff Line Reviewer & Test-Coverage Buddy

**Focus Areas**:
1. Type safety (strict TypeScript, Zod validation)
2. Security (auth, rate-limiting, secrets)
3. Performance (≤300KB, code-splitting)
4. Accessibility (zero axe violations)
5. Firestore (rules, indexes, security)
6. Stripe (webhooks, no PII logging)
7. Testing (unit + E2E required)
8. Observability (events, structured logging)

---

## 5. Dependabot Configuration

### Overview
Dependabot automatically creates PRs to update dependencies when vulnerabilities are found or new versions are released.

### Configuration File

**Location**: `.github/dependabot.yml` (already created)

**Schedule**:
- NPM dependencies: Daily at 3 AM UTC
- GitHub Actions: Weekly on Mondays at 3 AM UTC

**Grouping Strategy**:
- Production dependencies grouped (patch/minor updates)
- Type definitions grouped
- Development tools grouped
- Major version updates excluded (require manual review)

**Commit Message Format**:
- Follows Conventional Commits
- Examples:
  - `deps: update next from 15.0.0 to 15.0.1`
  - `deps(dev): update @types/node from 20.0.0 to 20.1.0`
  - `ci: update actions/checkout from v3 to v4`

### Managing Dependabot PRs

**Best Practices**:
1. Review Dependabot PRs daily
2. Check CI status (all checks must pass)
3. Review changelog links in PR description
4. Merge security updates immediately
5. Batch version updates weekly

**PR Volume Management**:
- Limit: 10 open NPM PRs, 5 GitHub Actions PRs
- Grouped updates reduce noise
- Major versions ignored (breaking changes)

---

## 6. Verification Checklist

Use this checklist to verify all guardrails are properly configured:

### Branch Protection
- [ ] Ruleset created for `main` branch
- [ ] Branch naming regex enforced: `type/ID-slug`
- [ ] Commit message regex enforced: Conventional Commits
- [ ] PR title regex enforced: `[ID] Description`
- [ ] Required status checks enabled:
  - [ ] validate-branch
  - [ ] build (Node 20.x)
  - [ ] accessibility
  - [ ] First-load JS budget
- [ ] Require code owner approval enabled
- [ ] Automatically request Copilot review enabled
- [ ] Block force pushes enabled
- [ ] Require linear history enabled

### Security
- [ ] CodeQL code scanning enabled (Default setup)
- [ ] Dependabot alerts enabled
- [ ] Dependabot security updates enabled
- [ ] Dependabot version updates configured (`.github/dependabot.yml`)
- [ ] Secret scanning enabled
- [ ] Push protection enabled

### Code Owners
- [ ] `.github/CODEOWNERS` file exists
- [ ] Critical paths assigned:
  - [ ] Stripe integration
  - [ ] Firebase Auth & Firestore
  - [ ] API routes
  - [ ] CI/CD workflows
  - [ ] Security docs
- [ ] "Require review from Code Owners" enabled

### GitHub Copilot
- [ ] Copilot code review enabled
- [ ] Automatic mode selected
- [ ] `.github/copilot-instructions.md` file exists
- [ ] Custom instructions include all 8 review standards

### Dependencies
- [ ] `.github/dependabot.yml` file exists
- [ ] NPM updates scheduled (daily)
- [ ] GitHub Actions updates scheduled (weekly)
- [ ] Grouping configured (production, dev tools, types)
- [ ] Conventional Commits format configured

---

## 7. Troubleshooting

### Problem: Status Checks Not Appearing

**Symptoms**: Required checks show as "Expected" but never run

**Solutions**:
1. Verify job names in `.github/workflows/ci.yml` match ruleset exactly
2. Check that CI workflow triggers on `pull_request` events
3. Wait for one PR to run CI, then add checks to ruleset
4. Ensure branch is up-to-date with base branch

### Problem: Branch Name Validation Failing

**Symptoms**: Valid branch names rejected by `validate-branch` job

**Solutions**:
1. Verify regex in `.github/workflows/ci.yml` line 24
2. Check that ID has 3+ digits (e.g., `UI-001` not `UI-1`)
3. Ensure lowercase slug with hyphens only (no underscores)
4. Test regex: https://regex101.com/

### Problem: Code Owner Not Requested

**Symptoms**: PR created but code owner not auto-requested

**Solutions**:
1. Verify `.github/CODEOWNERS` file exists and is valid
2. Check that "Require review from Code Owners" is enabled in ruleset
3. Verify file paths in PR match patterns in CODEOWNERS
4. Ensure code owner GitHub username is correct (`@username`)

### Problem: Copilot Review Not Running

**Symptoms**: Copilot doesn't comment on PR

**Solutions**:
1. Verify Copilot is enabled: `Settings` → `Copilot` → `Code review`
2. Check that `.github/copilot-instructions.md` exists
3. Ensure automatic mode is selected
4. Wait 2-3 minutes (Copilot reviews are async)
5. Check repository has Copilot license

### Problem: Dependabot PRs Not Creating

**Symptoms**: No Dependabot PRs despite outdated dependencies

**Solutions**:
1. Verify `.github/dependabot.yml` syntax (YAML is valid)
2. Check Dependabot alerts enabled: `Settings` → `Security`
3. Verify schedule time hasn't passed yet (UTC time)
4. Check open-pull-requests-limit not exceeded
5. Review Dependabot logs: `Insights` → `Dependency graph` → `Dependabot`

### Problem: Secret Scanning False Positives

**Symptoms**: Push blocked for test data or mock keys

**Solutions**:
1. Verify it's actually a test key (never bypass real secrets!)
2. Use bypass procedure: provide reason, bypass is logged
3. Consider adding mock keys to `.env.example` instead of code
4. Use generic placeholder formats: `sk_test_MOCK_KEY_FOR_TESTING`

---

## 8. Maintenance Schedule

### Daily
- [ ] Review Dependabot security update PRs (merge immediately)
- [ ] Check CodeQL scan results for new vulnerabilities

### Weekly
- [ ] Review and merge Dependabot version update PRs
- [ ] Check secret scanning bypass logs for anomalies
- [ ] Review Copilot review comments for patterns

### Monthly
- [ ] Review code owner effectiveness (response time, approval rate)
- [ ] Audit branch protection bypass logs
- [ ] Review ignored dependencies for major version adoption
- [ ] Update this document if workflows or tools change

### Quarterly
- [ ] Review and update `.github/copilot-instructions.md`
- [ ] Audit security findings and adjust thresholds
- [ ] Review Dependabot grouping strategy (too many/few PRs?)
- [ ] Update CODEOWNERS if team structure changes

---

## 9. Related Documentation

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development workflow and branch naming
- [SECURITY.md](./SECURITY.md) - Security policies and threat model
- [TESTING.md](./TESTING.md) - Quality gates and budgets
- [.github/copilot-instructions.md](../.github/copilot-instructions.md) - Copilot review guidelines
- [.github/CODEOWNERS](../.github/CODEOWNERS) - Code ownership matrix
- [.github/dependabot.yml](../.github/dependabot.yml) - Dependency update configuration

---

## 10. Quick Reference

### Regex Patterns

**Branch Name**:
```regex
^(feat|fix|perf|sec|docs|test|refactor|ci|build)\/[A-Z]+-[0-9]{3,}-[a-z0-9-]+$
```

**Commit Message** (Conventional Commits):
```regex
^(feat|fix|perf|sec|docs|test|refactor|ci|build)(\(\S+\))?:\s.+$
```

**PR Title**:
```regex
^\[[A-Z]+-[0-9]{3,}\]\s.+$
```

### Required CI Checks

1. `validate-branch` - Branch naming validation
2. `build` (Node 20.x) - Build and test
3. `accessibility` - Axe-core accessibility testing
4. `First-load JS budget (Playwright)` - Performance budget

### Key Files

- `.github/workflows/ci.yml` - CI pipeline
- `.github/CODEOWNERS` - Code ownership
- `.github/copilot-instructions.md` - Copilot guidelines
- `.github/dependabot.yml` - Dependency updates
- `.github/pull_request_template.md` - PR template with DoR/DoD

---

**Last Updated**: 2025-10-15
**Maintained By**: @RazonIn4K
**Questions?**: Open an issue or refer to [CONTRIBUTING.md](../CONTRIBUTING.md)
